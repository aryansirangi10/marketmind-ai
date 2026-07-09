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
  
  // Optional rich Indian Stock market extension fields
  enterpriseValue?: number;
  sector?: string;
  exchange?: string;
  isin?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  faceValue?: number;
  bookValue?: number;
  dividendYield?: number;
  peRatio?: number;
  pbRatio?: number;
  eps?: number;
  roe?: number;
  roce?: number;
  debtToEquity?: number;
  revenue?: number;
  profit?: number;
  quarterlyResults?: Array<{ quarter: string; revenue: number; profit: number }>;
  annualResults?: Array<{ year: string; revenue: number; profit: number }>;
  shareholdingPattern?: { promoter: number; fii: number; dii: number; public: number };
  dividendHistory?: Array<{ date: string; amount: number; type: string }>;
  corporateActions?: Array<{ date: string; action: string; ratio: string }>;
  peers?: string[];
  aiAnalysis?: { outlook: string; strength: string; weakness: string; opportunity: string; threat: string; valuationScore: number; sentimentScore: number };
  riskScore?: number;
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
