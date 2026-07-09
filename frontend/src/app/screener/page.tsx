// ==============================================================================
// Professional Stock & Crypto Screener Page Component
// ==============================================================================

"use client";

import React, { useState, useMemo } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  SlidersHorizontal 
} from "lucide-react";

interface ScreenerAsset {
  symbol: string;
  name: string;
  type: "STOCK" | "CRYPTO";
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  // Fundamental metrics
  peRatio?: number;
  dividendYield?: number;
  sector?: string;
  blockchain?: string;
}

export default function ScreenerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "STOCK" | "CRYPTO">("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [selectedBlockchain, setSelectedBlockchain] = useState("ALL");
  const [minPE, setMinPE] = useState("");
  const [maxPE, setMaxPE] = useState("");
  
  const [sortKey, setSortKey] = useState<keyof ScreenerAsset>("marketCap");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFiltersSidebar, setShowFiltersSidebar] = useState(true);

  const assets: ScreenerAsset[] = [
    { symbol: "AAPL", name: "Apple Inc.", type: "STOCK", price: 185.24, change24h: 1.45, marketCap: 3120000000000, volume24h: 52400000, peRatio: 28.4, dividendYield: 1.45, sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", type: "STOCK", price: 421.90, change24h: -0.85, marketCap: 3080000000000, volume24h: 22800000, peRatio: 35.2, dividendYield: 0.72, sector: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", type: "STOCK", price: 172.50, change24h: 0.12, marketCap: 2150000000000, volume24h: 18400000, peRatio: 24.5, dividendYield: 0.0, sector: "Technology" },
    { symbol: "JPM", name: "JPMorgan Chase & Co.", type: "STOCK", price: 195.40, change24h: 0.65, marketCap: 560000000000, volume24h: 10400000, peRatio: 12.1, dividendYield: 2.35, sector: "Finance" },
    { symbol: "BTC", name: "Bitcoin", type: "CRYPTO", price: 65800.00, change24h: 1.82, marketCap: 1290000000000, volume24h: 28400000000, blockchain: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum", type: "CRYPTO", price: 3450.00, change24h: -1.65, marketCap: 414000000000, volume24h: 14200000000, blockchain: "Ethereum" },
    { symbol: "SOL", name: "Solana", type: "CRYPTO", price: 148.20, change24h: 3.92, marketCap: 68000000000, volume24h: 3200000000, blockchain: "Solana" },
    { symbol: "UNI", name: "Uniswap", type: "CRYPTO", price: 7.25, change24h: -2.40, marketCap: 5800000000, volume24h: 180000000, blockchain: "Ethereum" }
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
        
        // Sector check for stocks
        const matchesSector = 
          selectedSector === "ALL" || 
          (asset.type === "STOCK" && asset.sector === selectedSector);
        
        // Blockchain check for cryptos
        const matchesBlockchain = 
          selectedBlockchain === "ALL" || 
          (asset.type === "CRYPTO" && asset.blockchain === selectedBlockchain);

        // PE checks
        let matchesPE = true;
        if (asset.peRatio !== undefined) {
          if (minPE && asset.peRatio < Number(minPE)) matchesPE = false;
          if (maxPE && asset.peRatio > Number(maxPE)) matchesPE = false;
        } else if (minPE || maxPE) {
          matchesPE = false; // Crypto assets don't have PE
        }

        return matchesQuery && matchesFilter && matchesSector && matchesBlockchain && matchesPE;
      })
      .sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal === undefined || bVal === undefined) return 0;
        if (typeof aVal === "string" || typeof bVal === "string") return 0;
        
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
  }, [searchQuery, activeFilter, selectedSector, selectedBlockchain, minPE, maxPE, sortKey, sortOrder]);

  const formatNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center select-none">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Market Screener</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Filter and sort assets across global stocks and cryptocurrencies</p>
          </div>
          <button
            onClick={() => setShowFiltersSidebar(!showFiltersSidebar)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-border text-xs text-slate-300 hover:text-white cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Toggle Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Advanced Filters Sidebar */}
          {showFiltersSidebar && (
            <div className="glass-card p-5 rounded-2xl border border-border space-y-5 lg:col-span-1 select-none animate-in slide-in-from-left duration-200">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-400" /> Screener Filters
              </h3>

              {/* Equity Sector filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Equity Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              {/* Crypto Blockchain filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Crypto Blockchain</label>
                <select
                  value={selectedBlockchain}
                  onChange={(e) => setSelectedBlockchain(e.target.value)}
                  className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Blockchains</option>
                  <option value="Bitcoin">Bitcoin Network</option>
                  <option value="Ethereum">Ethereum Ecosystem</option>
                  <option value="Solana">Solana Ecosystem</option>
                </select>
              </div>

              {/* P/E Ratio filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">P/E Ratio bounds</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPE}
                    onChange={(e) => setMinPE(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPE}
                    onChange={(e) => setMaxPE(e.target.value)}
                    className="w-full bg-slate-950 border border-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Screener Grid Panel */}
          <div className={showFiltersSidebar ? "lg:col-span-3 space-y-6" : "lg:col-span-4 space-y-6"}>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-border">
              {/* Category Tabs */}
              <div className="flex bg-slate-950 p-0.5 border border-border rounded-xl self-stretch sm:self-auto select-none">
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
                      <th className="p-4">Category (Sector/Chain)</th>
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
                            <td className="p-4 text-muted-foreground">
                              {asset.type === "STOCK" ? `${asset.sector} (P/E: ${asset.peRatio})` : `${asset.blockchain} Ecosystem`}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-muted-foreground text-xs">
                          No assets match the active search and filters criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

function isGainerStyle(positive: boolean): string {
  return positive ? "text-green-400" : "text-red-400";
}
