// ==============================================================================
// Upgraded Market Chart Component (Technical Indicators & Overlays)
// ==============================================================================

"use client";

import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from "recharts";
import { Activity, SlidersHorizontal } from "lucide-react";

interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  formattedDate: string;
  // Indicators
  sma?: number;
  ema?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  rsi?: number;
}

interface MarketChartProps {
  symbol: string;
  data: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>;
  isLoading?: boolean;
}

export default function MarketChart({ symbol, data, isLoading }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("1M");
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

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

  // ----------------------------------------------------------------------------
  // Client-Side Indicator Mathematics
  // ----------------------------------------------------------------------------
  const prices = data.map((d) => d.close);

  // Simple Moving Average
  const smaPeriod = 20;
  const smaValues: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < smaPeriod - 1) {
      smaValues.push(NaN);
    } else {
      const sum = prices.slice(i - smaPeriod + 1, i + 1).reduce((a, b) => a + b, 0);
      smaValues.push(sum / smaPeriod);
    }
  }

  // Exponential Moving Average
  const emaPeriod = 20;
  const emaValues: number[] = [];
  let k = 2 / (emaPeriod + 1);
  let emaTemp = prices[0];
  emaValues.push(emaTemp);
  for (let i = 1; i < prices.length; i++) {
    emaTemp = prices[i] * k + emaTemp * (1 - k);
    emaValues.push(i < emaPeriod - 1 ? NaN : emaTemp);
  }

  // Bollinger Bands (20 period, 2 Standard Deviations)
  const bbPeriod = 20;
  const bbUpper: number[] = [];
  const bbMiddle: number[] = [];
  const bbLower: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < bbPeriod - 1) {
      bbUpper.push(NaN);
      bbMiddle.push(NaN);
      bbLower.push(NaN);
    } else {
      const subset = prices.slice(i - bbPeriod + 1, i + 1);
      const mean = subset.reduce((a, b) => a + b, 0) / bbPeriod;
      const variance = subset.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / bbPeriod;
      const stdDev = Math.sqrt(variance);
      bbMiddle.push(mean);
      bbUpper.push(mean + 2 * stdDev);
      bbLower.push(mean - 2 * stdDev);
    }
  }

  // Relative Strength Index (RSI 14)
  const rsiPeriod = 14;
  const rsiValues: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      rsiValues.push(NaN);
      continue;
    }
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;

    if (i <= rsiPeriod) {
      avgGain += gain;
      avgLoss += loss;
      if (i === rsiPeriod) {
        avgGain /= rsiPeriod;
        avgLoss /= rsiPeriod;
        const rs = avgGain / (avgLoss || 1e-6);
        rsiValues.push(100 - 100 / (1 + rs));
      } else {
        rsiValues.push(NaN);
      }
    } else {
      avgGain = (avgGain * 13 + gain) / 14;
      avgLoss = (avgLoss * 13 + loss) / 14;
      const rs = avgGain / (avgLoss || 1e-6);
      rsiValues.push(100 - 100 / (1 + rs));
    }
  }

  // Format data points for charts
  const chartData: ChartDataPoint[] = data.map((d, index) => {
    const dateObj = new Date(d.time * 1000);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    return {
      ...d,
      formattedDate,
      sma: isNaN(smaValues[index]) ? undefined : parseFloat(smaValues[index].toFixed(2)),
      ema: isNaN(emaValues[index]) ? undefined : parseFloat(emaValues[index].toFixed(2)),
      bbUpper: isNaN(bbUpper[index]) ? undefined : parseFloat(bbUpper[index].toFixed(2)),
      bbMiddle: isNaN(bbMiddle[index]) ? undefined : parseFloat(bbMiddle[index].toFixed(2)),
      bbLower: isNaN(bbLower[index]) ? undefined : parseFloat(bbLower[index].toFixed(2)),
      rsi: isNaN(rsiValues[index]) ? undefined : parseFloat(rsiValues[index].toFixed(2))
    };
  });

  const timeframes: Array<"1D" | "1W" | "1M" | "3M" | "1Y"> = ["1D", "1W", "1M", "3M", "1Y"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: ChartDataPoint = payload[0].payload;
      return (
        <div className="glass-card p-4 rounded-xl border border-white/10 text-[10px] space-y-1.5 font-mono select-none">
          <p className="font-sans font-bold text-white text-xs mb-1">{dataPoint.formattedDate}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <span className="text-muted-foreground">Close Price:</span>
            <span className="text-white text-right font-bold">${dataPoint.close.toFixed(2)}</span>
            {showSMA && dataPoint.sma && (
              <>
                <span className="text-amber-400">SMA (20):</span>
                <span className="text-amber-400 text-right">${dataPoint.sma.toFixed(2)}</span>
              </>
            )}
            {showEMA && dataPoint.ema && (
              <>
                <span className="text-teal-400">EMA (20):</span>
                <span className="text-teal-400 text-right">${dataPoint.ema.toFixed(2)}</span>
              </>
            )}
            {showBB && dataPoint.bbUpper && (
              <>
                <span className="text-purple-400">BB Upper:</span>
                <span className="text-purple-400 text-right">${dataPoint.bbUpper.toFixed(2)}</span>
                <span className="text-purple-400">BB Lower:</span>
                <span className="text-purple-400 text-right">${dataPoint.bbLower.toFixed(2)}</span>
              </>
            )}
            {showRSI && dataPoint.rsi && (
              <>
                <span className="text-pink-400">RSI (14):</span>
                <span className="text-pink-400 text-right">{dataPoint.rsi.toFixed(2)}</span>
              </>
            )}
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
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">Interactive Charts</span>
          <h2 className="text-2xl font-bold text-white mt-0.5">
            {symbol.toUpperCase()} <span className="text-xs font-normal text-muted-foreground ml-2">Candlestick & Indicator Overlays</span>
          </h2>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex bg-white/5 border border-border p-1 rounded-xl shrink-0 self-start sm:self-center">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
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

      {/* Indicator Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-y border-border/30 py-3">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
        <button
          onClick={() => setShowSMA(!showSMA)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
            showSMA 
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
              : "bg-slate-900 border-border text-muted-foreground hover:text-white"
          }`}
        >
          SMA (20)
        </button>
        <button
          onClick={() => setShowEMA(!showEMA)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
            showEMA 
              ? "bg-teal-500/10 border-teal-500/30 text-teal-300" 
              : "bg-slate-900 border-border text-muted-foreground hover:text-white"
          }`}
        >
          EMA (20)
        </button>
        <button
          onClick={() => setShowBB(!showBB)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
            showBB 
              ? "bg-purple-500/10 border-purple-500/30 text-purple-300" 
              : "bg-slate-900 border-border text-muted-foreground hover:text-white"
          }`}
        >
          Bollinger Bands
        </button>
        <button
          onClick={() => setShowRSI(!showRSI)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
            showRSI 
              ? "bg-pink-500/10 border-pink-500/30 text-pink-300" 
              : "bg-slate-900 border-border text-muted-foreground hover:text-white"
          }`}
        >
          RSI (14)
        </button>
      </div>

      {/* Main Chart Area */}
      <div className="w-full flex flex-col gap-4">
        {/* Price Feed Area Chart */}
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="formattedDate" 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
              
              {/* Core Closing Price Line */}
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />

              {/* SMA Overlay */}
              {showSMA && (
                <Line 
                  type="monotone" 
                  dataKey="sma" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5}
                  dot={false}
                />
              )}

              {/* EMA Overlay */}
              {showEMA && (
                <Line 
                  type="monotone" 
                  dataKey="ema" 
                  stroke="#14b8a6" 
                  strokeWidth={1.5}
                  dot={false}
                />
              )}

              {/* Bollinger Bands Overlay */}
              {showBB && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="bbUpper" 
                    stroke="#a855f7" 
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bbLower" 
                    stroke="#a855f7" 
                    strokeWidth={1.2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Auxiliary Indicator Chart */}
        {showRSI && (
          <div className="w-full h-[100px] border-t border-border/20 pt-4 flex flex-col gap-1.5 animate-in fade-in duration-200">
            <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">RSI (14) Indicator</span>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="formattedDate" hide />
                <YAxis 
                  stroke="#475569" 
                  fontSize={8} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  ticks={[30, 70]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rsi"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
