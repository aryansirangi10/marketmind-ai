// ==============================================================================
// Mock Stock Provider Implementation
// ==============================================================================

import { IStockProvider, StockQuote, StockProfile, StockSearchResult, Candlestick } from "../../../domain/providers/stock-provider.interface";

export class MockStockProvider implements IStockProvider {
  private static readonly STOCK_PROFILES: Record<string, StockProfile> = {
    RELIANCE: {
      name: "Reliance Industries Limited",
      ticker: "RELIANCE",
      marketCapitalization: 16800000, // ₹16.8T
      shareOutstanding: 6760, // 6.76B
      weburl: "https://www.ril.com",
      logoUrl: "https://logo.clearbit.com/ril.com",
      finnhubIndustry: "Conglomerate",
      sector: "Energy / Retail / Telecom",
      exchange: "NSE/BSE",
      isin: "INE002A01018",
      enterpriseValue: 18200000,
      fiftyTwoWeekHigh: 2620.00,
      fiftyTwoWeekLow: 2150.00,
      faceValue: 10,
      bookValue: 1250.00,
      dividendYield: 0.38,
      peRatio: 26.50,
      pbRatio: 2.10,
      eps: 92.50,
      roe: 8.50,
      roce: 9.80,
      debtToEquity: 0.35,
      revenue: 974000,
      profit: 74000,
      quarterlyResults: [
        { quarter: "Q4 FY26", revenue: 245000, profit: 19500 },
        { quarter: "Q3 FY26", revenue: 238000, profit: 18200 },
        { quarter: "Q2 FY26", revenue: 242000, profit: 18800 }
      ],
      annualResults: [
        { year: "FY26", revenue: 974000, profit: 74000 },
        { year: "FY25", revenue: 912000, profit: 67000 }
      ],
      shareholdingPattern: { promoter: 50.39, fii: 22.10, dii: 16.50, public: 11.01 },
      dividendHistory: [
        { date: "2026-07-02", amount: 9.00, type: "Final" },
        { date: "2025-07-10", amount: 8.50, type: "Final" }
      ],
      corporateActions: [
        { date: "2024-09-05", action: "Bonus", ratio: "1:1" }
      ],
      peers: ["RELIANCE", "IOC", "BPCL", "HPCL"],
      aiAnalysis: {
        outlook: "Highly bullish on long-term telecom ARPU increases and Retail business scale. Hydrogen and Green Energy pipelines offer massive valuation triggers.",
        strength: "Exceptional cash flow engine, market dominance in retail and digital data fields.",
        weakness: "High capital expenditure run rate leading to elevated absolute debt levels.",
        opportunity: "Monetization of Jio/Retail networks via public IPO list entries.",
        threat: "Regulatory price caps on domestic gas output and telecom pricing metrics.",
        valuationScore: 82,
        sentimentScore: 78
      },
      riskScore: 35
    },
    TCS: {
      name: "Tata Consultancy Services Limited",
      ticker: "TCS",
      marketCapitalization: 13900000, // ₹13.9T
      shareOutstanding: 3660, // 3.66B
      weburl: "https://www.tcs.com",
      logoUrl: "https://logo.clearbit.com/tcs.com",
      finnhubIndustry: "IT Services",
      sector: "Information Technology",
      exchange: "NSE/BSE",
      isin: "INE467B01029",
      enterpriseValue: 13500000,
      fiftyTwoWeekHigh: 4250.00,
      fiftyTwoWeekLow: 3200.00,
      faceValue: 1,
      bookValue: 320.00,
      dividendYield: 1.25,
      peRatio: 30.20,
      pbRatio: 11.80,
      eps: 126.50,
      roe: 39.50,
      roce: 52.10,
      debtToEquity: 0.02,
      revenue: 245000,
      profit: 46000,
      quarterlyResults: [
        { quarter: "Q4 FY26", revenue: 62000, profit: 11800 },
        { quarter: "Q3 FY26", revenue: 60500, profit: 11200 },
        { quarter: "Q2 FY26", revenue: 61000, profit: 11500 }
      ],
      annualResults: [
        { year: "FY26", revenue: 245000, profit: 46000 },
        { year: "FY25", revenue: 228000, profit: 42100 }
      ],
      shareholdingPattern: { promoter: 72.40, fii: 12.50, dii: 9.80, public: 5.30 },
      dividendHistory: [
        { date: "2026-05-18", amount: 28.00, type: "Final" },
        { date: "2026-01-15", amount: 9.00, type: "Interim" }
      ],
      corporateActions: [
        { date: "2022-02-23", action: "Bonus", ratio: "1:1" }
      ],
      peers: ["TCS", "INFY", "WIPRO", "HCLTECH"],
      aiAnalysis: {
        outlook: "Neutral to mildly bullish. Stable margins maintained through excellent resource utilization. GenAI bookings are scaling fast.",
        strength: "Zero debt, industry-leading operating margins, strong parentage backing.",
        weakness: "Exposure to global IT spending constraints, currency exchange volatility.",
        opportunity: "Long-term legacy modernisation deals across European banking clients.",
        threat: "Talent wage inflation and rising sub-contracting cost margins.",
        valuationScore: 72,
        sentimentScore: 65
      },
      riskScore: 22
    },
    INFY: {
      name: "Infosys Limited",
      ticker: "INFY",
      marketCapitalization: 6400000, // ₹6.4T
      shareOutstanding: 4150, // 4.15B
      weburl: "https://www.infosys.com",
      logoUrl: "https://logo.clearbit.com/infosys.com",
      finnhubIndustry: "IT Services",
      sector: "Information Technology",
      exchange: "NSE/BSE",
      isin: "INE009A01021",
      enterpriseValue: 6200000,
      fiftyTwoWeekHigh: 1760.00,
      fiftyTwoWeekLow: 1380.00,
      faceValue: 5,
      bookValue: 210.00,
      dividendYield: 2.10,
      peRatio: 24.80,
      pbRatio: 7.30,
      eps: 62.10,
      roe: 31.20,
      roce: 41.50,
      debtToEquity: 0.05,
      revenue: 154000,
      profit: 26200,
      quarterlyResults: [
        { quarter: "Q4 FY26", revenue: 39500, profit: 6800 },
        { quarter: "Q3 FY26", revenue: 38200, profit: 6400 },
        { quarter: "Q2 FY26", revenue: 38100, profit: 6500 }
      ],
      annualResults: [
        { year: "FY26", revenue: 154000, profit: 26200 },
        { year: "FY25", revenue: 146000, profit: 24100 }
      ],
      shareholdingPattern: { promoter: 14.80, fii: 33.40, dii: 35.10, public: 16.70 },
      dividendHistory: [
        { date: "2026-06-01", amount: 20.00, type: "Final" },
        { date: "2025-10-18", amount: 18.00, type: "Interim" }
      ],
      corporateActions: [
        { date: "2018-09-04", action: "Bonus", ratio: "1:1" }
      ],
      peers: ["INFY", "TCS", "WIPRO", "HCLTECH"],
      aiAnalysis: {
        outlook: "Bullish on valuations. Currently trading at a discount compared to historical averages, presenting entry margins.",
        strength: "Excellent global delivery network, high cash conversion ratios.",
        weakness: "High employee attrition compared to peers, dependence on US discretionary deals.",
        opportunity: "Strategic cloud partnerships with hyperscalers driving large deals.",
        threat: "Strict immigration policy changes in key markets.",
        valuationScore: 78,
        sentimentScore: 72
      },
      riskScore: 28
    },
    HDFCBANK: {
      name: "HDFC Bank Limited",
      ticker: "HDFCBANK",
      marketCapitalization: 12300000, // ₹12.3T
      shareOutstanding: 7600, // 7.6B
      weburl: "https://www.hdfcbank.com",
      logoUrl: "https://logo.clearbit.com/hdfcbank.com",
      finnhubIndustry: "Banking",
      sector: "Financial Services",
      exchange: "NSE/BSE",
      isin: "INE040A01034",
      enterpriseValue: 14100000,
      fiftyTwoWeekHigh: 1790.00,
      fiftyTwoWeekLow: 1360.00,
      faceValue: 1,
      bookValue: 460.00,
      dividendYield: 1.15,
      peRatio: 18.20,
      pbRatio: 3.50,
      eps: 89.20,
      roe: 17.50,
      roce: 18.90,
      debtToEquity: 1.10,
      revenue: 210000,
      profit: 60200,
      quarterlyResults: [
        { quarter: "Q4 FY26", revenue: 54000, profit: 16500 },
        { quarter: "Q3 FY26", revenue: 52500, profit: 15100 },
        { quarter: "Q2 FY26", revenue: 51800, profit: 14800 }
      ],
      annualResults: [
        { year: "FY26", revenue: 210000, profit: 60200 },
        { year: "FY25", revenue: 192000, profit: 54100 }
      ],
      shareholdingPattern: { promoter: 0.00, fii: 52.10, dii: 30.60, public: 17.30 },
      dividendHistory: [
        { date: "2026-05-15", amount: 19.50, type: "Final" }
      ],
      corporateActions: [
        { date: "2019-09-19", action: "Splits", ratio: "1:2" }
      ],
      peers: ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK"],
      aiAnalysis: {
        outlook: "Highly Bullish. Post-merger synergies are starting to show, resulting in branch cross-selling wins and deposit growth acceleration.",
        strength: "Unrivaled asset quality, massive branch network, high brand equity.",
        weakness: "Near-term pressure on Net Interest Margins (NIM) due to cost of funds.",
        opportunity: "Unlocking mortgage portfolios and credit card expansions.",
        threat: "Rising deposit competition among public sector lenders.",
        valuationScore: 88,
        sentimentScore: 84
      },
      riskScore: 25
    },
    ICICIBANK: {
      name: "ICICI Bank Limited",
      ticker: "ICICIBANK",
      marketCapitalization: 7900000,
      shareOutstanding: 7000,
      weburl: "https://www.icicibank.com",
      logoUrl: "https://logo.clearbit.com/icicibank.com",
      finnhubIndustry: "Banking",
      sector: "Financial Services",
      exchange: "NSE/BSE",
      isin: "INE090A01021",
      peRatio: 17.80,
      pbRatio: 3.20,
      eps: 63.40,
      roe: 18.20,
      roce: 19.50
    },
    SBIN: {
      name: "State Bank of India",
      ticker: "SBIN",
      marketCapitalization: 7500000,
      shareOutstanding: 8920,
      weburl: "https://www.sbi.co.in",
      logoUrl: "https://logo.clearbit.com/sbi.co.in",
      finnhubIndustry: "Banking",
      sector: "Financial Services",
      exchange: "NSE/BSE",
      isin: "INE062A01020",
      peRatio: 11.20,
      pbRatio: 1.80,
      eps: 75.10,
      roe: 16.50,
      roce: 17.80
    },
    TATAMOTORS: {
      name: "Tata Motors Limited",
      ticker: "TATAMOTORS",
      marketCapitalization: 3900000,
      shareOutstanding: 3320,
      weburl: "https://www.tatamotors.com",
      logoUrl: "https://logo.clearbit.com/tatamotors.com",
      finnhubIndustry: "Automotive",
      sector: "Automobile",
      exchange: "NSE/BSE",
      isin: "INE155A01022",
      peRatio: 18.50,
      pbRatio: 4.80,
      eps: 53.00,
      roe: 22.40,
      roce: 24.10
    },
    ZOMATO: {
      name: "Zomato Limited",
      ticker: "ZOMATO",
      marketCapitalization: 1640000,
      shareOutstanding: 8800,
      weburl: "https://www.zomato.com",
      logoUrl: "https://logo.clearbit.com/zomato.com",
      finnhubIndustry: "Consumer Services",
      sector: "Consumer",
      exchange: "NSE/BSE",
      isin: "INE758T01015",
      peRatio: 115.00,
      pbRatio: 8.50,
      eps: 1.60,
      roe: 7.20,
      roce: 8.10
    }
  };

  private static readonly BASE_PRICES: Record<string, number> = {
    RELIANCE: 2450.00,
    TCS: 3820.00,
    INFY: 1540.00,
    HDFCBANK: 1620.00,
    ICICIBANK: 1120.00,
    SBIN: 840.00,
    TATAMOTORS: 980.00,
    ZOMATO: 185.00,
    NIFTY: 23500.00,
    SENSEX: 77200.00
  };

  // Helper to deterministically build profile parameters based on a ticker symbol seed hash
  public static getGeneratedProfile(symbol: string): StockProfile {
    const cleanSymbol = symbol.toUpperCase();
    
    // Check if it's explicitly preloaded
    if (this.STOCK_PROFILES[cleanSymbol]) {
      // Complete missing fields with defaults if not set
      const profile = this.STOCK_PROFILES[cleanSymbol];
      if (profile.peRatio === undefined) profile.peRatio = 22.5;
      if (profile.pbRatio === undefined) profile.pbRatio = 3.2;
      if (profile.isin === undefined) profile.isin = `INE${cleanSymbol.substring(0,3)}A01015`;
      return profile;
    }

    // Otherwise, generate a deterministic mock profile based on symbol hashing
    let hash = 0;
    for (let i = 0; i < cleanSymbol.length; i++) {
      hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const random = (seedOffset: number) => {
      const x = Math.sin(hash + seedOffset) * 10000;
      return x - Math.floor(x);
    };

    const caps = ["Large Cap", "Mid Cap", "Small Cap"];
    const cap = caps[Math.floor(random(1) * 3)];
    
    const sectors = [
      "Banking", "IT", "Automobile", "Energy", "Infrastructure", "Healthcare", 
      "Chemical", "Real Estate", "Metal", "Pharma", "Defence", "Railways", 
      "Telecom", "Consumer", "Finance", "Insurance", "FMCG", "Power", 
      "Textile", "Agri", "Logistics", "Media"
    ];
    const sector = sectors[Math.floor(random(2) * sectors.length)];
    const exchange = random(3) > 0.5 ? "NSE" : "BSE";
    
    const basePrice = Math.floor(50 + random(4) * 4500);
    const pe = Number((12 + random(5) * 60).toFixed(2));
    const pb = Number((1.2 + random(6) * 12).toFixed(2));
    const divYield = Number((random(7) * 3).toFixed(2));
    const roe = Number((6 + random(8) * 28).toFixed(2));
    const roce = Number((roe + random(9) * 8).toFixed(2));
    const eps = Number((basePrice / pe).toFixed(2));
    
    const marketCap = cap === "Large Cap" 
      ? Math.floor(80000 + random(10) * 1200000) 
      : cap === "Mid Cap" 
        ? Math.floor(18000 + random(10) * 62000)
        : Math.floor(800 + random(10) * 17200);

    const isin = `INE${Math.floor(100000 + random(11) * 899999)}A01015`;
    const promo = Number((32 + random(12) * 43).toFixed(2));
    const fii = Number((4 + random(13) * 22).toFixed(2));
    const dii = Number((4 + random(14) * 22).toFixed(2));
    const pub = Number((100 - promo - dii - fii).toFixed(2));

    // Construct 4 peers in the same sector
    const peers = [cleanSymbol];
    const basePeers = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "TATAMOTORS", "ZOMATO"];
    basePeers.forEach(p => {
      if (p !== cleanSymbol && peers.length < 4) peers.push(p);
    });

    return {
      name: `${cleanSymbol} Industries Ltd.`,
      ticker: cleanSymbol,
      marketCapitalization: marketCap,
      shareOutstanding: Math.floor(marketCap / basePrice * 10),
      weburl: `https://www.${cleanSymbol.toLowerCase()}.co.in`,
      logoUrl: `https://logo.clearbit.com/${cleanSymbol.toLowerCase()}.com`,
      finnhubIndustry: sector,
      sector,
      exchange,
      isin,
      enterpriseValue: Math.floor(marketCap * (1.04 + random(16) * 0.15)),
      fiftyTwoWeekHigh: Number((basePrice * (1.15 + random(17) * 0.35)).toFixed(2)),
      fiftyTwoWeekLow: Number((basePrice * (0.65 + random(18) * 0.25)).toFixed(2)),
      faceValue: random(19) > 0.6 ? 10 : 2,
      bookValue: Number((basePrice / pb).toFixed(2)),
      dividendYield: divYield,
      peRatio: pe,
      pbRatio: pb,
      eps,
      roe,
      roce,
      debtToEquity: Number((random(20) * 2.1).toFixed(2)),
      revenue: Math.floor(marketCap * 0.26),
      profit: Math.floor(marketCap * 0.034),
      quarterlyResults: [
        { quarter: "Q4 FY26", revenue: Math.floor(marketCap * 0.065), profit: Math.floor(marketCap * 0.008) },
        { quarter: "Q3 FY26", revenue: Math.floor(marketCap * 0.063), profit: Math.floor(marketCap * 0.007) },
        { quarter: "Q2 FY26", revenue: Math.floor(marketCap * 0.059), profit: Math.floor(marketCap * 0.006) }
      ],
      annualResults: [
        { year: "FY26", revenue: Math.floor(marketCap * 0.25), profit: Math.floor(marketCap * 0.032) },
        { year: "FY25", revenue: Math.floor(marketCap * 0.23), profit: Math.floor(marketCap * 0.028) }
      ],
      shareholdingPattern: { promoter: promo, dii, fii, public: pub },
      dividendHistory: [
        { date: "2026-06-20", amount: Number((basePrice * 0.012).toFixed(2)), type: "Final" },
        { date: "2025-11-15", amount: Number((basePrice * 0.009).toFixed(2)), type: "Interim" }
      ],
      corporateActions: [
        { date: "2026-05-12", action: "Splits", ratio: "1:5" }
      ],
      peers,
      aiAnalysis: {
        outlook: `Stable mid-term horizon forecast. Strong positioning within the domestic ${sector} corridor.`,
        strength: "High brand presence and consistent double-digit operational margin expansion.",
        weakness: "Rising competition and dependency on domestic rate-cut timetables.",
        opportunity: "Leveraging digital transformation tools and exports.",
        threat: "Commodity cost hikes and FX pricing volatility.",
        valuationScore: Math.floor(58 + random(21) * 36),
        sentimentScore: Math.floor(50 + random(22) * 44)
      },
      riskScore: Math.floor(15 + random(23) * 65)
    };
  }

  // Returns deterministic base price for symbol
  public static getBasePrice(symbol: string): number {
    const cleanSymbol = symbol.toUpperCase();
    if (this.BASE_PRICES[cleanSymbol] !== undefined) {
      return this.BASE_PRICES[cleanSymbol];
    }
    
    let hash = 0;
    for (let i = 0; i < cleanSymbol.length; i++) {
      hash = cleanSymbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash + 4) * 10000;
    const random = x - Math.floor(x);
    return Math.floor(60 + random * 4800); // returns 60 - 4860 INR base price
  }

  public async getQuote(symbol: string): Promise<StockQuote> {
    const cleanSymbol = symbol.toUpperCase();
    const basePrice = MockStockProvider.getBasePrice(cleanSymbol);
    
    // Simulate slight fluctuation (+-0.4%)
    const fluctuation = basePrice * (Math.random() - 0.5) * 0.008;
    const currentPrice = Number((basePrice + fluctuation).toFixed(2));
    const previousClose = Number(basePrice.toFixed(2));
    const priceChange = Number((currentPrice - previousClose).toFixed(2));
    const percentChange = Number(((priceChange / previousClose) * 100).toFixed(2));
    
    return {
      currentPrice,
      highPrice: Number((Math.max(currentPrice, previousClose) + Math.random() * 0.4).toFixed(2)),
      lowPrice: Number((Math.min(currentPrice, previousClose) - Math.random() * 0.4).toFixed(2)),
      openPrice: Number((previousClose + (Math.random() - 0.5) * 0.2).toFixed(2)),
      previousClose,
      percentChange,
      timestamp: Math.floor(Date.now() / 1000)
    };
  }

  public async getProfile(symbol: string): Promise<StockProfile> {
    return MockStockProvider.getGeneratedProfile(symbol);
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
      
    // Generate matched symbols if list is small to ensure 1000+ support
    if (results.length < 10) {
      const generatedList = [
        "BAJFINANCE", "BAJAJFINSV", "LIC", "IRFC", "IREDA", "PFC", "REC", "COALINDIA", 
        "NTPC", "POWERGRID", "ONGC", "IOC", "BPCL", "HPCL", "OIL", "ADANIENT", "ADANIPORTS", 
        "ADANIGREEN", "ADANIPOWER", "ADANIENSOL", "ADANITOTAL", "TATASTEEL", "TITAN", 
        "TRENT", "TATACONSUM", "TATAPOWER", "TATACHEM", "TATACOMM", "TATAELXSI", "WIPRO", 
        "HCLTECH", "LTIM", "PERSISTENT", "COFORGE", "MPHASIS", "OFSS", "TECHM", "LT", 
        "ULTRACEMCO", "SHREECEM", "ACC", "AMBUJACEM", "JSWSTEEL", "SAIL", "HINDALCO", 
        "VEDL", "NMDC", "HAL", "BEL", "BHEL", "MAZDOCK", "GRSE", "COCHINSHIP", "DATAPATTERNS", 
        "PARAS", "BDL", "IRCTC", "RVNL", "RAILTEL", "IRCON", "CONCOR", "MARUTI", "M&M", 
        "HEROMOTOCO", "TVSMOTOR", "ASHOKLEY", "BAJAJ-AUTO", "EICHERMOT", "SUNPHARMA", 
        "REDDY", "CIPLA", "LUPIN", "AUROPHARMA", "APOLLOHOSP", "FORTIS", "MAXHEALTH", 
        "ASIANPAINT", "PIDILITEIND", "BERGEPAINT", "DIXON", "HAVELLS", "VOLTAS", "BLUESTARCO", 
        "GODREJCP", "DABUR", "NESTLEIND", "BRITANNIA", "ITC", "HINDUNILVR", "PAYTM", 
        "POLICYBZR", "NYKAA", "DELHIVERY", "NAZARA", "EASYTRIP", "KPITTECH", "ANGELONE", 
        "MOTILALOFS"
      ];

      generatedList
        .filter(item => item.includes(cleanQuery))
        .forEach(item => {
          if (!results.some(r => r.symbol === item)) {
            results.push({
              symbol: item,
              description: `${item} Limited (NSE)`,
              type: "Common Stock"
            });
          }
        });
    }

    // Dynamic search fallback generator to mock out 1000+ companies
    if (results.length === 0 && query.length >= 2) {
      for (let i = 1; i <= 5; i++) {
        const ticker = `${cleanQuery}${i}`;
        if (ticker.length <= 10) {
          results.push({
            symbol: ticker,
            description: `${ticker} Industries Limited`,
            type: "Common Stock"
          });
        }
      }
    }
    
    return results.slice(0, 15);
  }

  public async getDailyTimeSeries(symbol: string, days = 100): Promise<Candlestick[]> {
    const cleanSymbol = symbol.toUpperCase();
    let currentPrice = MockStockProvider.getBasePrice(cleanSymbol);
    const series: Candlestick[] = [];
    const now = Math.floor(Date.now() / 1000);
    const dayInSeconds = 24 * 60 * 60;
    
    for (let i = days; i >= 0; i--) {
      const volatility = 0.012; // daily volatility
      const changePercent = (Math.random() - 0.49) * volatility;
      const openPrice = currentPrice;
      const closePrice = openPrice * (1 + changePercent);
      const highPrice = Math.max(openPrice, closePrice) * (1 + Math.random() * 0.004);
      const lowPrice = Math.min(openPrice, closePrice) * (1 - Math.random() * 0.004);
      const volume = Math.floor(500000 + Math.random() * 5000000);
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
