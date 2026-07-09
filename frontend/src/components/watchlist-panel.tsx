// ==============================================================================
// Watchlist Panel Component (Stocks & Cryptos Tables)
// ==============================================================================

"use client";

import React, { useState } from "react";
import { TrendingUp, TrendingDown, Eye } from "lucide-react";

interface AssetItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: "STOCK" | "CRYPTO";
  volume: string;
}

interface WatchlistPanelProps {
  onSelectAsset: (symbol: string, type: "STOCK" | "CRYPTO") => void;
  activeSymbol: string;
}

export default function WatchlistPanel({ onSelectAsset, activeSymbol }: WatchlistPanelProps) {
  const [tab, setTab] = useState<"STOCKS" | "CRYPTO">("STOCKS");

  const stocksList: AssetItem[] = [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2450.00, change: 25.40, changePercent: 1.05, type: "STOCK", volume: "4.2M" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 3820.00, change: -12.30, changePercent: -0.32, type: "STOCK", volume: "1.8M" },
    { symbol: "INFY", name: "Infosys Limited", price: 1540.00, change: 18.50, changePercent: 1.21, type: "STOCK", volume: "2.1M" },
    { symbol: "TATAMOTORS", name: "Tata Motors Ltd.", price: 980.00, change: 8.40, changePercent: 0.86, type: "STOCK", volume: "5.3M" },
    { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", price: 1620.00, change: -5.10, changePercent: -0.31, type: "STOCK", volume: "3.2M" }
  ];

  const cryptoList: AssetItem[] = [
    { symbol: "BTC", name: "Bitcoin", price: 65240.50, change: 480.20, changePercent: 0.74, type: "CRYPTO", volume: "28.4B" },
    { symbol: "ETH", name: "Ethereum", price: 3512.80, change: -45.60, changePercent: -1.28, type: "CRYPTO", volume: "14.2B" },
    { symbol: "BNB", name: "BNB", price: 580.40, change: 8.20, changePercent: 1.43, type: "CRYPTO", volume: "1.1B" },
    { symbol: "SOL", name: "Solana", price: 146.35, change: 5.40, changePercent: 3.83, type: "CRYPTO", volume: "3.2B" },
    { symbol: "XRP", name: "Ripple", price: 0.4850, change: -0.005, changePercent: -1.02, type: "CRYPTO", volume: "950M" }
  ];

  const activeList = tab === "STOCKS" ? stocksList : cryptoList;

  return (
    <div className="glass-card rounded-2xl border border-border flex flex-col h-full overflow-hidden">
      {/* Panel Headers & Tabs */}
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-white/[0.02] flex-wrap gap-3">
        <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
          WATCHLIST
        </h3>

        <div className="flex bg-white/5 p-1 rounded-xl border border-border">
          <button
            onClick={() => setTab("STOCKS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === "STOCKS" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => setTab("CRYPTO")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === "CRYPTO" 
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Crypto
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 text-[10px] tracking-wider text-muted-foreground uppercase font-bold bg-white/[0.01]">
              <th className="py-3 px-4">Symbol</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">24h %</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {activeList.map((item) => {
              const isPositive = item.change >= 0;
              const isSelected = activeSymbol === item.symbol;

              return (
                <tr
                  key={item.symbol}
                  onClick={() => onSelectAsset(item.symbol, item.type)}
                  className={`hover:bg-white/5 transition-all duration-150 cursor-pointer group text-xs ${
                    isSelected ? "bg-indigo-500/5 border-l-2 border-indigo-400" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-semibold text-white flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <span>{item.symbol}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal truncate max-w-[120px]">
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-white font-medium">
                    {item.type === "CRYPTO" ? "$" : "₹"}{item.price.toLocaleString(item.type === "CRYPTO" ? "en-US" : "en-IN", { minimumFractionDigits: item.type === "CRYPTO" && item.price < 1 ? 4 : 2 })}
                  </td>
                  <td className={`py-3.5 px-4 text-right font-semibold font-mono ${
                    isPositive ? "text-green-400" : "text-red-400"
                  }`}>
                    <div className="flex items-center justify-end gap-0.5">
                      {isPositive ? "+" : ""}{item.changePercent}%
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono hidden sm:table-cell">
                    {item.volume}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
