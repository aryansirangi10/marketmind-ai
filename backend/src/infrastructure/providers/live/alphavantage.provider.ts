// ==============================================================================
// Live Alpha Vantage Provider Implementation
// ==============================================================================

import { IStockProvider, StockQuote, StockProfile, StockSearchResult, Candlestick } from "../../../domain/providers/stock-provider.interface";

export class AlphaVantageProvider implements IStockProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://www.alphavantage.co/query";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Alpha Vantage primarily excels at historical data in its free tier.
  // Real-time quotes and search are deferred to Finnhub, but we implement basic mappings here.

  public async getQuote(symbol: string): Promise<StockQuote> {
    const res = await fetch(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol.toUpperCase()}&apikey=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Alpha Vantage API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const quote = data["Global Quote"] || {};

    const currentPrice = Number(quote["05. price"] || 0);
    const prevClose = Number(quote["08. previous close"] || 0);

    return {
      currentPrice,
      highPrice: Number(quote["03. high"] || 0),
      lowPrice: Number(quote["04. low"] || 0),
      openPrice: Number(quote["02. open"] || 0),
      previousClose: prevClose,
      percentChange: Number((quote["10. change percent"] || "0%").replace("%", "")),
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  public async getProfile(symbol: string): Promise<StockProfile> {
    // Alpha Vantage does not have a lightweight company profile endpoint on the free tier.
    // We map a generic profile layout.
    return {
      name: `${symbol.toUpperCase()} Inc`,
      ticker: symbol.toUpperCase(),
      marketCapitalization: 0,
      shareOutstanding: 0,
      weburl: "",
      logoUrl: "",
      finnhubIndustry: ""
    };
  }

  public async search(query: string): Promise<StockSearchResult[]> {
    const res = await fetch(`${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Alpha Vantage API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const matches = data["bestMatches"] || [];

    return matches.map((match: any) => ({
      symbol: match["1. symbol"] || "",
      description: match["2. name"] || "",
      type: match["3. type"] || ""
    }));
  }

  public async getDailyTimeSeries(symbol: string, days = 100): Promise<Candlestick[]> {
    const res = await fetch(`${this.baseUrl}?function=TIME_SERIES_DAILY&symbol=${symbol.toUpperCase()}&apikey=${this.apiKey}`);
    if (!res.ok) {
      throw new Error(`Alpha Vantage API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const timeSeries = data["Time Series (Daily)"] || {};
    
    const dates = Object.keys(timeSeries).slice(0, days);
    const candlesticks: Candlestick[] = [];

    for (const date of dates) {
      const bar = timeSeries[date];
      const time = Math.floor(new Date(date).getTime() / 1000);
      
      candlesticks.push({
        time,
        open: Number(bar["1. open"]),
        high: Number(bar["2. high"]),
        low: Number(bar["3. low"]),
        close: Number(bar["4. close"]),
        volume: Number(bar["5. volume"])
      });
    }

    return candlesticks.reverse();
  }
}
