// ==============================================================================
// No-Code Strategy Builder & Backtest Workspace - Frontend Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  Sliders, 
  Play, 
  HelpCircle, 
  Activity, 
  CheckCircle2, 
  DollarSign, 
  Percent, 
  Layers 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

interface BacktestSummary {
  symbol: string;
  startCapital: number;
  endBalance: number;
  cagr: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  trades: Array<{ type: "BUY" | "SELL"; price: number; quantity: number; fee: number; profit?: number; timestamp: string }>;
  equityCurve: Array<{ time: number; value: number }>;
}

export default function StrategyBuilderPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [strategyName, setStrategyName] = useState("My Crossover System");
  const [fastPeriod, setFastPeriod] = useState(20);
  const [rsiOverbought, setRsiOverbought] = useState(70);
  const [stopLoss, setStopLoss] = useState(2.0);
  const [takeProfit, setTakeProfit] = useState(6.0);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<BacktestSummary | null>(null);

  const handleRunBacktest = async () => {
    setIsSimulating(true);
    setResult(null);

    // Simulate backend simulation processing
    setTimeout(() => {
      const startCapital = 10000.0;
      const days = 100;
      
      // Generate simulated equity curve coordinates
      const equityCurve = [];
      let balance = startCapital;
      const now = Math.floor(Date.now() / 1000);
      
      for (let i = days; i >= 0; i--) {
        const time = now - i * 24 * 60 * 60;
        // Add cumulative variance
        const dailyChange = (Math.random() - 0.46) * 150.0; 
        balance += dailyChange;
        equityCurve.push({ time, value: parseFloat(balance.toFixed(2)) });
      }

      setResult({
        symbol: symbol.toUpperCase(),
        startCapital,
        endBalance: parseFloat(balance.toFixed(2)),
        cagr: parseFloat((((balance - startCapital) / startCapital) * 100 * 2.5).toFixed(2)),
        sharpeRatio: 1.65,
        maxDrawdown: 8.45,
        winRate: 58.2,
        profitFactor: 2.15,
        trades: [
          { type: "BUY", price: 175.50, quantity: 57, fee: 10.0, timestamp: "2026-06-15" },
          { type: "SELL", price: 186.20, quantity: 57, fee: 10.6, profit: 609.90, timestamp: "2026-06-28" },
          { type: "BUY", price: 182.10, quantity: 55, fee: 10.0, timestamp: "2026-07-01" }
        ],
        equityCurve
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Strategy Workspace</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Build algorithmic indicator conditions and run backtesting simulations with fee adjustments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
          {/* Rules Builder Board */}
          <div className="glass-card p-6 rounded-2xl border border-border space-y-5 lg:col-span-1">
            <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2 uppercase">
              <Sliders className="w-4 h-4 text-indigo-400" /> Rules Configurator
            </h3>

            {/* Asset Symbol */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Asset Ticker</label>
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Moving Average Parameter */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Indicator Block: EMA Period</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={5} 
                  max={200}
                  value={fastPeriod}
                  onChange={(e) => setFastPeriod(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-300 w-8 text-right">{fastPeriod}</span>
              </div>
            </div>

            {/* RSI threshold Parameter */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Condition Block: RSI Overbought</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={50} 
                  max={95}
                  value={rsiOverbought}
                  onChange={(e) => setRsiOverbought(Number(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-indigo-300 w-8 text-right">{rsiOverbought}</span>
              </div>
            </div>

            {/* Exit Risk Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Stop Loss (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase">Take Profit (%)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sizing Block */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase">Position Sizing Rules</label>
              <select className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none">
                <option value="CASH">100% Cash Sizing</option>
                <option value="FIXED">Fixed $1,000 Allocation</option>
              </select>
            </div>

            <button
              onClick={handleRunBacktest}
              disabled={isSimulating}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" /> {isSimulating ? "COMPILING STRATEGY..." : "START HISTORICAL RUN"}
            </button>
          </div>

          {/* Results Board Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {isSimulating && (
              <div className="glass-card h-[380px] rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-t-indigo-500 border-border rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground animate-pulse">Running backtesting vector simulation loops...</span>
              </div>
            )}

            {!result && !isSimulating && (
              <div className="glass-card h-[380px] rounded-2xl border border-border flex flex-col items-center justify-center text-center p-6 gap-2 text-muted-foreground">
                <HelpCircle className="w-12 h-12 text-slate-700" />
                <h4 className="text-sm font-semibold text-white">No Simulation Results</h4>
                <p className="text-xs max-w-xs">Configure your indicators crossovers and risk rules thresholds, then click Start Run to see historical returns.</p>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-border text-center space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Final Valuation</span>
                    <p className="text-lg font-mono font-bold text-white">${result.endBalance.toLocaleString()}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-border text-center space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Strategy Returns</span>
                    <p className={`text-lg font-mono font-bold ${result.cagr >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {result.cagr >= 0 ? "+" : ""}{result.cagr}%
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-border text-center space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Win Rate</span>
                    <p className="text-lg font-mono font-bold text-indigo-300">{result.winRate}%</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-border text-center space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Profit Factor</span>
                    <p className="text-lg font-mono font-bold text-white">{result.profitFactor}</p>
                  </div>
                </div>

                {/* Equity Curve Line Chart */}
                <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Simulation Equity Curve</h4>
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.equityCurve} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                        <Tooltip formatter={(value) => value ? `$${Number(value).toLocaleString()}` : ""} />
                        <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Trade History List */}
                <div className="glass-card rounded-2xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border bg-white/[0.01]">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Trade Journal History</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-slate-950 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-3">Type</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Fee Paid</th>
                          <th className="p-3 text-right">Profit / Loss</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-medium">
                        {result.trades.map((t, idx) => {
                          const isBuy = t.type === "BUY";
                          return (
                            <tr key={idx} className="hover:bg-white/[0.01]">
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  isBuy ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}>
                                  {t.type}
                                </span>
                              </td>
                              <td className="p-3 font-mono">${t.price.toFixed(2)}</td>
                              <td className="p-3 font-mono">{t.quantity}</td>
                              <td className="p-3 font-mono text-muted-foreground">${t.fee.toFixed(2)}</td>
                              <td className={`p-3 text-right font-mono font-bold ${
                                t.profit !== undefined ? (t.profit >= 0 ? "text-green-400" : "text-red-400") : "text-slate-400"
                              }`}>
                                {t.profit !== undefined ? `${t.profit >= 0 ? "+" : ""}$${t.profit.toFixed(2)}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
