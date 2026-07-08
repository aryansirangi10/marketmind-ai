// ==============================================================================
// Asynchronous Background Job and Alert Evaluation Service
// ==============================================================================

import { PrismaService } from "../../infrastructure/database/prisma.service";
import { providerRegistry } from "../../infrastructure/config/provider-registry";
import { logger } from "../../infrastructure/logging/logger";
import { AlertCondition } from "@prisma/client";

class JobQueueService {
  private prisma = PrismaService.getClient();
  private intervalId: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startBackgroundWorker();
  }

  /**
   * Starts a background polling sweep (simulating a BullMQ/worker daemon)
   */
  public startBackgroundWorker() {
    if (this.intervalId) return;

    logger.info("Initializing background alert worker job...");
    this.intervalId = setInterval(async () => {
      await this.evaluateAlerts();
    }, 10000); // Evaluates every 10 seconds
  }

  /**
   * Stops the background worker polling sweep
   */
  public stopBackgroundWorker() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Background alert worker stopped.");
    }
  }

  /**
   * Evaluates all untriggered database alerts against current live asset prices
   */
  private async evaluateAlerts() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find all pending alerts
      const activeAlerts = await this.prisma.alert.findMany({
        where: { isTriggered: false },
        include: { asset: true }
      });

      if (activeAlerts.length === 0) {
        this.isProcessing = false;
        return;
      }

      logger.debug(`Background alert worker sweeping ${activeAlerts.length} active alerts...`);

      for (const alert of activeAlerts) {
        const symbol = alert.asset.symbol;
        const currentPrice = await this.getCurrentPrice(symbol, alert.asset.type);

        if (currentPrice === null) continue;

        let shouldTrigger = false;

        if (alert.condition === AlertCondition.ABOVE && currentPrice >= alert.triggerPrice) {
          shouldTrigger = true;
        } else if (alert.condition === AlertCondition.BELOW && currentPrice <= alert.triggerPrice) {
          shouldTrigger = true;
        }

        if (shouldTrigger) {
          await this.prisma.alert.update({
            where: { id: alert.id },
            data: {
              isTriggered: true,
              triggeredAt: new Date()
            }
          });

          // Log and audit the trigger
          logger.warn({
            msg: `ALERT TRIGGERED: ${symbol} has crossed ${alert.condition} ${alert.triggerPrice} (Current: ${currentPrice})`,
            userId: alert.userId,
            alertId: alert.id,
            symbol,
            triggerPrice: alert.triggerPrice,
            currentPrice
          });
        }
      }
    } catch (err: any) {
      logger.error(`Error sweeping alerts in background worker: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Helper function to fetch the current asset price from the provider registry
   */
  private async getCurrentPrice(symbol: string, type: string): Promise<number | null> {
    try {
      if (type === "STOCK") {
        const quote = await providerRegistry.stockProvider.getQuote(symbol);
        return quote.price;
      } else {
        const price = await providerRegistry.cryptoProvider.getPrice(symbol);
        return price;
      }
    } catch {
      return null;
    }
  }
}

export const jobQueueService = new JobQueueService();
export default jobQueueService;
