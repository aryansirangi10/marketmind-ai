// ==============================================================================
// Market Controller (HTTP Request Handler)
// ==============================================================================

import { Request, Response } from "express";
import { ProviderRegistry } from "../../../infrastructure/config/provider-registry";

export class MarketController {
  private readonly stockProvider = ProviderRegistry.getStockProvider();
  private readonly cryptoProvider = ProviderRegistry.getCryptoProvider();
  private readonly newsProvider = ProviderRegistry.getNewsProvider();

  /**
   * GET /api/v1/stocks/:symbol/quote
   */
  public getStockQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const quote = await this.stockProvider.getQuote(symbol);
      res.status(200).json({ success: true, data: quote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/stocks/:symbol/profile
   */
  public getStockProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const profile = await this.stockProvider.getProfile(symbol);
      res.status(200).json({ success: true, data: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/stocks/:symbol/candles
   */
  public getStockCandles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 100;
      const candles = await this.stockProvider.getDailyTimeSeries(symbol, days);
      res.status(200).json({ success: true, data: candles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/crypto/markets
   */
  public getCryptoMarkets = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const markets = await this.cryptoProvider.getMarkets("usd", limit);
      res.status(200).json({ success: true, data: markets });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/crypto/:symbol/quote
   */
  public getCryptoQuote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const quote = await this.cryptoProvider.getQuote(symbol);
      res.status(200).json({ success: true, data: quote });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/crypto/:symbol/candles
   */
  public getCryptoCandles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const interval = (req.query.interval as string) || "1d";
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const candles = await this.cryptoProvider.getCandlesticks(symbol, interval, limit);
      res.status(200).json({ success: true, data: candles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };

  /**
   * GET /api/v1/news
   */
  public getMarketNews = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = (req.query.category as string) || undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const articles = await this.newsProvider.getLatestNews(category, limit);
      res.status(200).json({ success: true, data: articles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  };
}
