// ==============================================================================
// Mock News Provider Implementation
// ==============================================================================

import { INewsProvider, NewsArticle } from "../../../domain/providers/news-provider.interface";

export class MockNewsProvider implements INewsProvider {
  private static readonly NEWS_ARTICLES: NewsArticle[] = [
    {
      id: "news_1",
      title: "Federal Reserve Hints at Possible Rate Cuts in Q3",
      description: "The Federal Reserve chairman suggested inflation figures are nearing targets, sparking a rally in major indexes.",
      source: "Bloomberg Terminal (Mock)",
      url: "https://example.com/fed-rate-cuts",
      imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
      summary: "The central bank hinted that policy easing might begin sooner than anticipated, boosting sentiment across both equity and crypto markets.",
      sentimentScore: 0.65
    },
    {
      id: "news_2",
      title: "Bitcoin Surpasses $65,000 as Institutional Inflow Surges",
      description: "Spot ETFs saw record net inflows yesterday, leading to significant liquidations of short contracts.",
      source: "CoinDesk (Mock)",
      url: "https://example.com/bitcoin-inflows",
      imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 45 * 60000), // 45 mins ago
      summary: "Renewed demand from institutional buyers through ETF pipelines has pushed Bitcoin back above key resistance levels.",
      sentimentScore: 0.8
    },
    {
      id: "news_3",
      title: "NVIDIA Outperforms Earnings Estimates Again, Stock Spikes 6%",
      description: "AI chip demand shows no signs of slowing down as major cloud service providers continue capital expenditure expansions.",
      source: "Reuters (Mock)",
      url: "https://example.com/nvidia-earnings",
      imageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
      summary: "Data Center revenue grew 150% year-on-year, cementing Nvidia's lead in the AI hardware supply chain.",
      sentimentScore: 0.9
    },
    {
      id: "news_4",
      title: "Solana Transaction Fees Drop to Record Lows as Network Upgrades Deploy",
      description: "Network patches have resolved congestions, causing a surge in decentralized exchange trading volumes.",
      source: "CoinTelegraph (Mock)",
      url: "https://example.com/solana-network",
      imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 5 * 3600000), // 5 hours ago
      summary: "The successful implementation of priority fee structures has improved throughput and overall user experience.",
      sentimentScore: 0.7
    },
    {
      id: "news_5",
      title: "Regulatory Concerns Creep Back into Crypto Markets",
      description: "SEC announces wider investigation into decentralized finance protocols and liquid staking platforms.",
      source: "Wall Street Journal (Mock)",
      url: "https://example.com/sec-defi-investigation",
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
      publishedAt: new Date(Date.now() - 10 * 3600000), // 10 hours ago
      summary: "The threat of enforcement actions has created short-term selling pressure in altcoins.",
      sentimentScore: -0.5
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
          a.title.toLowerCase().includes("solana")
        );
      } else if (cleanCat === "stocks" || cleanCat === "equity") {
        filtered = MockNewsProvider.NEWS_ARTICLES.filter(a => 
          a.title.toLowerCase().includes("nvidia") || 
          a.title.toLowerCase().includes("fed") || 
          a.title.toLowerCase().includes("rate")
        );
      }
    }
    
    return filtered.slice(0, limit);
  }
}
