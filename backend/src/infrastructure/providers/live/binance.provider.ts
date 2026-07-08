// ==============================================================================
// Live Binance Provider Implementation
// ==============================================================================

import { ICryptoProvider, CryptoMarketSummary, CryptoQuote } from "../../../domain/providers/crypto-provider.interface";
import { Candlestick } from "../../../domain/providers/stock-provider.interface";

export class BinanceProvider implements ICryptoProvider {
  private readonly baseUrl = "https://api.binance.com/api/v3";

  public async getMarkets(_vsCurrency = "usd", limit = 10): Promise<CryptoMarketSummary[]> {
    // Binance does not have a simple market cap listing endpoint.
    // Instead of building complex aggregate logic here, we return top pairs.
    // For production crypto lists, CoinGecko is preferred, so this falls back.
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT"].slice(0, limit);
    const summaries: CryptoMarketSummary[] = [];

    for (const sym of symbols) {
      try {
        const quote = await this.getQuote(sym);
        summaries.push({
          id: sym.toLowerCase(),
          symbol: sym.replace("USDT", ""),
          name: sym.replace("USDT", ""),
          imageUrl: "",
          currentPrice: quote.price,
          marketCap: 0,
          totalVolume: quote.volume24h,
          priceChangePercentage24h: 0
        });
      } catch (err) {
        // Skip symbol on error
      }
    }
    return summaries;
  }

  public async getQuote(symbol: string): Promise<CryptoQuote> {
    const sym = symbol.toUpperCase();
    
    // Fetch current price & ticker 24h
    const [priceRes, tickerRes] = await Promise.all([
      fetch(`${this.baseUrl}/ticker/price?symbol=${sym}`),
      fetch(`${this.baseUrl}/ticker/24hr?symbol=${sym}`)
    ]);

    if (!priceRes.ok || !tickerRes.ok) {
      throw new Error(`Binance API error fetching quote for ${sym}`);
    }

    const priceData = await priceRes.json() as any;
    const tickerData = await tickerRes.json() as any;

    const price = Number(priceData.price || 0);

    return {
      symbol: sym,
      price,
      bidPrice: Number(tickerData.bidPrice || 0),
      askPrice: Number(tickerData.askPrice || 0),
      high24h: Number(tickerData.highPrice || 0),
      low24h: Number(tickerData.lowPrice || 0),
      volume24h: Number(tickerData.volume || 0),
      timestamp: Date.now()
    };
  }

  public async getCandlesticks(symbol: string, interval: string, limit = 100): Promise<Candlestick[]> {
    const sym = symbol.toUpperCase();
    const cleanInterval = this.mapInterval(interval);
    
    const res = await fetch(`${this.baseUrl}/klines?symbol=${sym}&interval=${cleanInterval}&limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Binance API error fetching klines for ${sym}: ${res.statusText}`);
    }
    const data = await res.json() as any[]; // returns array of arrays

    return data.map((kline: any) => ({
      time: Math.floor(kline[0] / 1000), // Open time in seconds
      open: Number(kline[1]),
      high: Number(kline[2]),
      low: Number(kline[3]),
      close: Number(kline[4]),
      volume: Number(kline[5])
    }));
  }

  private mapInterval(interval: string): string {
    // Convert 1d, 1h to Binance format (which is same: 1m, 1h, 1d)
    const clean = interval.toLowerCase();
    if (clean === "1d" || clean === "1h" || clean === "15m" || clean === "5m" || clean === "1w") {
      return clean;
    }
    return "1d";
  }
}
