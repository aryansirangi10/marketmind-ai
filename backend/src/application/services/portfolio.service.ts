// ==============================================================================
// Portfolio Service (Business Logic Orchestrator)
// ==============================================================================

import { Transaction, AssetType } from "@prisma/client";
import { PortfolioRepository } from "../../infrastructure/repositories/portfolio.repository";
import { ProviderRegistry } from "../../infrastructure/config/provider-registry";
import { PrismaService } from "../../infrastructure/database/prisma.service";

export interface Holding {
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValuation: number;
  gainLoss: number;
  gainLossPercentage: number;
}

export interface PortfolioSummary {
  portfolioId: string;
  name: string;
  cashBalance: number;
  holdingsValue: number;
  totalValue: number;
  holdings: Holding[];
}

export class PortfolioService {
  private readonly portfolioRepo = new PortfolioRepository();
  private readonly db = PrismaService.getClient();

  /**
   * Executes a BUY order for a paper trading portfolio
   */
  public async buyAsset(
    portfolioId: string,
    symbol: string,
    quantity: number,
    pricePerUnit: number,
    assetType: AssetType
  ): Promise<Transaction> {
    if (quantity <= 0 || pricePerUnit <= 0) {
      throw new Error("Quantity and price must be greater than zero.");
    }

    const totalCost = quantity * pricePerUnit;
    const fee = totalCost * 0.001; // 0.1% transaction fee

    // Transaction run using prisma transaction
    return this.db.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.findUnique({
        where: { id: portfolioId }
      });

      if (!portfolio) {
        throw new Error("Portfolio not found.");
      }

      if (portfolio.balance < totalCost + fee) {
        throw new Error(`Insufficient funds. Required: $${(totalCost + fee).toFixed(2)}, Available: $${portfolio.balance.toFixed(2)}`);
      }

      // Upsert Asset in database
      const cleanSymbol = symbol.toUpperCase();
      const assetName = assetType === AssetType.CRYPTO ? `${cleanSymbol} Coin` : `${cleanSymbol} Inc.`;
      const asset = await tx.asset.upsert({
        where: { symbol: cleanSymbol },
        update: { name: assetName, type: assetType },
        create: { symbol: cleanSymbol, name: assetName, type: assetType }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          type: "BUY",
          quantity,
          pricePerUnit,
          fee
        }
      });

      // Deduct balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: portfolio.balance - (totalCost + fee)
        }
      });

      return transaction;
    });
  }

  /**
   * Executes a SELL order for a paper trading portfolio
   */
  public async sellAsset(
    portfolioId: string,
    symbol: string,
    quantity: number,
    pricePerUnit: number
  ): Promise<Transaction> {
    if (quantity <= 0 || pricePerUnit <= 0) {
      throw new Error("Quantity and price must be greater than zero.");
    }

    const cleanSymbol = symbol.toUpperCase();

    return this.db.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.findUnique({
        where: { id: portfolioId }
      });

      if (!portfolio) {
        throw new Error("Portfolio not found.");
      }

      const asset = await tx.asset.findUnique({
        where: { symbol: cleanSymbol }
      });

      if (!asset) {
        throw new Error(`Asset ${cleanSymbol} not found in database.`);
      }

      // Calculate current holdings of this asset
      const transactions = await tx.transaction.findMany({
        where: {
          portfolioId: portfolio.id,
          assetId: asset.id
        }
      });

      let netQty = 0;
      transactions.forEach(t => {
        if (t.type === "BUY") netQty += t.quantity;
        else if (t.type === "SELL") netQty -= t.quantity;
      });

      // Rounding check to prevent floating point inaccuracies
      if (Number(netQty.toFixed(6)) < quantity) {
        throw new Error(`Insufficient asset quantity. Owned: ${netQty.toFixed(4)}, Attempted Sell: ${quantity}`);
      }

      const totalGain = quantity * pricePerUnit;
      const fee = totalGain * 0.001; // 0.1% fee

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          portfolioId: portfolio.id,
          assetId: asset.id,
          type: "SELL",
          quantity,
          pricePerUnit,
          fee
        }
      });

      // Add to balance
      await tx.portfolio.update({
        where: { id: portfolio.id },
        data: {
          balance: portfolio.balance + (totalGain - fee)
        }
      });

      return transaction;
    });
  }

  /**
   * Aggregates transactions and fetches current prices to build holding evaluations
   */
  public async getSummary(portfolioId: string): Promise<PortfolioSummary> {
    const portfolio = await this.portfolioRepo.findWithTransactions(portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found.");
    }

    // Group transactions by asset
    const assetTransactions: Record<string, { symbol: string; name: string; type: AssetType; txs: Transaction[] }> = {};

    portfolio.transactions.forEach(tx => {
      const assetId = tx.assetId;
      if (!assetTransactions[assetId]) {
        assetTransactions[assetId] = {
          symbol: tx.asset.symbol,
          name: tx.asset.name,
          type: tx.asset.type,
          txs: []
        };
      }
      assetTransactions[assetId].txs.push(tx);
    });

    const holdings: Holding[] = [];
    let holdingsValue = 0;

    const stockProvider = ProviderRegistry.getStockProvider();
    const cryptoProvider = ProviderRegistry.getCryptoProvider();

    // Process holdings for each asset
    for (const assetId of Object.keys(assetTransactions)) {
      const entry = assetTransactions[assetId];
      const txs = entry.txs.sort((a, b) => a.transactionDate.getTime() - b.transactionDate.getTime());

      let currentQty = 0;
      let totalCostBasis = 0; // Total cash spent on remaining assets

      txs.forEach(t => {
        if (t.type === "BUY") {
          currentQty += t.quantity;
          totalCostBasis += (t.quantity * t.pricePerUnit) + t.fee;
        } else {
          // Weighted average cost basis reduction on sale
          const costBasisPerUnit = currentQty > 0 ? totalCostBasis / currentQty : 0;
          currentQty -= t.quantity;
          totalCostBasis -= (t.quantity * costBasisPerUnit);
        }
      });

      // If we still hold shares/coins
      if (Number(currentQty.toFixed(6)) > 0) {
        let currentPrice = 0;
        try {
          if (entry.type === AssetType.CRYPTO) {
            const quote = await cryptoProvider.getQuote(`${entry.symbol}USDT`);
            currentPrice = quote.price;
          } else {
            const quote = await stockProvider.getQuote(entry.symbol);
            currentPrice = quote.currentPrice;
          }
        } catch (err) {
          // Fallback to average buy price if API fetch fails
          currentPrice = currentQty > 0 ? totalCostBasis / currentQty : 0;
        }

        const averageBuyPrice = totalCostBasis / currentQty;
        const totalCost = totalCostBasis;
        const currentValuation = currentQty * currentPrice;
        const gainLoss = currentValuation - totalCost;
        const gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        holdingsValue += currentValuation;

        holdings.push({
          symbol: entry.symbol,
          name: entry.name,
          type: entry.type,
          quantity: Number(currentQty.toFixed(6)),
          averageBuyPrice: Number(averageBuyPrice.toFixed(2)),
          currentPrice: Number(currentPrice.toFixed(2)),
          totalCost: Number(totalCost.toFixed(2)),
          currentValuation: Number(currentValuation.toFixed(2)),
          gainLoss: Number(gainLoss.toFixed(2)),
          gainLossPercentage: Number(gainLossPercentage.toFixed(2))
        });
      }
    }

    const totalValue = portfolio.balance + holdingsValue;

    // Proactively save this to history asynchronously
    this.savePortfolioHistory(portfolio.id, totalValue, portfolio.balance).catch(() => {});

    return {
      portfolioId: portfolio.id,
      name: portfolio.name,
      cashBalance: Number(portfolio.balance.toFixed(2)),
      holdingsValue: Number(holdingsValue.toFixed(2)),
      totalValue: Number(totalValue.toFixed(2)),
      holdings
    };
  }

  private async savePortfolioHistory(portfolioId: string, totalValue: number, cashBalance: number): Promise<void> {
    try {
      await this.db.portfolioHistory.create({
        data: {
          portfolioId,
          totalValue,
          cashBalance
        }
      });
    } catch (err) {
      // Fail silently for background job
    }
  }
}
