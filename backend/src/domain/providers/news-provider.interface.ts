// ==============================================================================
// Domain Interfaces for News Data Providers
// ==============================================================================

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: Date;
  summary?: string;
  sentimentScore?: number; // Calculated field if NLP is run
}

export interface INewsProvider {
  /**
   * Fetches latest financial/market news articles
   */
  getLatestNews(category?: string, limit?: number): Promise<NewsArticle[]>;
}
