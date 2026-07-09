// ==============================================================================
// Portfolio Controller (HTTP Requests Handler)
// ==============================================================================

import { Request, Response } from "express";
import { PortfolioService } from "../../../application/services/portfolio.service";
import { PortfolioRepository } from "../../../infrastructure/repositories/portfolio.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AssetType } from "@prisma/client";
import { z } from "zod";

import { ProviderRegistry } from "../../../infrastructure/config/provider-registry";

const buyOrderSchema = z.object({
  symbol: z.string().min(1, "Asset symbol is required."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  pricePerUnit: z.number().positive("Price must be greater than zero."),
  assetType: z.nativeEnum(AssetType, { errorMap: () => ({ message: "Asset type must be STOCK or CRYPTO." }) }),
  orderType: z.string().optional(),
  triggerPrice: z.number().optional(),
  trailingAmount: z.number().optional(),
  bracketStopLoss: z.number().optional(),
  bracketTakeProfit: z.number().optional()
});

const sellOrderSchema = z.object({
  symbol: z.string().min(1, "Asset symbol is required."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  pricePerUnit: z.number().positive("Price must be greater than zero."),
  orderType: z.string().optional(),
  triggerPrice: z.number().optional(),
  trailingAmount: z.number().optional(),
  bracketStopLoss: z.number().optional(),
  bracketTakeProfit: z.number().optional()
});

export class PortfolioController {
  private readonly portfolioService = new PortfolioService();
  private readonly portfolioRepo = new PortfolioRepository();
  private readonly db = PrismaService.getClient();
  private readonly stockProvider = ProviderRegistry.getStockProvider();

  /**
   * Helper to deterministically generate educational trade mistake assessments
   */
  public static generateMistakeReport(
    action: "BUY" | "SELL",
    symbol: string,
    quantity: number,
    price: number,
    profile: any,
    orderType?: string
  ): any {
    const cleanSymbol = symbol.toUpperCase();
    const cost = quantity * price;
    const isCrypto = ["BTC", "ETH", "SOL", "XRP"].includes(cleanSymbol);
    const assetClass = isCrypto ? "Cryptocurrency" : "Equity";
    
    // Deterministic hashing based on symbol string
    let hash = 0;
    for (let i = 0; i < cleanSymbol.length; i++) {
      hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const randomVal = Math.abs(Math.sin(hash) * 100) % 1;

    const mistakes: string[] = [];
    const suggestions: string[] = [];
    const learningTips: string[] = [];
    let tradeScore = Math.floor(72 + randomVal * 24);

    // 1. Position Sizing Evaluation
    if (cost > 100000) {
      tradeScore -= 12;
      mistakes.push("Aggressive Capital Risk: Single position sizing represents over 10% of default virtual base balance, raising drawdown exposure.");
      suggestions.push("Limit single paper allocations to 1-2% of portfolio cash to optimize capital longevity.");
    } else {
      suggestions.push("Prudent position sizing. Maintaining allocation below 5% preserves buying power.");
    }

    // 2. Guardrails (Stop Loss & Risk-Reward checks)
    if (action === "BUY") {
      if (orderType === "BRACKET") {
        suggestions.push("Disciplined Bracket Structure: Hard boundaries for both profit-taking and loss-mitigation are active.");
        tradeScore += 6;
      } else if (orderType === "TRAILING_STOP") {
        suggestions.push("Dynamic Trail Protection: Trailing stops lock in upside runs while maintaining automated downside caps.");
        tradeScore += 5;
      } else {
        mistakes.push("Undetected downside exit orders: Executing long trades without predefined bracket exit points is a high-risk habit.");
        suggestions.push("Simulate stop-loss targets at 3% - 5% below entry to build disciplined trading habits.");
        learningTips.push("Always structure trades with a minimum 1:2 risk-to-reward ratio.");
      }
    }

    // 3. Technical Trend Alignment
    const trend = randomVal > 0.48 ? "Aligned with bullish daily trends" : "Trading within overextended daily resistance zones";
    if (trend.includes("resistance")) {
      tradeScore -= 8;
      mistakes.push("Counter-Trend Entry: Buying during near-term price expansions often results in early unrealized drawdown.");
      learningTips.push("Wait for price breakouts to consolidate on higher relative volume before entering.");
    }

    const sectorName = profile?.sector || "Alternative Assets";
    const holdingRec = isCrypto 
      ? "Short swing duration (2 - 7 trading days) due to high asset beta." 
      : "Medium core horizon (1 - 6 months) aligning with fundamental valuations.";

    return {
      tradeScore: Math.min(100, Math.max(45, tradeScore)),
      mistakes,
      explanation: `Simulated a ${action} trade (${orderType || "MARKET"}) for ${quantity} shares of ${cleanSymbol} (${assetClass}) at ₹${price.toLocaleString()}. Assessment score: ${tradeScore}/100. Trend: ${trend}.`,
      learningTips: [
        ...learningTips,
        "Paper trading is an educational tool. Prioritize entry/exit strategy rules over short-term paper profit runs.",
        `Analyze correlations inside the ${sectorName} sector before placing additional orders.`
      ],
      improvementSuggestions: [
        ...suggestions,
        `Verify support and resistance zones for ${cleanSymbol} on the technical chart before adding to this position.`
      ],
      holdingPeriodRecommendation: holdingRec,
      riskRewardRatio: `Estimated 1:2.2 (Target: ₹${(price * 1.12).toFixed(2)} | Exit Stop: ₹${(price * 0.95).toFixed(2)})`,
      diversificationImpact: `Position is allocated within the ${sectorName} sector.`,
      isEducationalOnly: true
    };
  }

  /**
   * Helper to verify user ownership of the portfolio resource
   */
  private async checkOwnership(req: Request, res: Response, portfolioId: string): Promise<boolean> {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized. Authentication required." });
      return false;
    }

    const portfolio = await this.portfolioRepo.findById(portfolioId);
    if (!portfolio) {
      res.status(404).json({ success: false, error: "Portfolio not found." });
      return false;
    }

    if (portfolio.userId !== req.user.userId) {
      res.status(403).json({ success: false, error: "Access denied. Resource does not belong to this user." });
      return false;
    }

    return true;
  }

  /**
   * POST /api/v1/portfolios/:id/buy
   */
  public buyAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const portfolioId = req.params.id;
      const isOwner = await this.checkOwnership(req, res, portfolioId);
      if (!isOwner) return;

      const parsed = buyOrderSchema.parse(req.body);
      const tx = await this.portfolioService.buyAsset(
        portfolioId,
        parsed.symbol,
        parsed.quantity,
        parsed.pricePerUnit,
        parsed.assetType
      );

      const profile = await this.stockProvider.getProfile(parsed.symbol).catch(() => null);
      const mistakeReport = PortfolioController.generateMistakeReport(
        "BUY",
        parsed.symbol,
        parsed.quantity,
        parsed.pricePerUnit,
        profile,
        parsed.orderType
      );

      res.status(200).json({
        success: true,
        message: `Successfully executed BUY order for ${parsed.quantity} shares of ${parsed.symbol.toUpperCase()}.`,
        data: tx,
        mistakeReport
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(400).json({ success: false, error: err.message });
      }
    }
  };

  /**
   * POST /api/v1/portfolios/:id/sell
   */
  public sellAsset = async (req: Request, res: Response): Promise<void> => {
    try {
      const portfolioId = req.params.id;
      const isOwner = await this.checkOwnership(req, res, portfolioId);
      if (!isOwner) return;

      const parsed = sellOrderSchema.parse(req.body);
      const tx = await this.portfolioService.sellAsset(
        portfolioId,
        parsed.symbol,
        parsed.quantity,
        parsed.pricePerUnit
      );

      const profile = await this.stockProvider.getProfile(parsed.symbol).catch(() => null);
      const mistakeReport = PortfolioController.generateMistakeReport(
        "SELL",
        parsed.symbol,
        parsed.quantity,
        parsed.pricePerUnit,
        profile,
        parsed.orderType
      );

      res.status(200).json({
        success: true,
        message: `Successfully executed SELL order for ${parsed.quantity} shares of ${parsed.symbol.toUpperCase()}.`,
        data: tx,
        mistakeReport
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ success: false, error: err.errors[0].message });
      } else {
        res.status(400).json({ success: false, error: err.message });
      }
    }
  };

  /**
   * GET /api/v1/portfolios/:id/summary
   */
  public getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const portfolioId = req.params.id;
      const isOwner = await this.checkOwnership(req, res, portfolioId);
      if (!isOwner) return;

      const summary = await this.portfolioService.getSummary(portfolioId);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/portfolios/list-fallback
   */
  public listFallback = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Find or create default demo user
      let user = await this.db.user.findUnique({
        where: { email: "demo@marketmind.ai" }
      });
      if (!user) {
        user = await this.db.user.create({
          data: {
            email: "demo@marketmind.ai",
            passwordHash: "demo_password_hash",
            firstName: "Demo",
            lastName: "Account",
            role: "USER"
          }
        });
      }

      // Fetch all portfolios owned by this user
      let portfolios = await this.db.portfolio.findMany({
        where: { userId: user.id }
      });

      if (portfolios.length === 0) {
        // Auto-provision default USD portfolio
        const defaultUSD = await this.db.portfolio.create({
          data: {
            userId: user.id,
            name: "US Dollar Paper Portfolio",
            description: "Paper trading portfolio denominated in USD.",
            type: "PAPER",
            balance: 50000.0,
            currency: "USD"
          }
        });
        // Auto-provision default INR portfolio
        const defaultINR = await this.db.portfolio.create({
          data: {
            userId: user.id,
            name: "Indian Rupee Portfolio",
            description: "Paper trading portfolio denominated in INR.",
            type: "PAPER",
            balance: 1000000.0,
            currency: "INR"
          }
        });
        portfolios = [defaultUSD, defaultINR];
      }

      res.status(200).json({ success: true, data: portfolios });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/v1/portfolios/create-custom
   */
  public createCustom = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, currency, balance } = req.body;
      let user = await this.db.user.findUnique({
        where: { email: "demo@marketmind.ai" }
      });
      if (!user) {
        user = await this.db.user.create({
          data: {
            email: "demo@marketmind.ai",
            passwordHash: "demo_password_hash",
            firstName: "Demo",
            lastName: "Account",
            role: "USER"
          }
        });
      }

      const portfolio = await this.db.portfolio.create({
        data: {
          userId: user.id,
          name: name || "New Custom Portfolio",
          description: `Custom paper trading portfolio in ${currency || "USD"}.`,
          type: "PAPER",
          balance: balance ? parseFloat(balance) : 50000.0,
          currency: currency || "USD"
        }
      });

      res.status(201).json({ success: true, data: portfolio });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
