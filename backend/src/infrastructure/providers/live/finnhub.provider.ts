// ==============================================================================
// Live Finnhub Provider Implementation
// ==============================================================================

import { IStockProvider, StockQuote, StockProfile, StockSearchResult, Candlestick } from "../../../domain/providers/stock-provider.interface";

export class FinnhubProvider implements IStockProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://finnhub.io/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getQuote(symbol: string): Promise<StockQuote> {
    const res = await fetch(`${this.baseUrl}/quote?symbol=${symbol.toUpperCase()}&token=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    
    // Finnhub fields: c = current, h = high, l = low, o = open, pc = previous close, d = change, dp = percent change
    return {
      currentPrice: Number(data.c || 0),
      highPrice: Number(data.h || 0),
      lowPrice: Number(data.l || 0),
      openPrice: Number(data.o || 0),
      previousClose: Number(data.pc || 0),
      percentChange: Number(data.dp || 0),
      timestamp: Number(data.t || Math.floor(Date.now() / 1000))
    };
  }

  public async getProfile(symbol: string): Promise<StockProfile> {
    const res = await fetch(`${this.baseUrl}/stock/profile2?symbol=${symbol.toUpperCase()}&token=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    
    return {
      name: data.name || symbol,
      ticker: data.ticker || symbol,
      marketCapitalization: Number(data.marketCapitalization || 0),
      shareOutstanding: Number(data.shareOutstanding || 0),
      weburl: data.weburl || "",
      logoUrl: data.logo || "",
      finnhubIndustry: data.finnhubIndustry || ""
    };
  }

  public async search(query: string): Promise<StockSearchResult[]> {
    const res = await fetch(`${this.baseUrl}/search?q=${query}&token=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const list = data.result || [];
    
    return list.map((item: any) => ({
      symbol: item.symbol || "",
      description: item.description || "",
      type: item.type || ""
    }));
  }

  public async getDailyTimeSeries(symbol: string, days = 100): Promise<Candlestick[]> {
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    
    const res = await fetch(
      `${this.baseUrl}/stock/candle?symbol=${symbol.toUpperCase()}&resolution=D&from=${from}&to=${to}&token=${this.apiKey}`
    );
    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    
    if (data.s !== "ok") {
      return [];
    }
    
    // Finnhub candles returns arrays for open (o), high (h), low (l), close (c), volume (v), time (t)
    const candles: Candlestick[] = [];
    for (let i = 0; i < data.t.length; i++) {
      candles.push({
        time: data.t[i],
        open: Number(data.o[i]),
        high: Number(data.h[i]),
        low: Number(data.l[i]),
        close: Number(data.c[i]),
        volume: Number(data.v[i])
      });
    }
    
    return candles;
  }
}
