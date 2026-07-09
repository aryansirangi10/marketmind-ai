// ==============================================================================
// Indian Market Terminal Workspace Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Layers, 
  Table, 
  Activity, 
  Zap, 
  Calendar, 
  Users 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from "recharts";

interface OptionChainRow {
  callOI: number;
  callChgOI: number;
  callLtp: number;
  strike: number;
  putLtp: number;
  putChgOI: number;
  putOI: number;
}

export default function IndianMarketPage() {
  const [activeChainSymbol, setActiveChainSymbol] = useState<"NIFTY" | "BANKNIFTY">("NIFTY");

  // Mock Indian Indices
  const indices = [
    { name: "NIFTY 50", price: 23500.20, chg: 268.40, pct: 1.15, status: "up" },
    { name: "SENSEX", price: 77200.40, chg: 725.10, pct: 0.95, status: "up" },
    { name: "BANK NIFTY", price: 51240.50, chg: 735.60, pct: 1.45, status: "up" },
    { name: "INDIA VIX", price: 13.42, chg: -0.58, pct: -4.14, status: "down" }
  ];

  // Option Chain Rows corresponding to Strike intervals
  const niftyOptionChain: OptionChainRow[] = [
    { callOI: 145000, callChgOI: 12500, callLtp: 185.40, strike: 23300, putLtp: 12.20, putChgOI: -2500, putOI: 45000 },
    { callOI: 128000, callChgOI: 8400, callLtp: 142.10, strike: 23400, putLtp: 24.50, putChgOI: -1200, putOI: 68000 },
    { callOI: 95000, callChgOI: -15000, callLtp: 92.50, strike: 23500, putLtp: 68.10, putChgOI: 18000, putOI: 145000 },
    { callOI: 168000, callChgOI: 42000, callLtp: 45.20, strike: 23600, putLtp: 115.40, putChgOI: 34000, putOI: 92000 },
    { callOI: 215000, callChgOI: 68000, callLtp: 18.90, strike: 23700, putLtp: 184.20, putChgOI: 12000, putOI: 35000 }
  ];

  const bankNiftyOptionChain: OptionChainRow[] = [
    { callOI: 85000, callChgOI: 4500, callLtp: 420.50, strike: 51000, putLtp: 65.40, putChgOI: -1500, putOI: 25000 },
    { callOI: 68000, callChgOI: -2100, callLtp: 312.40, strike: 51100, putLtp: 112.80, putChgOI: 4200, putOI: 48000 },
    { callOI: 42000, callChgOI: -8500, callLtp: 205.10, strike: 51200, putLtp: 198.50, putChgOI: 15400, putOI: 98000 },
    { callOI: 95000, callChgOI: 21000, callLtp: 112.40, strike: 51300, putLtp: 320.40, putChgOI: 8500, putOI: 38000 },
    { callOI: 135000, callChgOI: 34000, callLtp: 45.20, strike: 51400, putLtp: 468.20, putChgOI: 1200, putOI: 14000 }
  ];

  const activeChain = activeChainSymbol === "NIFTY" ? niftyOptionChain : bankNiftyOptionChain;

  // Calculate Option Ratios
  const totalCallsOI = activeChain.reduce((sum, r) => sum + r.callOI, 0);
  const totalPutsOI = activeChain.reduce((sum, r) => sum + r.putOI, 0);
  const pcr = Number((totalPutsOI / totalCallsOI).toFixed(2));
  const maxPain = activeChainSymbol === "NIFTY" ? 23500 : 51200;

  // Institutional flows data
  const fiiDiiFlows = [
    { date: "09 Jul", fiiNet: -1240.50, diiNet: 2150.20 },
    { date: "08 Jul", fiiNet: 540.80, diiNet: -1120.40 },
    { date: "07 Jul", fiiNet: -890.30, diiNet: 1420.50 }
  ];

  // Corporate Actions calendar
  const corporateActions = [
    { symbol: "RELIANCE", type: "Dividend", ratio: "₹10.00 / share", recordDate: "2026-07-15" },
    { symbol: "TCS", type: "Stock Split", ratio: "1:2 Split", recordDate: "2026-07-28" },
    { symbol: "INFY", type: "Bonus Issue", ratio: "1:1 Bonus", recordDate: "2026-08-05" }
  ];

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between select-none">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 tracking-wider uppercase">
              NSE/BSE Indian Terminals
            </span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              Indian Markets Workspace
            </h2>
          </div>
        </div>

        {/* Indices Tickers Tape */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
          {indices.map((idx) => {
            const isUp = idx.status === "up";
            return (
              <div key={idx.name} className="glass-card p-5 rounded-2xl border border-border space-y-1 bg-white/[0.01]">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">{idx.name}</span>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-mono font-bold text-white">
                    {idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${isUp ? "text-green-400" : "text-red-400"}`}>
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {isUp ? "+" : ""}{idx.pct}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Option Chain Terminal (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl border border-border overflow-hidden bg-white/[0.01]">
              <div className="p-5 border-b border-border flex items-center justify-between select-none">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2 uppercase">
                    <Table className="w-4 h-4 text-indigo-400" /> Options Chain Board
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Live Call/Put Open Interest (OI) & Strike Prices</p>
                </div>

                {/* Index selection toggles */}
                <div className="flex bg-slate-950 p-0.5 border border-border rounded-xl">
                  <button
                    onClick={() => setActiveChainSymbol("NIFTY")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeChainSymbol === "NIFTY" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    NIFTY 50
                  </button>
                  <button
                    onClick={() => setActiveChainSymbol("BANKNIFTY")}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeChainSymbol === "BANKNIFTY" ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    BANK NIFTY
                  </button>
                </div>
              </div>

              {/* Ratios banner */}
              <div className="grid grid-cols-3 gap-4 p-4 border-b border-border/40 bg-slate-950/40 select-none text-center">
                <div>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">PCR (Put-Call Ratio)</span>
                  <p className={`text-sm font-mono font-bold mt-0.5 ${pcr >= 1.0 ? "text-green-400" : "text-indigo-300"}`}>{pcr}</p>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Max Pain Strike</span>
                  <p className="text-sm font-mono font-bold text-white mt-0.5">{maxPain.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">Market sentiment</span>
                  <p className="text-sm font-bold text-green-400 mt-0.5 flex items-center gap-1 justify-center">
                    <Zap className="w-3.5 h-3.5 fill-green-400" /> BULLISH
                  </p>
                </div>
              </div>

              {/* Option Chain Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-[11px] select-none font-mono">
                  <thead>
                    <tr className="border-b border-border bg-slate-950 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th colSpan={3} className="p-3 border-r border-border bg-green-500/5 text-green-400">CALLS</th>
                      <th className="p-3">STRIKE</th>
                      <th colSpan={3} className="p-3 border-l border-border bg-red-500/5 text-red-400">PUTS</th>
                    </tr>
                    <tr className="border-b border-border/50 text-[8px] text-slate-500 bg-slate-950/20 font-bold uppercase">
                      <th className="p-2">OI (Lot)</th>
                      <th className="p-2">Chg OI</th>
                      <th className="p-2 border-r border-border">LTP</th>
                      <th className="p-2">Price</th>
                      <th className="p-2 border-l border-border">LTP</th>
                      <th className="p-2">Chg OI</th>
                      <th className="p-2">OI (Lot)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 font-medium text-slate-200">
                    {activeChain.map((row) => (
                      <tr key={row.strike} className="hover:bg-white/[0.01]">
                        {/* CALLS */}
                        <td className="p-2 text-slate-400">{row.callOI.toLocaleString()}</td>
                        <td className={`p-2 ${row.callChgOI >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {row.callChgOI >= 0 ? "+" : ""}{row.callChgOI.toLocaleString()}
                        </td>
                        <td className="p-2 border-r border-border text-white">${row.callLtp.toFixed(2)}</td>
                        
                        {/* STRIKE */}
                        <td className="p-2 bg-slate-950/50 font-bold text-indigo-400">{row.strike}</td>
                        
                        {/* PUTS */}
                        <td className="p-2 border-l border-border text-white">${row.putLtp.toFixed(2)}</td>
                        <td className={`p-2 ${row.putChgOI >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {row.putChgOI >= 0 ? "+" : ""}{row.putChgOI.toLocaleString()}
                        </td>
                        <td className="p-2 text-slate-400">{row.putOI.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar Section (FII/DII Flows & Corporate Actions) */}
          <div className="space-y-6 lg:col-span-1">
            {/* FII DII Net Flows */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01] select-none">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" /> FII & DII Flows
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Net daily institutional investment flows (Cr)</p>
              </div>

              <div className="space-y-3.5 text-xs">
                {fiiDiiFlows.map((flow) => (
                  <div key={flow.date} className="p-3 rounded-xl border border-border bg-slate-950/30 flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-400">{flow.date}</span>
                    <div className="text-right font-mono space-y-0.5">
                      <p className={`font-bold ${flow.fiiNet >= 0 ? "text-green-400" : "text-red-400"}`}>
                        FII Net: {flow.fiiNet >= 0 ? "+" : ""}₹{flow.fiiNet.toLocaleString()} Cr
                      </p>
                      <p className={`font-bold ${flow.diiNet >= 0 ? "text-green-400" : "text-red-400"}`}>
                        DII Net: {flow.diiNet >= 0 ? "+" : ""}₹{flow.diiNet.toLocaleString()} Cr
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Corporate Actions Calendar */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01] select-none">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Corporate Actions
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Upcoming stock splits, dividend distributions & bonus issues</p>
              </div>

              <div className="divide-y divide-border/30 text-xs">
                {corporateActions.map((action, idx) => (
                  <div key={idx} className="flex justify-between py-2.5 items-center">
                    <div>
                      <span className="font-bold text-indigo-400 font-sans">{action.symbol}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-border text-[8px] text-muted-foreground font-bold uppercase ml-2">
                        {action.type}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-white text-[11px]">{action.ratio}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Record: {action.recordDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
