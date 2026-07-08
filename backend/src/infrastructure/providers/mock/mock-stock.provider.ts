// ==============================================================================
// Mock Stock Provider Implementation
// ==============================================================================

import { IStockProvider, StockQuote, StockProfile, StockSearchResult, Candlestick } from "../../../domain/providers/stock-provider.interface";

export class MockStockProvider implements IStockProvider {
  private static readonly STOCK_PROFILES: Record<string, StockProfile> = {
    AAPL: {
      name: "Apple Inc.",
      ticker: "AAPL",
      marketCapitalization: 3120000, // $3.12T
      shareOutstanding: 15400, // 15.4B
      weburl: "https://www.apple.com",
      logoUrl: "https://logo.clearbit.com/apple.com",
      finnhubIndustry: "Technology"
    },
    MSFT: {
      name: "Microsoft Corporation",
      ticker: "MSFT",
      marketCapitalization: 3250000, // $3.25T
      shareOutstanding: 7430, // 7.43B
      weburl: "https://www.microsoft.com",
      logoUrl: "https://logo.clearbit.com/microsoft.com",
      finnhubIndustry: "Technology"
    },
    GOOGL: {
      name: "Alphabet Inc.",
      ticker: "GOOGL",
      marketCapitalization: 2150000, // $2.15T
      shareOutstanding: 12500, // 12.5B
      weburl: "https://abc.xyz",
      logoUrl: "https://logo.clearbit.com/abc.xyz",
      finnhubIndustry: "Technology"
    },
    TSLA: {
      name: "Tesla Inc.",
      ticker: "TSLA",
      marketCapitalization: 620000, // $620B
      shareOutstanding: 3180, // 3.18B
      weburl: "https://www.tesla.com",
      logoUrl: "https://logo.clearbit.com/tesla.com",
      finnhubIndustry: "Automotive"
    },
    NVDA: {
      name: "NVIDIA Corporation",
      ticker: "NVDA",
      marketCapitalization: 2950000, // $2.95T
      shareOutstanding: 24600, // 24.6B
      weburl: "https://www.nvidia.com",
      logoUrl: "https://logo.clearbit.com/nvidia.com",
      finnhubIndustry: "Semiconductors"
    }
  };

  private static readonly BASE_PRICES: Record<string, number> = {
    AAPL: 185.50,
    MSFT: 420.20,
    GOOGL: 172.80,
    TSLA: 178.90,
    NVDA: 885.00
  };

  public async getQuote(symbol: string): Promise<StockQuote> {
    const cleanSymbol = symbol.toUpperCase();
    const basePrice = MockStockProvider.BASE_PRICES[cleanSymbol] || 100.0;
    
    // Simulate slight fluctuation (+-0.5%)
    const fluctuation = basePrice * (Math.random() - 0.5) * 0.01;
    const currentPrice = Number((basePrice + fluctuation).toFixed(2));
    const previousClose = Number(basePrice.toFixed(2));
    const priceChange = Number((currentPrice - previousClose).toFixed(2));
    const percentChange = Number(((priceChange / previousClose) * 100).toFixed(2));
    
    return {
      currentPrice,
      highPrice: Number((Math.max(currentPrice, previousClose) + Math.random() * 0.5).toFixed(2)),
      lowPrice: Number((Math.min(currentPrice, previousClose) - Math.random() * 0.5).toFixed(2)),
      openPrice: Number((previousClose + (Math.random() - 0.5) * 0.2).toFixed(2)),
      previousClose,
      percentChange,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  public async getProfile(symbol: string): Promise<StockProfile> {
    const cleanSymbol = symbol.toUpperCase();
    const profile = MockStockProvider.STOCK_PROFILES[cleanSymbol];
    
    if (profile) {
      return profile;
    }
    
    // Generate a fallback generic profile for unlisted symbols
    return {
      name: `${cleanSymbol} Corp`,
      ticker: cleanSymbol,
      marketCapitalization: 50000,
      shareOutstanding: 500,
      weburl: `https://www.${cleanSymbol.toLowerCase()}.com`,
      logoUrl: `https://logo.clearbit.com/${cleanSymbol.toLowerCase()}.com`,
      finnhubIndustry: "Financial Services"
    };
  }

  public async search(query: string): Promise<StockSearchResult[]> {
    if (!query) return [];
    const cleanQuery = query.toUpperCase();
    
    const results = Object.values(MockStockProvider.STOCK_PROFILES)
      .filter(profile => 
        profile.ticker.includes(cleanQuery) || 
        profile.name.toUpperCase().includes(cleanQuery)
      )
      .map(profile => ({
        symbol: profile.ticker,
        description: profile.name,
        type: "Common Stock"
      }));
      
    if (results.length === 0 && query.length > 0) {
      results.push({
        symbol: cleanQuery,
        description: `${cleanQuery} Mock Asset`,
        type: "Common Stock"
      });
    }
    
    return results;
  }

  public async getDailyTimeSeries(symbol: string, days = 100): Promise<Candlestick[]> {
    const cleanSymbol = symbol.toUpperCase();
    let currentPrice = MockStockProvider.BASE_PRICES[cleanSymbol] || 100.0;
    const series: Candlestick[] = [];
    const now = Math.floor(Date.now() / 1000);
    const dayInSeconds = 24 * 60 * 60;
    
    // Generate historical bars in reverse, then reverse the array
    for (let i = days; i >= 0; i--) {
      // Random walk step
      const volatility = 0.015; // 1.5% daily volatility
      const changePercent = (Math.random() - 0.48) * volatility; // slight upward drift
      const openPrice = currentPrice;
      const closePrice = openPrice * (1 + changePercent);
      const highPrice = Math.max(openPrice, closePrice) * (1 + Math.random() * 0.005);
      const lowPrice = Math.min(openPrice, closePrice) * (1 - Math.random() * 0.005);
      const volume = Math.floor(1000000 + Math.random() * 9000000);
      const time = now - i * dayInSeconds;
      
      series.push({
        time,
        open: Number(openPrice.toFixed(2)),
        high: Number(highPrice.toFixed(2)),
        low: Number(lowPrice.toFixed(2)),
        close: Number(closePrice.toFixed(2)),
        volume
      });
      
      currentPrice = closePrice;
    }
    
    return series;
  }
}
