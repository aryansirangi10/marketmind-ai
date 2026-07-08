// ==============================================================================
// Premium Dashboard Page (Customizable Grid Layout & Shimmer skeletons)
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import LayoutShell from "@/components/layout-shell";
import TickerTape from "@/components/ticker-tape";
import MarketChart from "@/components/market-chart";
import WatchlistPanel from "@/components/watchlist-panel";
import EconomicCalendar from "@/components/economic-calendar";
import MarketHeatmap from "@/components/market-heatmap";
import TopMovers from "@/components/top-movers";
import { 
  Search, 
  Globe, 
  Activity, 
  Sliders,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface QuoteResponse {
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  percentChange: number;
  timestamp: number;
}

interface WidgetConfig {
  id: string;
  name: string;
  visible: boolean;
}

export default function DashboardPage() {
  const [activeAsset, setActiveAsset] = useState<{ symbol: string; type: "STOCK" | "CRYPTO" }>({
    symbol: "AAPL",
    type: "STOCK"
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string; type: "STOCK" | "CRYPTO" }>>([]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Widget Layout Configuration (with persistence)
  const [widgets, setWidgets] = useState<WidgetConfig[]>([
    { id: "chart", name: "Price Technical Chart", visible: true },
    { id: "watchlist", name: "Watchlist & Command Desk", visible: true },
    { id: "movers", name: "Top Gainers & Losers", visible: true },
    { id: "heatmap", name: "Market Sector Heatmap", visible: true },
    { id: "calendar", name: "Economic Event Calendar", visible: true }
  ]);

  // Load persistent dashboard layouts from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("marketmind_dashboard_layout");
    if (savedLayout) {
      try {
        setWidgets(JSON.parse(savedLayout));
      } catch {
        // Fallback to default
      }
    }
  }, []);

  const saveLayout = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem("marketmind_dashboard_layout", JSON.stringify(newWidgets));
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = widgets.map((w) => w.id === id ? { ...w, visible: !w.visible } : w);
    saveLayout(updated);
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const newWidgets = [...widgets];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newWidgets.length) {
      // Swap widgets
      const temp = newWidgets[index];
      newWidgets[index] = newWidgets[targetIndex];
      newWidgets[targetIndex] = temp;
      saveLayout(newWidgets);
    }
  };

  // Fetch real-time quotes using TanStack Query
  const { data: quote, isLoading: isQuoteLoading } = useQuery<QuoteResponse>({
    queryKey: ["quote", activeAsset.symbol],
    queryFn: async () => {
      const endpoint = activeAsset.type === "CRYPTO" 
        ? `${API_BASE_URL}/crypto/${activeAsset.symbol}/quote`
        : `${API_BASE_URL}/stocks/${activeAsset.symbol}/quote`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch quote");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 10000
  });

  // Fetch chart candle details
  const { data: candles, isLoading: isCandlesLoading } = useQuery<any[]>({
    queryKey: ["candles", activeAsset.symbol],
    queryFn: async () => {
      const endpoint = activeAsset.type === "CRYPTO"
        ? `${API_BASE_URL}/crypto/${activeAsset.symbol}/candles?interval=1d&limit=100`
        : `${API_BASE_URL}/stocks/${activeAsset.symbol}/candles?days=100`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch candles");
      const json = await res.json();
      return json.data;
    }
  });

  // Trigger search on query changes
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const mockDataset = [
      { symbol: "AAPL", name: "Apple Inc.", type: "STOCK" as const },
      { symbol: "MSFT", name: "Microsoft Corporation", type: "STOCK" as const },
      { symbol: "GOOGL", name: "Alphabet Inc.", type: "STOCK" as const },
      { symbol: "NVDA", name: "NVIDIA Corporation", type: "STOCK" as const },
      { symbol: "TSLA", name: "Tesla Inc.", type: "STOCK" as const },
      { symbol: "BTC", name: "Bitcoin", type: "CRYPTO" as const },
      { symbol: "ETH", name: "Ethereum", type: "CRYPTO" as const },
      { symbol: "SOL", name: "Solana", type: "CRYPTO" as const },
      { symbol: "XRP", name: "Ripple", type: "CRYPTO" as const }
    ];

    const query = searchQuery.toUpperCase();
    const matches = mockDataset.filter(item => 
      item.symbol.includes(query) || 
      item.name.toUpperCase().includes(query)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  // Listen to Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAssetSelect = (symbol: string, type: "STOCK" | "CRYPTO") => {
    setActiveAsset({ symbol, type });
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const isPositive = quote ? quote.percentChange >= 0 : true;

  // Render a specific widget based on its ID
  const renderWidget = (id: string) => {
    switch (id) {
      case "chart":
        return (
          <div key="chart" className="lg:col-span-2 min-h-[432px]">
            <MarketChart 
              symbol={activeAsset.symbol} 
              data={candles || []} 
              isLoading={isCandlesLoading} 
            />
          </div>
        );
      case "watchlist":
        return (
          <div key="watchlist" className="h-[432px]">
            <WatchlistPanel 
              onSelectAsset={handleAssetSelect} 
              activeSymbol={activeAsset.symbol} 
            />
          </div>
        );
      case "movers":
        return (
          <div key="movers" className="h-[320px]">
            <TopMovers />
          </div>
        );
      case "heatmap":
        return (
          <div key="heatmap" className="h-[320px]">
            <MarketHeatmap />
          </div>
        );
      case "calendar":
        return (
          <div key="calendar" className="h-[320px]">
            <EconomicCalendar />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TickerTape />

      <LayoutShell onSearchClick={() => setIsSearchOpen(true)}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Dashboard Header & Customizer Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Market Board</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time analytical viewports and custom workspace</p>
            </div>
            
            <button 
              onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs text-muted-foreground hover:text-white hover:border-white/15 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize Layout</span>
            </button>
          </div>

          {/* Customize Panel Drawer */}
          {isCustomizeOpen && (
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-border/80 space-y-3.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Arrange Dashboard Panels</span>
              <div className="flex flex-wrap gap-3">
                {widgets.map((widget, idx) => (
                  <div 
                    key={widget.id} 
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-border text-xs text-white"
                  >
                    <button 
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="text-muted-foreground hover:text-indigo-400 cursor-pointer"
                    >
                      {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                    </button>
                    <span className={`font-medium ${!widget.visible && "line-through text-muted-foreground"}`}>
                      {widget.name}
                    </span>
                    <div className="flex items-center gap-1 ml-2 border-l border-border/50 pl-2">
                      <button 
                        disabled={idx === 0} 
                        onClick={() => moveWidget(idx, "up")}
                        className="text-muted-foreground hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button 
                        disabled={idx === widgets.length - 1} 
                        onClick={() => moveWidget(idx, "down")}
                        className="text-muted-foreground hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Panel: Asset Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Real-time price widget */}
            <div className="glass-card p-6 rounded-2xl border border-border">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">REAL-TIME PRICE</span>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-3xl font-mono font-bold text-white">
                  {isQuoteLoading ? (
                    <span className="h-8 w-24 bg-white/5 animate-pulse inline-block rounded" />
                  ) : (
                    `$${quote?.currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  )}
                </span>
                <span className={`text-xs font-semibold flex items-center ${isPositive ? "text-green-400" : "text-red-400"}`}>
                  {quote ? (isPositive ? `+${quote.percentChange}%` : `${quote.percentChange}%`) : ""}
                </span>
              </div>
            </div>

            {/* High/Low widget */}
            <div className="glass-card p-6 rounded-2xl border border-border">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">24H RANGE</span>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">24H HIGH</p>
                  <p className="text-sm font-mono font-semibold text-green-400 mt-0.5">
                    {isQuoteLoading ? "..." : `$${quote?.highPrice.toFixed(2)}`}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">24H LOW</p>
                  <p className="text-sm font-mono font-semibold text-red-400 mt-0.5">
                    {isQuoteLoading ? "..." : `$${quote?.lowPrice.toFixed(2)}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Market cap mock statistic */}
            <div className="glass-card p-6 rounded-2xl border border-border">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">VALUATION</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">EST. MARKET CAP</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {activeAsset.type === "CRYPTO" ? "$1.28 Trillion" : "$3.12 Trillion"}
                  </p>
                </div>
              </div>
            </div>

            {/* Trading activity mock statistic */}
            <div className="glass-card p-6 rounded-2xl border border-border">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">LIQUIDITY</span>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">24H VOL / SPREAD</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {activeAsset.type === "CRYPTO" ? "$28.4 Billion" : "52.4 Million / 0.01%"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Grid Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {widgets
              .filter((w) => w.visible)
              .map((w) => renderWidget(w.id))}
          </div>
        </div>
      </aside>

      {/* --------------------------------------------------------------------------
         Search Everywhere Modal (Command Palette)
         -------------------------------------------------------------------------- */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsSearchOpen(false)}
          />

          <div className="relative w-full max-w-lg glass-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[350px]">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search stocks, crypto, indices... (e.g. AAPL, BTC)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-muted-foreground focus:outline-none"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-xs text-muted-foreground hover:text-white px-2 py-1 rounded bg-white/5 border border-border"
              >
                Esc
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {searchResults.length > 0 ? (
                <div className="space-y-0.5">
                  {searchResults.map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleAssetSelect(item.symbol, item.type)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between text-xs transition-colors group"
                    >
                      <div>
                        <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.symbol}
                        </span>
                        <span className="text-muted-foreground ml-3">{item.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-400/10 text-[10px] font-bold">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim().length > 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  No matching assets found. Try searching "AAPL", "NVDA", or "BTC".
                </div>
              ) : (
                <div className="py-8 px-4 text-center text-xs text-muted-foreground space-y-1">
                  <p>Type a ticker symbol or name to search.</p>
                  <p className="text-[10px] opacity-75">Common items: AAPL, TSLA, MSFT, BTC, ETH, SOL</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
