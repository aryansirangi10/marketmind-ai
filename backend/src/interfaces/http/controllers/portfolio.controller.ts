// ==============================================================================
// Portfolio Controller (HTTP Requests Handler)
// ==============================================================================

import { Request, Response } from "express";
import { PortfolioService } from "../../../application/services/portfolio.service";
import { PortfolioRepository } from "../../../infrastructure/repositories/portfolio.repository";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { AssetType } from "@prisma/client";
import { z } from "zod";

const buyOrderSchema = z.object({
  symbol: z.string().min(1, "Asset symbol is required."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  pricePerUnit: z.number().positive("Price must be greater than zero."),
  assetType: z.nativeEnum(AssetType, { errorMap: () => ({ message: "Asset type must be STOCK or CRYPTO." }) })
});

const sellOrderSchema = z.object({
  symbol: z.string().min(1, "Asset symbol is required."),
  quantity: z.number().positive("Quantity must be greater than zero."),
  pricePerUnit: z.number().positive("Price must be greater than zero.")
});

export class PortfolioController {
  private readonly portfolioService = new PortfolioService();
  private readonly portfolioRepo = new PortfolioRepository();
  private readonly db = PrismaService.getClient();

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

      res.status(200).json({
        success: true,
        message: `Successfully executed BUY order for ${parsed.quantity} shares of ${parsed.symbol.toUpperCase()}.`,
        data: tx
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

      res.status(200).json({
        success: true,
        message: `Successfully executed SELL order for ${parsed.quantity} shares of ${parsed.symbol.toUpperCase()}.`,
        data: tx
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
      // Find the first demo portfolio in DB
      const portfolio = await this.db.portfolio.findFirst();
      if (!portfolio) {
        res.status(404).json({ success: false, error: "No portfolio found in database. Run create-fallback first." });
        return;
      }
      res.status(200).json({ success: true, data: [portfolio] });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * POST /api/v1/portfolios/create-fallback
   */
  public createFallback = async (_req: Request, res: Response): Promise<void> => {
    try {
      // Find or create seed user
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

      // Check if default portfolio exists
      let portfolio = await this.db.portfolio.findFirst({
        where: { userId: user.id }
      });
      if (!portfolio) {
        portfolio = await this.db.portfolio.create({
          data: {
            userId: user.id,
            name: "Demo Paper Portfolio",
            description: "Default paper portfolio for local development testing.",
            type: "PAPER",
            balance: 100000.0
          }
        });
      }

      res.status(200).json({ success: true, data: portfolio });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
