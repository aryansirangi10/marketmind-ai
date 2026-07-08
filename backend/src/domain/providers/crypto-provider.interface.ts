// ==============================================================================
// Domain Interfaces for Cryptocurrency Data Providers
// ==============================================================================

import { Candlestick } from "./stock-provider.interface";

export interface CryptoMarketSummary {
  id: string;
  symbol: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
}

export interface CryptoQuote {
  symbol: string;
  price: number;
  bidPrice: number;
  askPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: number;
}

export interface ICryptoProvider {
  /**
   * Fetches top cryptocurrency tickers sorted by market capitalization
   */
  getMarkets(vsCurrency?: string, limit?: number): Promise<CryptoMarketSummary[]>;

  /**
   * Fetches the real-time quote/order-book status for a pair (e.g. BTCUSDT)
   */
  getQuote(symbol: string): Promise<CryptoQuote>;

  /**
   * Fetches historical crypto candlesticks (k-lines)
   */
  getCandlesticks(symbol: string, interval: string, limit?: number): Promise<Candlestick[]>;
}
