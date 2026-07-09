// ==============================================================================
// AI Research Terminal - Frontend Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  BrainCircuit, 
  Search, 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  BadgeHelp 
} from "lucide-react";

interface ResearchReport {
  symbol: string;
  type: string;
  summary: string;
  swot?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  dcf?: {
    impliedValue: number;
    currentPrice: number;
    upsidePct: number;
    terminalGrowthRate: number;
    wacc: number;
  };
}

export default function ResearchTerminalPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [researchType, setResearchType] = useState<"SWOT" | "DCF" | "EARNINGS">("SWOT");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryText, setQueryText] = useState("");

  const handleGenerateResearch = async () => {
    setIsLoading(true);
    setReport(null);
    
    // Simulate natural language intelligence processing delay
    setTimeout(() => {
      const sym = symbol.toUpperCase();
      let generatedReport: ResearchReport;

      if (researchType === "SWOT") {
        generatedReport = {
          symbol: sym,
          type: "SWOT Analysis Report",
          summary: `SWOT strategic positioning summary for ${sym}. Valuation indexes match Technology sector trends.`,
          swot: {
            strengths: ["Strong global brand value", "High cash reserve liquidity", "Expanding ecosystem services monetization"],
            weaknesses: ["High premium price dependencies", "Slight delays in AI product deployment", "Relatively high production concentrations"],
            opportunities: ["Generative AI chips design integrations", "Mixed-reality headset scaling", "Enterprise cloud subscription expansions"],
            threats: ["Regulatory anti-trust compliance probes", "Geopolitical supply chain disruptions", "Competitor margin contractions"]
          }
        };
      } else if (researchType === "DCF") {
        generatedReport = {
          symbol: sym,
          type: "Discounted Cash Flow (DCF) Summary",
          summary: `Intrinsic value profile for ${sym} computed using 10-year free cash flow projections.`,
          dcf: {
            currentPrice: sym === "BTC" ? 65800.0 : 185.24,
            impliedValue: sym === "BTC" ? 78400.0 : 212.50,
            upsidePct: sym === "BTC" ? 19.1 : 14.7,
            terminalGrowthRate: 2.5,
            wacc: 8.2
          }
        };
      } else {
        generatedReport = {
          symbol: sym,
          type: "Quarterly Earnings & SEC Summary",
          summary: `Compiled analysis of the latest 10-Q filing. EPS exceeded analyst expectations by 4.2% on top of +8% year-over-year revenue expansion. Operating margins remain stable at 26.4%.`
        };
      }

      setReport(generatedReport);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">AI Research Terminal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Generate strategic intelligence reports and DCF intrinsic valuations using financial models</p>
        </div>

        {/* Input Controls Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/50 border border-border items-end select-none">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Asset Ticker</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-border text-xs">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="bg-transparent text-white focus:outline-none uppercase w-full"
                placeholder="e.g. AAPL, BTC"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground font-bold uppercase">Intelligence Tool</label>
            <select
              value={researchType}
              onChange={(e: any) => setResearchType(e.target.value)}
              className="w-full bg-slate-950 border border-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="SWOT">SWOT Positioning</option>
              <option value="DCF">DCF Intrinsic Valuation</option>
              <option value="EARNINGS">Earnings/SEC 10-Q Summary</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleGenerateResearch}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Generating Report..." : "RUN AI ENGINE"}
            </button>
          </div>
        </div>

        {/* Custom prompt query bar */}
        <div className="flex gap-2.5 p-4 rounded-xl bg-white/5 border border-border text-xs items-center">
          <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Ask a specific question... (e.g. 'How does WACC influence Apple's DCF upside?')" 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="bg-transparent text-white focus:outline-none placeholder-muted-foreground w-full"
            onKeyDown={(e) => { if (e.key === "Enter") handleGenerateResearch(); }}
          />
        </div>

        {/* Report Display Console */}
        {isLoading && (
          <div className="glass-card p-12 rounded-2xl border border-border flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-t-indigo-500 border-border rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground font-medium animate-pulse">Running quantitative parsing scripts...</span>
          </div>
        )}

        {report && (
          <div className="glass-card p-6 rounded-2xl border border-border space-y-6 animate-in fade-in duration-300">
            {/* Header banner */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{report.type}</span>
                <h3 className="text-xl font-bold text-white mt-1">{report.symbol} Research Report</h3>
              </div>
              <FileText className="w-7 h-7 text-indigo-400/80" />
            </div>

            {/* General summary */}
            <div className="bg-white/[0.01] p-4 rounded-xl border border-border/40">
              <p className="text-xs leading-relaxed text-slate-200">{report.summary}</p>
            </div>

            {/* SWOT Report Layout */}
            {report.swot && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="p-4 rounded-xl border border-green-500/10 bg-green-500/5 space-y-2">
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1">
                    {report.swot.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/5 space-y-2">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Weaknesses
                  </h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1">
                    {report.swot.weaknesses.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/5 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Opportunities
                  </h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1">
                    {report.swot.opportunities.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>

                {/* Threats */}
                <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BadgeHelp className="w-4 h-4" /> Threats
                  </h4>
                  <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1">
                    {report.swot.threats.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* DCF Valuation Layout */}
            {report.dcf && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border/30 pt-6 select-none">
                <div className="p-4 rounded-xl bg-white/5 border border-border text-center space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Market Price</span>
                  <p className="text-xl font-bold font-mono text-white">${report.dcf.currentPrice.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-1">
                  <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">DCF Implied Value</span>
                  <p className="text-xl font-bold font-mono text-indigo-300">${report.dcf.impliedValue.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-center space-y-1">
                  <span className="text-[10px] text-green-400 uppercase font-bold tracking-wider">Estimated Upside</span>
                  <p className="text-xl font-bold font-mono text-green-400">+{report.dcf.upsidePct}%</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
