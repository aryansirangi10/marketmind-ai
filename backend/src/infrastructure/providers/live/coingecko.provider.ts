// ==============================================================================
// Live CoinGecko Provider Implementation
// ==============================================================================

import { ICryptoProvider, CryptoMarketSummary, CryptoQuote } from "../../../domain/providers/crypto-provider.interface";
import { Candlestick } from "../../../domain/providers/stock-provider.interface";

export class CoinGeckoProvider implements ICryptoProvider {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    // Demo API uses a different domain, PRO API uses another
    this.baseUrl = apiKey ? "https://demo-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Accept": "application/json"
    };
    if (this.apiKey) {
      headers["x-cg-demo-api-key"] = this.apiKey;
    }
    return headers;
  }

  public async getMarkets(vsCurrency = "usd", limit = 10): Promise<CryptoMarketSummary[]> {
    const res = await fetch(
      `${this.baseUrl}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.statusText}`);
    }
    const data = await res.json() as any[];
    
    return data.map((item: any) => ({
      id: item.id || "",
      symbol: (item.symbol || "").toUpperCase(),
      name: item.name || "",
      imageUrl: item.image || "",
      currentPrice: Number(item.current_price || 0),
      marketCap: Number(item.market_cap || 0),
      totalVolume: Number(item.total_volume || 0),
      priceChangePercentage24h: Number(item.price_change_percentage_24h || 0)
    }));
  }

  public async getQuote(symbol: string): Promise<CryptoQuote> {
    const coinId = this.symbolToId(symbol);
    const res = await fetch(
      `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const stats = data[coinId] || {};

    const price = Number(stats.usd || 0);
    return {
      symbol: symbol.toUpperCase(),
      price,
      bidPrice: Number((price * 0.999).toFixed(2)),
      askPrice: Number((price * 1.001).toFixed(2)),
      high24h: Number((price * 1.02).toFixed(2)), // Simple estimate since simple price has no high
      low24h: Number((price * 0.98).toFixed(2)),
      volume24h: Number(stats.usd_24h_vol || 0),
      timestamp: Number(stats.last_updated_at * 1000 || Date.now())
    };
  }

  public async getCandlesticks(symbol: string, _interval: string, limit = 100): Promise<Candlestick[]> {
    const coinId = this.symbolToId(symbol);
    // CoinGecko only supports days = 1, 7, 14, 30, 90, 180, 365, max
    const days = limit <= 7 ? 7 : limit <= 30 ? 30 : 90;
    const res = await fetch(
      `${this.baseUrl}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.statusText}`);
    }
    const data = await res.json() as any[]; // returns array of arrays: [time, open, high, low, close]
    
    return data.map((bar: any) => ({
      time: Math.floor(bar[0] / 1000), // convert to unix seconds
      open: Number(bar[1]),
      high: Number(bar[2]),
      low: Number(bar[3]),
      close: Number(bar[4]),
      volume: 0 // CoinGecko OHLC does not return volume
    }));
  }

  private symbolToId(symbol: string): string {
    const clean = symbol.toUpperCase().replace("USDT", "");
    const map: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      BNB: "binancecoin",
      SOL: "solana",
      XRP: "ripple",
      DOGE: "dogecoin",
      ADA: "cardano"
    };
    return map[clean] || "bitcoin";
  }
}
