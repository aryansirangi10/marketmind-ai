// ==============================================================================
// Top Movers Widget (Gainers & Losers)
// ==============================================================================

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Award } from "lucide-react";

interface Mover {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export default function TopMovers() {
  const [activeTab, setActiveTab] = useState<"GAINERS" | "LOSERS">("GAINERS");

  const gainers: Mover[] = [
    { symbol: "NVDA", name: "NVIDIA Corp", price: 128.50, change: 4.85 },
    { symbol: "SOL", name: "Solana", price: 148.20, change: 3.92 },
    { symbol: "AVGO", name: "Broadcom Inc", price: 1680.10, change: 2.15 },
    { symbol: "BTC", name: "Bitcoin", price: 65800.00, change: 1.82 }
  ];

  const losers: Mover[] = [
    { symbol: "TSLA", name: "Tesla Inc", price: 178.40, change: -5.42 },
    { symbol: "XRP", name: "Ripple", price: 0.42, change: -4.10 },
    { symbol: "BAC", name: "Bank of America", price: 38.20, change: -2.85 },
    { symbol: "ETH", name: "Ethereum", price: 3450.00, change: -1.65 }
  ];

  const list = activeTab === "GAINERS" ? gainers : losers;

  return (
    <div className="glass-card p-5 rounded-2xl border border-border h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Movers</h4>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-0.5 border border-border">
          <button 
            onClick={() => setActiveTab("GAINERS")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "GAINERS" 
                ? "bg-indigo-500 text-white shadow-sm" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Gainers
          </button>
          <button 
            onClick={() => setActiveTab("LOSERS")}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "LOSERS" 
                ? "bg-indigo-500 text-white shadow-sm" 
                : "text-muted-foreground hover:text-white"
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {list.map((item) => {
          const isGainer = item.change >= 0;
          return (
            <div key={item.symbol} className="flex items-center justify-between text-xs hover:bg-white/5 p-1 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <span className="font-bold text-white">{item.symbol}</span>
                <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">{item.name}</p>
              </div>

              <div className="text-right">
                <p className="font-mono text-white font-semibold">
                  ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                  isGainer ? "text-green-400" : "text-red-400"
                }`}>
                  {isGainer ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {isGainer ? `+${item.change}%` : `${item.change}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
