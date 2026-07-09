// ==============================================================================
// Market News Hub - Frontend Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LayoutShell from "@/components/layout-shell";
import TickerTape from "@/components/ticker-tape";
import { 
  Newspaper, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Clock, 
  ExternalLink,
  RefreshCw 
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  summary?: string;
  sentimentScore?: number;
}

export default function NewsHubPage() {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "STOCKS" | "CRYPTO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isLoading, refetch, isRefetching } = useQuery<NewsArticle[]>({
    queryKey: ["market-news", activeCategory],
    queryFn: async () => {
      const catParam = activeCategory === "ALL" ? "" : `?category=${activeCategory}`;
      const res = await fetch(`${API_BASE_URL}/news${catParam}`);
      if (!res.ok) throw new Error("Server error fetching news articles");
      const json = await res.json();
      return json.data;
    }
  });

  const filteredArticles = articles?.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSentimentDetails = (score?: number) => {
    if (score === undefined) return { label: "Neutral", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: Minus };
    if (score >= 0.25) return { label: "Bullish", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: TrendingUp };
    if (score <= -0.25) return { label: "Bearish", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: TrendingDown };
    return { label: "Neutral", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: Minus };
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TickerTape />

      <LayoutShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Global Feeds</span>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                Financial News Terminal
              </h2>
            </div>
            
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
              Sync Feeds
            </button>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-border select-none">
            {/* Category Tabs */}
            <div className="flex bg-slate-950 p-0.5 border border-border rounded-xl self-stretch md:self-auto">
              <button 
                onClick={() => setActiveCategory("ALL")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeCategory === "ALL" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                All Feeds
              </button>
              <button 
                onClick={() => setActiveCategory("STOCKS")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeCategory === "STOCKS" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Equities
              </button>
              <button 
                onClick={() => setActiveCategory("CRYPTO")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeCategory === "CRYPTO" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                Cryptocurrency
              </button>
            </div>

            {/* Keyword Search */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-border text-xs w-full md:w-80">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search headlines, summaries or sources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white focus:outline-none placeholder-muted-foreground w-full"
              />
            </div>
          </div>

          {/* News articles Grid stream */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="glass-card p-5 rounded-2xl border border-border animate-pulse space-y-4">
                  <div className="h-44 bg-slate-800 rounded-xl" />
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredArticles && filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => {
                const sentiment = getSentimentDetails(article.sentimentScore);
                const DateIcon = sentiment.icon;
                return (
                  <div key={article.id} className="glass-card rounded-2xl border border-border overflow-hidden flex flex-col hover:border-white/10 transition-all group">
                    {/* Cover image if exists */}
                    {article.imageUrl && (
                      <div className="h-48 w-full overflow-hidden bg-slate-900 border-b border-border/40 relative">
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Source overlay tag */}
                        <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-bold text-slate-300">
                          {article.source}
                        </span>
                      </div>
                    )}

                    {/* Article Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Time & Sentiment Row */}
                        <div className="flex items-center justify-between text-[10px] select-none font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className={`px-2 py-0.5 rounded border flex items-center gap-1 ${sentiment.color}`}>
                            <DateIcon className="w-3 h-3" />
                            {sentiment.label}
                          </span>
                        </div>

                        {/* Title & description */}
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {article.description}
                        </p>
                      </div>

                      {/* AI NLP summarization section */}
                      {article.summary && (
                        <div className="p-3 rounded-xl bg-white/[0.01] border border-border/40 text-[11px] leading-relaxed text-slate-300 italic">
                          <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-400 block not-italic mb-0.5">AI Summary</span>
                          "{article.summary}"
                        </div>
                      )}

                      {/* Link to source */}
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-bold text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors self-start select-none"
                      >
                        READ FULL REPORT <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center text-muted-foreground text-xs rounded-2xl border border-border select-none">
              <Newspaper className="w-12 h-12 mx-auto text-slate-700 mb-2" />
              No financial articles matched your active search filters.
            </div>
          )}
        </div>
      </LayoutShell>
    </div>
  );
}
