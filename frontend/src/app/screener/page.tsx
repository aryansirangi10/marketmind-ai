// ==============================================================================
// Screener Dashboard Page Component
// ==============================================================================

"use client";

import React, { useState, useMemo } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";

interface ScreenerAsset {
  symbol: string;
  name: string;
  type: "STOCK" | "CRYPTO";
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}

export default function ScreenerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "STOCK" | "CRYPTO">("ALL");
  const [sortKey, setSortKey] = useState<keyof ScreenerAsset>("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const assets: ScreenerAsset[] = [
    { symbol: "AAPL", name: "Apple Inc.", type: "STOCK", price: 185.24, change24h: 1.45, marketCap: 3120000000000, volume24h: 52400000 },
    { symbol: "MSFT", name: "Microsoft Corp.", type: "STOCK", price: 421.90, change24h: -0.85, marketCap: 3080000000000, volume24h: 22800000 },
    { symbol: "GOOGL", name: "Alphabet Inc.", type: "STOCK", price: 172.50, change24h: 0.12, marketCap: 2150000000000, volume24h: 18400000 },
    { symbol: "NVDA", name: "NVIDIA Corp.", type: "STOCK", price: 128.50, change24h: 4.85, marketCap: 3150000000000, volume24h: 145000000 },
    { symbol: "BTC", name: "Bitcoin", type: "CRYPTO", price: 65800.00, change24h: 1.82, marketCap: 1290000000000, volume24h: 28400000000 },
    { symbol: "ETH", name: "Ethereum", type: "CRYPTO", price: 3450.00, change24h: -1.65, marketCap: 414000000000, volume24h: 14200000000 },
    { symbol: "SOL", name: "Solana", type: "CRYPTO", price: 148.20, change24h: 3.92, marketCap: 68000000000, volume24h: 3200000000 },
    { symbol: "XRP", name: "Ripple", type: "CRYPTO", price: 0.42, change24h: -4.10, marketCap: 23000000000, volume24h: 980000000 }
  ];

  const handleSort = (key: keyof ScreenerAsset) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchesQuery = 
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "ALL" || asset.type === activeFilter;
        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "string" || typeof bVal === "string") return 0;
        
        return sortOrder === "asc" 
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      });
  }, [searchQuery, activeFilter, sortKey, sortOrder]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Market Screener</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Filter and sort assets across global stocks and cryptocurrencies</p>
        </div>

        {/* Filters Controls Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-border">
          {/* Category Tabs */}
          <div className="flex bg-slate-950 p-0.5 border border-border rounded-xl self-stretch sm:self-auto">
            <button 
              onClick={() => setActiveFilter("ALL")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === "ALL" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              All Assets
            </button>
            <button 
              onClick={() => setActiveFilter("STOCK")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === "STOCK" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              Stocks
            </button>
            <button 
              onClick={() => setActiveFilter("CRYPTO")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeFilter === "CRYPTO" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              Crypto
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-border text-xs w-full sm:w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search symbol or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white focus:outline-none placeholder-muted-foreground w-full"
            />
          </div>
        </div>

        {/* Screener Table */}
        <div className="glass-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs select-none">
              <thead>
                <tr className="border-b border-border bg-slate-950 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Asset Type</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("price")}>
                    <div className="flex items-center gap-1.5">Price <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("change24h")}>
                    <div className="flex items-center gap-1.5">24h Change <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("marketCap")}>
                    <div className="flex items-center gap-1.5">Market Cap <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort("volume24h")}>
                    <div className="flex items-center gap-1.5">Volume (24h) <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredAndSortedAssets.length > 0 ? (
                  filteredAndSortedAssets.map((asset) => {
                    const isPositive = asset.change24h >= 0;
                    return (
                      <tr key={asset.symbol} className="hover:bg-white/5 transition-colors text-white font-medium">
                        <td className="p-4 font-bold text-indigo-400">{asset.symbol}</td>
                        <td className="p-4 text-muted-foreground">{asset.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-border text-[9px] font-bold text-muted-foreground">
                            {asset.type}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-semibold">${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 font-mono">
                          <span className={`flex items-center gap-1 font-semibold ${isGainerStyle(isPositive)}`}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{formatNumber(asset.marketCap)}</td>
                        <td className="p-4 font-mono text-muted-foreground">{formatNumber(asset.volume24h)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">
                      No assets match the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function isGainerStyle(positive: boolean): string {
  return positive ? "text-green-400" : "text-red-400";
}
