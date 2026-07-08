// ==============================================================================
// Provider Registry (Dependency Injection & Auto-Fallback Container)
// ==============================================================================

import { IStockProvider } from "../../domain/providers/stock-provider.interface";
import { ICryptoProvider } from "../../domain/providers/crypto-provider.interface";
import { INewsProvider } from "../../domain/providers/news-provider.interface";
import { IAIProvider } from "../../domain/providers/ai-provider.interface";

import { MockStockProvider } from "../providers/mock/mock-stock.provider";
import { MockCryptoProvider } from "../providers/mock/mock-crypto.provider";
import { MockNewsProvider } from "../providers/mock/mock-news.provider";
import { MockAIProvider } from "../providers/mock/mock-ai.provider";

import { FinnhubProvider } from "../providers/live/finnhub.provider";
import { CoinGeckoProvider } from "../providers/live/coingecko.provider";
import { BinanceProvider } from "../providers/live/binance.provider";
import { NewsAPIProvider } from "../providers/live/newsapi.provider";
import { GeminiAIProvider } from "../providers/live/gemini-ai.provider";

import * as dotenv from "dotenv";
dotenv.config();

export class ProviderRegistry {
  private static stockProviderInstance: IStockProvider;
  private static cryptoProviderInstance: ICryptoProvider;
  private static newsProviderInstance: INewsProvider;
  private static aiProviderInstance: IAIProvider;

  /**
   * Resolves the Stock provider (Live Finnhub vs Mock)
   */
  public static getStockProvider(): IStockProvider {
    if (!this.stockProviderInstance) {
      const apiKey = process.env.FINNHUB_API_KEY;
      if (apiKey && apiKey.trim() !== "") {
        console.log("[ProviderRegistry] Initializing Live Finnhub Stock Provider.");
        this.stockProviderInstance = new FinnhubProvider(apiKey);
      } else {
        console.log("[ProviderRegistry] API Key for Finnhub absent. Binding Mock Stock Provider.");
        this.stockProviderInstance = new MockStockProvider();
      }
    }
    return this.stockProviderInstance;
  }

  /**
   * Resolves the Crypto provider (Live CoinGecko/Binance vs Mock)
   */
  public static getCryptoProvider(): ICryptoProvider {
    if (!this.cryptoProviderInstance) {
      const cgKey = process.env.COINGECKO_API_KEY;
      const binanceKey = process.env.BINANCE_API_KEY;
      
      if (cgKey && cgKey.trim() !== "") {
        console.log("[ProviderRegistry] Initializing Live CoinGecko Crypto Provider.");
        this.cryptoProviderInstance = new CoinGeckoProvider(cgKey);
      } else if (binanceKey && binanceKey.trim() !== "") {
        console.log("[ProviderRegistry] Initializing Live Binance Crypto Provider.");
        this.cryptoProviderInstance = new BinanceProvider();
      } else {
        console.log("[ProviderRegistry] API Keys for CoinGecko/Binance absent. Binding Mock Crypto Provider.");
        this.cryptoProviderInstance = new MockCryptoProvider();
      }
    }
    return this.cryptoProviderInstance;
  }

  /**
   * Resolves the News provider (Live NewsAPI vs Mock)
   */
  public static getNewsProvider(): INewsProvider {
    if (!this.newsProviderInstance) {
      const apiKey = process.env.NEWS_API_KEY;
      if (apiKey && apiKey.trim() !== "") {
        console.log("[ProviderRegistry] Initializing Live NewsAPI Provider.");
        this.newsProviderInstance = new NewsAPIProvider(apiKey);
      } else {
        console.log("[ProviderRegistry] API Key for NewsAPI absent. Binding Mock News Provider.");
        this.newsProviderInstance = new MockNewsProvider();
      }
    }
    return this.newsProviderInstance;
  }

  /**
   * Resolves the AI provider (Live Gemini vs Mock)
   */
  public static getAIProvider(): IAIProvider {
    if (!this.aiProviderInstance) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey.trim() !== "") {
        console.log("[ProviderRegistry] Initializing Live Gemini AI Provider.");
        this.aiProviderInstance = new GeminiAIProvider(apiKey);
      } else {
        console.log("[ProviderRegistry] API Key for Gemini absent. Binding Mock AI Provider.");
        this.aiProviderInstance = new MockAIProvider();
      }
    }
    return this.aiProviderInstance;
  }
}
