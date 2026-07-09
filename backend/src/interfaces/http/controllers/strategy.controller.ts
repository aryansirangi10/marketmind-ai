// ==============================================================================
// Strategy REST Controller (No-Code Configs & Backtest Simulations)
// ==============================================================================

import { Request, Response } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { BacktesterService } from "../../../application/services/backtester.service";

export class StrategyController {
  private static prisma = PrismaService.getClient();

  /**
   * Saves strategy workflow configurations
   * POST /strategies/save
   */
  public static async saveStrategy(req: Request, res: Response): Promise<Response> {
    try {
      const { name, type, parameters } = req.body;
      const userId = req.user?.userId || "mock-user-id";

      const strategy = await this.prisma.strategy.create({
        data: {
          name,
          type,
          parameters: typeof parameters === "string" ? JSON.parse(parameters) : parameters,
          userId
        }
      });

      return res.status(201).json({ success: true, data: strategy });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Retrieves saved strategies for a user
   * GET /strategies/list
   */
  public static async listStrategies(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId || "mock-user-id";
      const strategies = await this.prisma.strategy.findMany({
        where: { userId }
      });
      return res.status(200).json({ success: true, data: strategies });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Triggers a historical strategy backtesting simulation
   * POST /strategies/backtest
   */
  public static async backtestStrategy(req: Request, res: Response): Promise<Response> {
    try {
      const { strategyName, symbol, workflow, startCapital } = req.body;
      const userId = req.user?.userId || "mock-user-id";

      // Fetch simulated candles (or default mock bars)
      const candles = generateMockCandles();

      const results = await BacktesterService.runSimulation(
        userId,
        strategyName,
        symbol,
        workflow,
        candles,
        startCapital
      );

      return res.status(200).json({ success: true, data: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

// ------------------------------------------------------------------------------
// Helper generating historical bars series for strategy testing
// ------------------------------------------------------------------------------
function generateMockCandles() {
  const candles = [];
  let price = 150.0;
  const now = Math.floor(Date.now() / 1000);
  
  for (let i = 100; i >= 0; i--) {
    const time = now - i * 24 * 60 * 60;
    const change = (Math.random() - 0.48) * 4.0; // slight upward drift
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 2.0;
    const low = Math.min(open, close) - Math.random() * 2.0;
    price = close;
    
    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 100000) + 10000
    });
  }
  return candles;
}
