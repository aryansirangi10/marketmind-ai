// ==============================================================================
// Market Chart Component (Interactive Chart utilizing Recharts)
// ==============================================================================

"use client";

import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart,
  Bar
} from "recharts";

interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  formattedDate: string;
}

interface MarketChartProps {
  symbol: string;
  data: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>;
  isLoading?: boolean;
}

export default function MarketChart({ symbol, data, isLoading }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");

  if (isLoading || !data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-card/30 border border-border rounded-2xl backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-t-indigo-500 border-border animate-spin" />
          <span className="text-sm text-muted-foreground font-medium">Fetching historical charts...</span>
        </div>
      </div>
    );
  }

  // Format data points for charts
  const chartData: ChartDataPoint[] = data.map(d => {
    const dateObj = new Date(d.time * 1000);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit"
    });
    return {
      ...d,
      formattedDate
    };
  });

  const timeframes: Array<"1D" | "1W" | "1M" | "3M" | "1Y"> = ["1D", "1W", "1M", "3M", "1Y"];

  // Custom tooltips showing full OHLC details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartDataPoint = payload[0].payload;
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono select-none">
          <p className="font-sans font-bold text-white mb-1">{data.formattedDate}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-muted-foreground">Open:</span>
            <span className="text-white text-right">${data.open.toFixed(2)}</span>
            <span className="text-muted-foreground">High:</span>
            <span className="text-green-400 text-right">${data.high.toFixed(2)}</span>
            <span className="text-muted-foreground">Low:</span>
            <span className="text-red-400 text-right">${data.low.toFixed(2)}</span>
            <span className="text-muted-foreground">Close:</span>
            <span className="text-white text-right font-bold">${data.close.toFixed(2)}</span>
            <span className="text-muted-foreground mt-1 border-t border-border/50 pt-1">Volume:</span>
            <span className="text-indigo-300 text-right font-semibold mt-1 border-t border-border/50 pt-1">
              {data.volume.toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col gap-4 border border-border">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-indigo-400 tracking-wider">CHARTS</span>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
            {symbol.toUpperCase()} <span className="text-sm font-normal text-muted-foreground">Interactive Price Feed</span>
          </h2>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex bg-white/5 border border-border p-1 rounded-xl shrink-0 self-start sm:self-center">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                timeframe === tf 
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="w-full flex flex-col gap-2">
        {/* Price Feed Area Chart */}
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="formattedDate" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#6366f1" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#priceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Bar Chart */}
        <div className="w-full h-[60px] opacity-75 border-t border-border/20 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="formattedDate" hide />
              <YAxis hide domain={[0, "auto"]} />
              <Tooltip content={() => null} />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#4f46e5"
                fill="#4f46e5"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
