// ==============================================================================
// Indian Market Terminal Workspace Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Table, 
  Activity, 
  Zap, 
  Calendar, 
  Users,
  Award,
  Globe,
  Sliders,
  Play,
  FileText
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  Cell 
} from "recharts";

interface OptionChainRow {
  callOI: number;
  callChgOI: number;
  callVolume: number;
  callIv: number;
  callDelta: number;
  callLtp: number;
  strike: number;
  putLtp: number;
  putDelta: number;
  putIv: number;
  putVolume: number;
  putChgOI: number;
  putOI: number;
}

export default function IndianMarketPage() {
  const [activeTab, setActiveTab] = useState<"OPTION_CHAIN" | "MARKET_BREADTH" | "FLOWS_CALENDARS">("OPTION_CHAIN");
  const [activeChainSymbol, setActiveChainSymbol] = useState<"NIFTY" | "BANKNIFTY" | "FINNIFTY">("NIFTY");
  const [selectedExpiry, setSelectedExpiry] = useState("16 Jul 2026");

  // Mock Indian Indices
  const indices = [
    { name: "NIFTY 50", price: 23500.20, chg: 268.40, pct: 1.15, status: "up" },
    { name: "SENSEX", price: 77200.40, chg: 725.10, pct: 0.95, status: "up" },
    { name: "BANK NIFTY", price: 51240.50, chg: 735.60, pct: 1.45, status: "up" },
    { name: "FINNIFTY", price: 21450.80, chg: 185.30, pct: 0.87, status: "up" },
    { name: "MIDCAP 100", price: 12150.35, chg: 142.15, pct: 1.18, status: "up" },
    { name: "INDIA VIX", price: 13.42, chg: -0.58, pct: -4.14, status: "down" }
  ];

  // Option Chain Rows
  const niftyOptionChain: OptionChainRow[] = [
    { callOI: 145000, callChgOI: 12500, callVolume: 82000, callIv: 12.4, callDelta: 0.85, callLtp: 285.40, strike: 23300, putLtp: 12.20, putDelta: -0.15, putIv: 14.1, putVolume: 12000, putChgOI: -2500, putOI: 45000 },
    { callOI: 128000, callChgOI: 8400, callVolume: 94000, callIv: 11.8, callDelta: 0.72, callLtp: 192.10, strike: 23400, putLtp: 24.50, putDelta: -0.28, putIv: 13.5, putVolume: 35000, putChgOI: -1200, putOI: 68000 },
    { callOI: 95000, callChgOI: -15000, callVolume: 145000, callIv: 11.2, callDelta: 0.50, callLtp: 112.50, strike: 23500, putLtp: 68.10, putDelta: -0.50, putIv: 12.9, putVolume: 98000, putChgOI: 18000, putOI: 145000 },
    { callOI: 168000, callChgOI: 42000, callVolume: 118000, callIv: 11.9, callDelta: 0.28, callLtp: 55.20, strike: 23600, putLtp: 125.40, putDelta: -0.72, putIv: 13.8, putVolume: 84000, putChgOI: 34000, putOI: 92000 },
    { callOI: 215000, callChgOI: 68000, callVolume: 74000, callIv: 12.6, callDelta: 0.12, callLtp: 18.90, strike: 23700, putLtp: 214.20, putDelta: -0.88, putIv: 14.5, putVolume: 42000, putChgOI: 12000, putOI: 35000 }
  ];

  const bankNiftyOptionChain: OptionChainRow[] = [
    { callOI: 85000, callChgOI: 4500, callVolume: 34000, callIv: 14.2, callDelta: 0.81, callLtp: 420.50, strike: 51000, putLtp: 65.40, putDelta: -0.19, putIv: 16.2, putVolume: 8000, putChgOI: -1500, putOI: 25000 },
    { callOI: 68000, callChgOI: -2100, callVolume: 42000, callIv: 13.8, callDelta: 0.65, callLtp: 312.40, strike: 51100, putLtp: 112.80, putDelta: -0.35, putIv: 15.8, putVolume: 18000, putChgOI: 4200, putOI: 48000 },
    { callOI: 42000, callChgOI: -8500, callVolume: 98000, callIv: 13.1, callDelta: 0.50, callLtp: 215.10, strike: 51200, putLtp: 198.50, putDelta: -0.50, putIv: 15.0, putVolume: 64000, putChgOI: 15400, putOI: 98000 },
    { callOI: 95000, callChgOI: 21000, callVolume: 85000, callIv: 13.9, callDelta: 0.35, callLtp: 112.40, strike: 51300, putLtp: 320.40, putDelta: -0.65, putIv: 15.6, putVolume: 24000, putChgOI: 8500, putOI: 38000 },
    { callOI: 135000, callChgOI: 34000, callVolume: 51000, callIv: 14.5, callDelta: 0.18, callLtp: 45.20, strike: 51400, putLtp: 468.20, putDelta: -0.82, putIv: 16.5, putVolume: 12000, putChgOI: 1200, putOI: 14000 }
  ];

  const finNiftyOptionChain: OptionChainRow[] = [
    { callOI: 45000, callChgOI: 2300, callVolume: 12000, callIv: 13.0, callDelta: 0.78, callLtp: 185.00, strike: 21300, putLtp: 22.40, putDelta: -0.22, putIv: 14.8, putVolume: 4000, putChgOI: -500, putOI: 12000 },
    { callOI: 38000, callChgOI: 1100, callVolume: 18000, callIv: 12.5, callDelta: 0.62, callLtp: 118.00, strike: 21400, putLtp: 48.20, putDelta: -0.38, putIv: 14.2, putVolume: 9000, putChgOI: 1200, putOI: 22000 },
    { callOI: 29000, callChgOI: -4100, callVolume: 54000, callIv: 12.0, callDelta: 0.50, callLtp: 65.50, strike: 21500, putLtp: 92.40, putDelta: -0.50, putIv: 13.6, putVolume: 29000, putChgOI: 8400, putOI: 54000 },
    { callOI: 52000, callChgOI: 8500, callVolume: 32000, callIv: 12.6, callDelta: 0.32, callLtp: 32.10, strike: 21600, putLtp: 154.20, putDelta: -0.68, putIv: 14.1, putVolume: 14000, putChgOI: 5100, putOI: 19000 }
  ];

  const getActiveOptionChain = () => {
    switch (activeChainSymbol) {
      case "BANKNIFTY": return bankNiftyOptionChain;
      case "FINNIFTY": return finNiftyOptionChain;
      default: return niftyOptionChain;
    }
  };

  const activeChain = getActiveOptionChain();

  // Ratios
  const totalCallsOI = activeChain.reduce((sum, r) => sum + r.callOI, 0);
  const totalPutsOI = activeChain.reduce((sum, r) => sum + r.putOI, 0);
  const pcr = Number((totalPutsOI / totalCallsOI).toFixed(2));
  const maxPain = activeChainSymbol === "NIFTY" ? 23500 : activeChainSymbol === "BANKNIFTY" ? 51200 : 21500;

  // Chart Formatting
  const heatmapData = activeChain.map(r => ({
    strike: r.strike.toString(),
    "Call OI": r.callOI,
    "Put OI": r.putOI
  }));

  // Institutional flows
  const fiiDiiFlows = [
    { date: "09 Jul", fiiNet: -1240.50, diiNet: 2150.20 },
    { date: "08 Jul", fiiNet: 540.80, diiNet: -1120.40 },
    { date: "07 Jul", fiiNet: -890.30, diiNet: 1420.50 },
    { date: "06 Jul", fiiNet: 1420.20, diiNet: -95.00 },
    { date: "03 Jul", fiiNet: -450.60, diiNet: 820.40 }
  ];

  // Calendars
  const ipoCalendar = [
    { name: "Jio Brain Tech", size: "₹5,200 Cr", price: "₹240 - 256", status: "Open", date: "09-12 Jul" },
    { name: "Tata Battery Solutions", size: "₹3,400 Cr", price: "₹450 - 480", status: "Upcoming", date: "18-20 Jul" },
    { name: "Ola Electric Labs", size: "₹1,800 Cr", price: "₹72 - 76", status: "Closed", date: "02-05 Jul" }
  ];

  const corporateActions = [
    { symbol: "RELIANCE", type: "Dividend", desc: "₹10.00 Per Share", recordDate: "2026-07-15" },
    { symbol: "TCS", type: "Stock Split", desc: "1:2 Split Ratio", recordDate: "2026-07-28" },
    { symbol: "INFY", type: "Bonus Issue", desc: "1:1 Bonus Issue", recordDate: "2026-08-05" },
    { symbol: "TATAMOTORS", type: "Dividend", desc: "₹6.00 Per Share", recordDate: "2026-08-12" }
  ];

  const bulkDeals = [
    { symbol: "ZOMATO", clientName: "Fidelity Investments", action: "BUY", qty: "4.5M", price: "₹184.20", time: "14:15" },
    { symbol: "TCS", clientName: "LIC of India", action: "BUY", qty: "1.2M", price: "₹3812.50", time: "11:30" },
    { symbol: "PAYTM", clientName: "SoftBank Vision", action: "SELL", qty: "3.2M", price: "₹415.00", time: "10:10" }
  ];

  // Breadth Stats
  const moversGainers = [
    { symbol: "RELIANCE", price: "₹2,475.40", chg: "+1.05%" },
    { symbol: "TATAMOTORS", price: "₹988.40", chg: "+0.86%" },
    { symbol: "INFY", price: "₹1,558.50", chg: "+1.21%" },
    { symbol: "HDFCBANK", price: "₹1,625.00", chg: "+0.31%" }
  ];

  const moversLosers = [
    { symbol: "TCS", price: "₹3,807.70", chg: "-0.32%" },
    { symbol: "WIPRO", price: "₹475.20", chg: "-0.84%" },
    { symbol: "ADANIENT", price: "₹2,980.00", chg: "-1.15%" },
    { symbol: "LIC", price: "₹942.50", chg: "-0.65%" }
  ];

  const volumeShockers = [
    { symbol: "DIXON", volume: "3.2x Avg", price: "₹10,240.00", chg: "+8.45%" },
    { symbol: "KPITTECH", volume: "2.8x Avg", price: "₹1,450.00", chg: "+6.22%" },
    { symbol: "RVNL", volume: "2.5x Avg", price: "₹395.00", chg: "-3.15%" }
  ];

  const breakouts = [
    { symbol: "TRENT", high: "52W High", price: "₹5,210.00", chg: "+4.20%" },
    { symbol: "HAL", high: "52W High", price: "₹4,250.00", chg: "+3.18%" },
    { symbol: "BEL", high: "52W High", price: "₹298.50", chg: "+2.60%" }
  ];

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between select-none gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 tracking-wider uppercase">
              Zerodha/Kite Style Professional Terminal
            </span>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              Indian Markets Workspace
            </h2>
          </div>

          {/* Sub tabs */}
          <div className="flex bg-slate-900 border border-border p-1 rounded-xl shrink-0 self-start sm:self-center">
            <button
              onClick={() => setActiveTab("OPTION_CHAIN")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "OPTION_CHAIN" ? "bg-indigo-500 text-white shadow-md" : "text-muted-foreground hover:text-white"
              }`}
            >
              Option Chain
            </button>
            <button
              onClick={() => setActiveTab("MARKET_BREADTH")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "MARKET_BREADTH" ? "bg-indigo-500 text-white shadow-md" : "text-muted-foreground hover:text-white"
              }`}
            >
              Market Breadth
            </button>
            <button
              onClick={() => setActiveTab("FLOWS_CALENDARS")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "FLOWS_CALENDARS" ? "bg-indigo-500 text-white shadow-md" : "text-muted-foreground hover:text-white"
              }`}
            >
              Institutional & Calendars
            </button>
          </div>
        </div>

        {/* Indices Tickers Tape */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 select-none">
          {indices.map((idx) => {
            const isUp = idx.status === "up";
            return (
              <div key={idx.name} className="glass-card p-4 rounded-xl border border-border space-y-1 bg-white/[0.01]">
                <span className="text-[9px] text-muted-foreground font-bold uppercase">{idx.name}</span>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-mono font-bold text-white">
                    {idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${isUp ? "text-green-400" : "text-red-400"}`}>
                    {isUp ? "+" : ""}{idx.pct}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {activeTab === "OPTION_CHAIN" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-300">
            {/* Main Option Chain Board */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl border border-border overflow-hidden bg-white/[0.01]">
                <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between select-none gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-2 uppercase">
                      <Table className="w-4 h-4 text-indigo-400" /> Options Chain Board
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Implied Volatilities (IV), Greeks Deltas, and Open Interest Metrics</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Expiry Dropdown */}
                    <select 
                      value={selectedExpiry}
                      onChange={(e) => setSelectedExpiry(e.target.value)}
                      className="bg-slate-950 border border-border text-[10px] text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                    >
                      <option value="16 Jul 2026">16 Jul 2026</option>
                      <option value="23 Jul 2026">23 Jul 2026</option>
                      <option value="30 Jul 2026">30 Jul 2026</option>
                    </select>

                    {/* Symbol Toggle */}
                    <div className="flex bg-slate-950 p-0.5 border border-border rounded-lg">
                      {["NIFTY", "BANKNIFTY", "FINNIFTY"].map((sym) => (
                        <button
                          key={sym}
                          onClick={() => setActiveChainSymbol(sym as any)}
                          className={`px-2 py-1 text-[9px] font-bold rounded transition-all cursor-pointer ${
                            activeChainSymbol === sym ? "bg-indigo-500 text-white" : "text-muted-foreground hover:text-white"
                          }`}
                        >
                          {sym === "BANKNIFTY" ? "BANK NIFTY" : sym}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Summary Cards */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b border-border/40 bg-slate-950/40 select-none text-center text-xs">
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">PCR (OI Ratio)</span>
                    <p className={`font-mono font-bold mt-0.5 ${pcr >= 1.0 ? "text-green-400" : "text-indigo-300"}`}>{pcr}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Max Pain strike</span>
                    <p className="font-mono font-bold text-white mt-0.5">₹{maxPain.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Market sentiment</span>
                    <p className="font-bold text-green-400 mt-0.5 flex items-center gap-1 justify-center">
                      <Zap className="w-3 h-3 fill-green-400" /> BULLISH
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">IV Environment</span>
                    <p className="font-bold text-amber-400 mt-0.5">MODERATE (12.8%)</p>
                  </div>
                </div>

                {/* Option Chain Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse text-[10px] select-none font-mono">
                    <thead>
                      <tr className="border-b border-border bg-slate-950 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th colSpan={5} className="p-3 border-r border-border bg-green-500/5 text-green-400">CALLS (NSE)</th>
                        <th className="p-3">STRIKE</th>
                        <th colSpan={5} className="p-3 border-l border-border bg-red-500/5 text-red-400">PUTS (NSE)</th>
                      </tr>
                      <tr className="border-b border-border/50 text-[8px] text-slate-500 bg-slate-950/20 font-bold uppercase">
                        <th className="p-2">OI (Lot)</th>
                        <th className="p-2">Vol</th>
                        <th className="p-2">IV (%)</th>
                        <th className="p-2">Delta</th>
                        <th className="p-2 border-r border-border">LTP</th>
                        <th className="p-2">Price</th>
                        <th className="p-2 border-l border-border">LTP</th>
                        <th className="p-2">Delta</th>
                        <th className="p-2">IV (%)</th>
                        <th className="p-2">Vol</th>
                        <th className="p-2">OI (Lot)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-medium text-slate-200">
                      {activeChain.map((row) => (
                        <tr key={row.strike} className="hover:bg-white/[0.01]">
                          {/* CALLS */}
                          <td className="p-2 text-slate-400">{row.callOI.toLocaleString()}</td>
                          <td className="p-2 text-slate-400">{row.callVolume.toLocaleString()}</td>
                          <td className="p-2 text-amber-400">{row.callIv}%</td>
                          <td className="p-2 text-indigo-400">+{row.callDelta}</td>
                          <td className="p-2 border-r border-border text-white">₹{row.callLtp.toFixed(2)}</td>
                          
                          {/* STRIKE */}
                          <td className="p-2 bg-slate-950/50 font-bold text-indigo-400">₹{row.strike}</td>
                          
                          {/* PUTS */}
                          <td className="p-2 border-l border-border text-white">₹{row.putLtp.toFixed(2)}</td>
                          <td className="p-2 text-red-400">{row.putDelta}</td>
                          <td className="p-2 text-amber-400">{row.putIv}%</td>
                          <td className="p-2 text-slate-400">{row.putVolume.toLocaleString()}</td>
                          <td className="p-2 text-slate-400">{row.putOI.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Option Open Interest Heatmap (Recharts) */}
              <div className="glass-card p-5 rounded-2xl border border-border bg-white/[0.01]">
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Option Open Interest Heatmap (Strikes)</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Visual representation of call vs put support and resistance levels</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="strike" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                        labelStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "10px" }} />
                      <Bar dataKey="Call OI" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Put OI" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-6">
              {/* Quick watchlist panel */}
              <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01] select-none">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" /> Active Market Movers
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Daily NSE gainers & losers list stats</p>
                </div>
                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest">TOP GAINERS</p>
                    {moversGainers.map((item) => (
                      <div key={item.symbol} className="flex justify-between items-center text-xs p-2 rounded bg-green-500/5 border border-green-500/10">
                        <span className="font-bold text-white">{item.symbol}</span>
                        <div className="text-right font-mono">
                          <span className="text-slate-300 font-semibold">{item.price}</span>
                          <span className="text-green-400 font-bold ml-2">{item.chg}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/30">
                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest">TOP LOSERS</p>
                    {moversLosers.map((item) => (
                      <div key={item.symbol} className="flex justify-between items-center text-xs p-2 rounded bg-red-500/5 border border-red-500/10">
                        <span className="font-bold text-white">{item.symbol}</span>
                        <div className="text-right font-mono">
                          <span className="text-slate-300 font-semibold">{item.price}</span>
                          <span className="text-red-400 font-bold ml-2">{item.chg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "MARKET_BREADTH" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Advance/Decline Meter */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01] select-none text-center">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-left">Market Breadth Ratio</h4>
                <p className="text-[10px] text-muted-foreground text-left mt-0.5">Nifty 50 Advance / Decline distribution</p>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span className="text-green-400">38 Advances</span>
                  <span className="text-red-400">12 Declines</span>
                </div>
                <div className="w-full h-3 rounded-full bg-red-500 overflow-hidden flex">
                  <div className="h-full bg-green-500" style={{ width: "76%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground pt-2">Advance-Decline Ratio: 3.17 (Bullish market breadth)</p>
              </div>
            </div>

            {/* Volume Shockers */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Volume Shockers</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Abnormal volume relative to 20-day averages</p>
              </div>
              <div className="space-y-2.5">
                {volumeShockers.map((item) => (
                  <div key={item.symbol} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.symbol}</p>
                      <p className="text-[9px] text-indigo-400 font-mono">{item.volume}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-slate-300 font-semibold">{item.price}</p>
                      <p className="text-green-400 font-bold text-[10px]">{item.chg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 52W High Breakouts */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">52W Breakouts</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Actively hitting fresh 52-week highs in NSE</p>
              </div>
              <div className="space-y-2.5">
                {breakouts.map((item) => (
                  <div key={item.symbol} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{item.symbol}</p>
                      <span className="px-1 py-0.25 rounded bg-green-500/10 text-green-400 border border-green-500/10 text-[8px] font-bold">
                        {item.high}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-slate-300 font-semibold">{item.price}</p>
                      <p className="text-green-400 font-bold text-[10px]">{item.chg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "FLOWS_CALENDARS" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* FII DII Net Flows */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" /> FII & DII Net Flows
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Daily institutional investments values (Cr)</p>
              </div>
              <div className="space-y-3">
                {fiiDiiFlows.map((flow) => (
                  <div key={flow.date} className="p-3 rounded-xl border border-border bg-slate-950/30 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-indigo-300">{flow.date}</span>
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
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" /> Corporate Actions
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Splits, bonus issues, and dividends record dates</p>
              </div>
              <div className="divide-y divide-border/30 text-xs">
                {corporateActions.map((action, idx) => (
                  <div key={idx} className="flex justify-between py-3 items-center">
                    <div>
                      <span className="font-bold text-indigo-400 font-sans">{action.symbol}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-border text-[8px] text-muted-foreground font-bold uppercase ml-2">
                        {action.type}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-white text-[11px]">{action.desc}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">Record: {action.recordDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IPO & Bulk Deals */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" /> IPO & Bulk Deals
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">IPO subscription calendar and block trade lists</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">IPO CALENDAR</p>
                  {ipoCalendar.map((ipo) => (
                    <div key={ipo.name} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950/30 border border-border">
                      <div>
                        <p className="font-bold text-white">{ipo.name}</p>
                        <p className="text-[9px] text-muted-foreground">{ipo.size} | {ipo.price}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          ipo.status === "Open" ? "bg-green-500/10 text-green-400" : ipo.status === "Upcoming" ? "bg-indigo-500/10 text-indigo-400" : "bg-white/5 text-muted-foreground"
                        }`}>{ipo.status}</span>
                        <p className="text-[9px] text-slate-500 mt-0.5">{ipo.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2 border-t border-border/30">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">BULK DEALS LOG</p>
                  {bulkDeals.map((deal, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{deal.symbol} <span className={`text-[8px] font-bold px-1 rounded ${deal.action === "BUY" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{deal.action}</span></p>
                        <p className="text-[9px] text-slate-500">{deal.clientName}</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="text-white font-bold">{deal.qty}</p>
                        <p className="text-[9px] text-muted-foreground">Price: {deal.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
