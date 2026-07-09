// ==============================================================================
// Mock News Provider Implementation
// ==============================================================================

import { INewsProvider, NewsArticle } from "../../../domain/providers/news-provider.interface";

export class MockNewsProvider implements INewsProvider {
  private static readonly NEWS_ARTICLES: NewsArticle[] = [
    {
      id: "news_in_1",
      title: "Jio IPO Value Set at $100B, Reliance Retail Expansion Plans Unveiled",
      description: "The Economic Times reports that Reliance Industries plans to unlock massive value for shareholders through retail and telecom listing roadmaps.",
      source: "Economic Times (ET)",
      url: "https://example.com/et-reliance-jio-ipo",
      imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 12 * 60000), // 12 mins ago
      summary: "Analysts target ₹3,200 as key upside resistance for Reliance Industries shares as telecom listings gain timeline clarity.",
      sentimentScore: 0.85,
      impactScore: "HIGH"
    },
    {
      id: "news_in_2",
      title: "Nifty 50 Surpasses 23,500 Psychological Level on Strong Mutual Fund Inflows",
      description: "Moneycontrol reports domestic institutional investors (DIIs) recorded net purchases of ₹4,200 crore yesterday, keeping indices elevated.",
      source: "Moneycontrol",
      url: "https://example.com/mc-nifty-inflows",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 25 * 60000), // 25 mins ago
      summary: "Strong local liquidity buffers continue to balance minor FII outflows, keeping the market trend bullish.",
      sentimentScore: 0.7,
      impactScore: "HIGH"
    },
    {
      id: "news_in_3",
      title: "RBI MPC Holds Repo Rate Constant at 6.50%, Citing Inflation Focus",
      description: "Governor Shaktikanta Das announced that the Reserve Bank of India will continue withdrawal of accommodation policy to align CPI with the 4% target.",
      source: "CNBC TV18",
      url: "https://example.com/cnbctv18-rbi-policy",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 55 * 60000), // 55 mins ago
      summary: "Interest rates remain unchanged; rates are projected to adjust in Q4 FY26 if food inflation remains benign.",
      sentimentScore: 0.15,
      impactScore: "MEDIUM"
    },
    {
      id: "news_in_4",
      title: "TCS Bags $1.5 Billion Strategic Digital Transformation Deal from European Banking Consortium",
      description: "Financial Express reports that the large order inflow will boost TCS margins and software sector sentiments across Nifty IT.",
      source: "Financial Express",
      url: "https://example.com/fe-tcs-banking-deal",
      imageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 3 * 3600000), // 3 hours ago
      summary: "IT services majors report solid order book pipelines despite high interest rates in Western economies.",
      sentimentScore: 0.75,
      impactScore: "HIGH"
    },
    {
      id: "news_in_5",
      title: "Pre-Budget Meeting Proposes 15% CapEx Hike for Railway & Infrastructure Projects",
      description: "Business Standard reports that government planners aim to scale transportation capex, directly boosting infrastructure contractors.",
      source: "Business Standard",
      url: "https://example.com/bs-budget-capex",
      imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 6 * 3600000), // 6 hours ago
      summary: "Capital outlays will prioritize transport grid capacity expansion, supporting companies like RVNL, IRFC, and L&T.",
      sentimentScore: 0.8,
      impactScore: "HIGH"
    },
    {
      id: "news_in_6",
      title: "SEBI Proposes Stricter Disclosures and Audits for SME Listings",
      description: "Mint reports that the market regulator aims to safeguard retail investors from volatile movements and inflated pricing in micro-cap companies.",
      source: "Mint",
      url: "https://example.com/mint-sebi-sme",
      imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 12 * 3600000), // 12 hours ago
      summary: "The proposed rules increase the minimal operating track record required for listings, aimed at cooling hyper-speculation.",
      sentimentScore: -0.2,
      impactScore: "MEDIUM"
    },
    {
      id: "news_in_7",
      title: "Global Bitcoin ETF Inflows Surpass $2.5B in Weekly Volume",
      description: "Bloomberg India reports spot Bitcoin funds saw massive weekly inflows, driving short contract liquidations.",
      source: "Bloomberg India",
      url: "https://example.com/bloomberg-bitcoin-etf",
      imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 18 * 3600000), // 18 hours ago
      summary: "Strong accumulation support from institutional buyers keeps BTC consolidating within target bull zones.",
      sentimentScore: 0.8,
      impactScore: "HIGH"
    }
  ];

  public async getLatestNews(category?: string, limit = 5): Promise<NewsArticle[]> {
    let filtered = MockNewsProvider.NEWS_ARTICLES;
    
    if (category) {
      const cleanCat = category.toLowerCase();
      if (cleanCat === "crypto") {
        filtered = MockNewsProvider.NEWS_ARTICLES.filter(a => 
          a.title.toLowerCase().includes("bitcoin") || 
          a.title.toLowerCase().includes("crypto") || 
          a.title.toLowerCase().includes("solana") ||
          a.source.toLowerCase().includes("coindesk")
        );
      } else if (cleanCat === "stocks" || cleanCat === "equity") {
        filtered = MockNewsProvider.NEWS_ARTICLES.filter(a => 
          a.title.toLowerCase().includes("reliance") || 
          a.title.toLowerCase().includes("nifty") || 
          a.title.toLowerCase().includes("rbi") || 
          a.title.toLowerCase().includes("tcs") || 
          a.title.toLowerCase().includes("sebi") || 
          a.title.toLowerCase().includes("budget") ||
          a.source.toLowerCase().includes("et") ||
          a.source.toLowerCase().includes("moneycontrol")
        );
      }
    }
    
    return filtered.slice(0, limit);
  }
}
