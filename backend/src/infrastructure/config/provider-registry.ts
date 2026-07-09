// ==============================================================================
// Provider Registry (Dependency Injection & Auto-Fallback Container)
// ==============================================================================

import { IStockProvider } from "../../domain/providers/stock-provider.interface";
import { ICryptoProvider } from "../../domain/providers/crypto-provider.interface";
import { INewsProvider } from "../../domain/providers/news-provider.interface";
import { IAIProvider, ChatMessage, SentimentAnalysisResult } from "../../domain/providers/ai-provider.interface";

import { MockStockProvider } from "../providers/mock/mock-stock.provider";
import { MockCryptoProvider } from "../providers/mock/mock-crypto.provider";
import { MockNewsProvider } from "../providers/mock/mock-news.provider";
import { MockAIProvider } from "../providers/mock/mock-ai.provider";

import { FinnhubProvider } from "../providers/live/finnhub.provider";
import { CoinGeckoProvider } from "../providers/live/coingecko.provider";
import { BinanceProvider } from "../providers/live/binance.provider";
import { NewsAPIProvider } from "../providers/live/newsapi.provider";
import { GeminiAIProvider } from "../providers/live/gemini-ai.provider";
import { OpenAIAIProvider, AnthropicAIProvider, LocalAIProvider } from "../providers/live/ai-providers";

import * as dotenv from "dotenv";
dotenv.config();

class FallbackAIProvider implements IAIProvider {
  constructor(private providers: IAIProvider[]) {}

  public async generateChatResponse(messages: ChatMessage[]): Promise<string> {
    for (const provider of this.providers) {
      try {
        return await provider.generateChatResponse(messages);
      } catch (err: any) {
        console.warn(`[FallbackAIProvider] Chat query failed: ${err.message}. Trying next provider...`);
      }
    }
    throw new Error("All configured AI providers failed to generate chat response.");
  }

  public async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    for (const provider of this.providers) {
      try {
        return await provider.analyzeSentiment(text);
      } catch (err: any) {
        console.warn(`[FallbackAIProvider] Sentiment analysis failed: ${err.message}. Trying next provider...`);
      }
    }
    throw new Error("All configured AI providers failed to analyze sentiment.");
  }

  public async summarizeText(text: string): Promise<string> {
    for (const provider of this.providers) {
      try {
        return await provider.summarizeText(text);
      } catch (err: any) {
        console.warn(`[FallbackAIProvider] Summary failed: ${err.message}. Trying next provider...`);
      }
    }
    throw new Error("All configured AI providers failed to summarize text.");
  }
}

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
   * Resolves the AI provider (Live Gemini/OpenAI/Anthropic vs Mock)
   */
  public static getAIProvider(): IAIProvider {
    if (!this.aiProviderInstance) {
      const providersList: IAIProvider[] = [];

      if (process.env.GEMINI_API_KEY) {
        providersList.push(new GeminiAIProvider(process.env.GEMINI_API_KEY));
      }
      if (process.env.OPENAI_API_KEY) {
        providersList.push(new OpenAIAIProvider(process.env.OPENAI_API_KEY));
      }
      if (process.env.ANTHROPIC_API_KEY) {
        providersList.push(new AnthropicAIProvider(process.env.ANTHROPIC_API_KEY));
      }
      if (process.env.LOCAL_LLM_URL) {
        providersList.push(new LocalAIProvider(process.env.LOCAL_LLM_URL));
      }

      // Add MockAIProvider as the absolute fallback
      providersList.push(new MockAIProvider());

      console.log(`[ProviderRegistry] Initializing FallbackAIProvider chain with ${providersList.length} configured modules.`);
      this.aiProviderInstance = new FallbackAIProvider(providersList);
    }
    return this.aiProviderInstance;
  }
}
