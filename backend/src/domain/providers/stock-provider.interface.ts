// ==============================================================================
// Domain Interfaces for Stock Data Providers
// ==============================================================================

export interface StockQuote {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  percentChange: number;
  timestamp: number;
}

export interface StockProfile {
  name: string;
  ticker: string;
  marketCapitalization: number;
  shareOutstanding: number;
  weburl: string;
  logoUrl: string;
  finnhubIndustry: string;
}

export interface StockSearchResult {
  symbol: string;
  description: string;
  type: string;
}

export interface Candlestick {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IStockProvider {
  /**
   * Fetches real-time quote for a stock symbol (e.g., AAPL)
   */
  getQuote(symbol: string): Promise<StockQuote>;

  /**
   * Fetches the company profile details
   */
  getProfile(symbol: string): Promise<StockProfile>;

  /**
   * Searches for matching stock tickers
   */
  search(query: string): Promise<StockSearchResult[]>;

  /**
   * Fetches historical daily candlestick bars
   */
  getDailyTimeSeries(symbol: string, days?: number): Promise<Candlestick[]>;
}
