// ==============================================================================
// Live NewsAPI Provider Implementation
// ==============================================================================

import { INewsProvider, NewsArticle } from "../../../domain/providers/news-provider.interface";

export class NewsAPIProvider implements INewsProvider {
  private readonly apiKey: string;
  private readonly baseUrl = "https://newsapi.org/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getLatestNews(category?: string, limit = 5): Promise<NewsArticle[]> {
    const q = category ? encodeURIComponent(category) : "finance OR markets";
    const res = await fetch(`${this.baseUrl}/everything?q=${q}&sortBy=publishedAt&pageSize=${limit}&apiKey=${this.apiKey}`);
    
    if (!res.ok) {
      throw new Error(`NewsAPI error: ${res.statusText}`);
    }
    const data = await res.json() as any;
    const articles = data.articles || [];

    return articles.map((article: any, index: number) => ({
      id: `newsapi_${index}_${Date.now()}`,
      title: article.title || "",
      description: article.description || "",
      source: article.source?.name || "NewsAPI",
      url: article.url || "",
      imageUrl: article.urlToImage || "",
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      summary: article.content || ""
    }));
  }
}
