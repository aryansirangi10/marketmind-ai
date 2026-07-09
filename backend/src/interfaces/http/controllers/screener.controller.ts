// ==============================================================================
// Screener REST Controller (Equity & Crypto Advanced Filtering)
// ==============================================================================

import { Request, Response } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

export class ScreenerController {
  private static prisma = PrismaService.getClient();

  /**
   * Evaluates screening criteria and returns filtered stock/crypto assets list
   * POST /screener/filter
   */
  public static async filterAssets(req: Request, res: Response): Promise<Response> {
    try {
      const { 
        type, 
        minMarketCap, 
        maxMarketCap, 
        minVolume, 
        peRatioRange, 
        sector, 
        blockchain 
      } = req.body;

      // Build basic query matching asset types
      const query: any = {
        where: {
          isActive: true
        }
      };

      if (type) {
        query.where.type = type; // STOCK or CRYPTO
      }

      // Query database constituents
      const assets = await this.prisma.asset.findMany(query);

      // Apply simulated advanced filters matching fundamental keys (P/E, TVL)
      const results = assets.map(asset => {
        const isCrypto = asset.type === "CRYPTO";
        return {
          id: asset.id,
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          exchange: asset.exchange,
          // Simulated parameters matching constraints
          price: isCrypto ? 65800.0 : 185.24,
          marketCap: isCrypto ? 1290000000000 : 3120000000000,
          volume24h: isCrypto ? 28400000000 : 52400000,
          peRatio: isCrypto ? null : 28.5,
          pbRatio: isCrypto ? null : 8.2,
          dividendYield: isCrypto ? 0.0 : 1.45,
          circulatingSupply: isCrypto ? 19700000 : null,
          blockchain: isCrypto ? (blockchain || "Bitcoin") : null,
          sector: isCrypto ? "DeFi" : (sector || "Technology")
        };
      }).filter(asset => {
        if (minMarketCap && asset.marketCap < minMarketCap) return false;
        if (maxMarketCap && asset.marketCap > maxMarketCap) return false;
        if (minVolume && asset.volume24h < minVolume) return false;
        if (peRatioRange && !isCryptoStyle(asset.type) && asset.peRatio) {
          if (asset.peRatio < peRatioRange.min || asset.peRatio > peRatioRange.max) return false;
        }
        return true;
      });

      return res.status(200).json({ success: true, data: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Saves user-configured screener filters in FeatureFlag/Config table
   * POST /screener/configs
   */
  public static async saveScreenerConfig(req: Request, res: Response): Promise<Response> {
    try {
      const { name, filters } = req.body;
      // Persist configuration tags
      const key = `screener_filter_${name.toLowerCase().replace(/\s+/g, "_")}`;
      await this.prisma.featureFlag.upsert({
        where: { key },
        update: { value: true, description: JSON.stringify(filters) },
        create: { key, value: true, description: JSON.stringify(filters) }
      });

      return res.status(200).json({ success: true, message: "Screener configuration saved successfully." });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

function isCryptoStyle(type: string): boolean {
  return type === "CRYPTO";
}
