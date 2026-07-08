// ==============================================================================
// Market Heatmap / Grid Component
// ==============================================================================

import React from "react";
import { Grid } from "lucide-react";

interface HeatmapTile {
  symbol: string;
  name: string;
  change: number;
  weight: number; // sizing factor
}

export default function MarketHeatmap() {
  const sectors = [
    {
      name: "Technology",
      tiles: [
        { symbol: "AAPL", name: "Apple", change: 1.45, weight: 35 },
        { symbol: "MSFT", name: "Microsoft", change: -0.85, weight: 30 },
        { symbol: "NVDA", name: "NVIDIA", change: 3.20, weight: 25 },
        { symbol: "AVGO", name: "Broadcom", change: 0.12, weight: 10 }
      ]
    },
    {
      name: "Financials",
      tiles: [
        { symbol: "JPM", name: "JP Morgan", change: 0.72, weight: 40 },
        { symbol: "BAC", name: "Bank of America", change: -1.25, weight: 30 },
        { symbol: "MS", name: "Morgan Stanley", change: 0.45, weight: 30 }
      ]
    },
    {
      name: "Consumer Goods",
      tiles: [
        { symbol: "AMZN", name: "Amazon", change: 1.10, weight: 50 },
        { symbol: "TSLA", name: "Tesla", change: -4.32, weight: 35 },
        { symbol: "NKE", name: "Nike", change: -0.15, weight: 15 }
      ]
    }
  ];

  return (
    <div className="glass-card p-5 rounded-2xl border border-border h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Grid className="w-4 h-4 text-indigo-400" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Sector Heatmap</h4>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {sectors.map((sec) => (
          <div key={sec.name} className="space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">{sec.name}</span>
            <div className="grid grid-cols-4 gap-2">
              {sec.tiles.map((tile) => {
                const isPositive = tile.change >= 0;
                const absChange = Math.abs(tile.change);
                
                // Determine shading density based on magnitude
                const bgColor = isPositive 
                  ? absChange > 2 
                    ? "bg-green-600/40 border-green-500/30 text-green-200" 
                    : "bg-green-600/15 border-green-500/20 text-green-300"
                  : absChange > 2
                    ? "bg-red-600/40 border-red-500/30 text-red-200"
                    : "bg-red-600/15 border-red-500/20 text-red-300";

                return (
                  <div 
                    key={tile.symbol} 
                    className={`p-2.5 rounded-xl border text-center transition-all duration-200 hover:scale-105 ${bgColor}`}
                  >
                    <p className="font-bold text-xs">{tile.symbol}</p>
                    <p className="text-[9px] font-mono mt-0.5">
                      {isPositive ? `+${tile.change}%` : `${tile.change}%`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
