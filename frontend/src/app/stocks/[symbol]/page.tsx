// ==============================================================================
// Stock Detail & Paper Trading Page
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LayoutShell from "@/components/layout-shell";
import MarketChart from "@/components/market-chart";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Calendar, 
  Users,
  CheckCircle,
  AlertCircle,
  Bell,
  Heart,
  ArrowRight,
  TrendingUp as GainIcon,
  Sliders,
  DollarSign
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const symbol = (params.symbol as string)?.toUpperCase() || "RELIANCE";

  const [watchlistActive, setWatchlistActive] = useState(false);
  const [priceAlertActive, setPriceAlertActive] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState("");

  // Paper Trading Order forms state
  const [orderAction, setOrderAction] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT" | "STOP" | "TAKE_PROFIT">("MARKET");
  const [orderQuantity, setOrderQuantity] = useState(10);
  const [orderPrice, setOrderPrice] = useState(0);
  const [triggerPrice, setTriggerPrice] = useState(0);
  const [tradingStatus, setTradingStatus] = useState<string | null>(null);
  const [mistakeReport, setMistakeReport] = useState<any | null>(null);

  // Fetch Stock Profile
  const { data: profile, isLoading: isProfileLoading, error: profileErr } = useQuery<any>({
    queryKey: ["stock-profile", symbol],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/profile`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    }
  });

  // Fetch Stock Quote
  const { data: quote, isLoading: isQuoteLoading } = useQuery<any>({
    queryKey: ["stock-quote", symbol],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/quote`);
      if (!res.ok) throw new Error("Failed to fetch quote");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 5000
  });

  // Fetch Candles Chart details
  const { data: candles, isLoading: isCandlesLoading } = useQuery<any[]>({
    queryKey: ["stock-candles", symbol],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/stocks/${symbol}/candles?days=100`);
      if (!res.ok) throw new Error("Failed to fetch candles");
      const json = await res.json();
      return json.data;
    }
  });

  // Load custom quote price when resolved
  useEffect(() => {
    if (quote) {
      setOrderPrice(quote.currentPrice);
      setTriggerPrice(quote.currentPrice);
    }
  }, [quote]);

  // Execute paper trade
  const handlePaperTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradingStatus(null);
    setMistakeReport(null);
    try {
      // Find active portfolio fallback
      const portfoliosRes = await fetch(`${API_BASE_URL}/portfolios/list-fallback`);
      const portfoliosJson = await portfoliosRes.json();
      const portfolioId = portfoliosJson.data?.[0]?.id || "mock-portfolio-id";

      const endpoint = orderAction === "BUY" 
        ? `${API_BASE_URL}/portfolios/${portfolioId}/buy`
        : `${API_BASE_URL}/portfolios/${portfolioId}/sell`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          quantity: orderQuantity,
          pricePerUnit: orderPrice,
          assetType: "STOCK",
          orderType,
          triggerPrice: orderType === "STOP" ? triggerPrice : undefined
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Transaction declined.");

      setMistakeReport(json.mistakeReport);
      setTradingStatus("success");
      queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
    } catch (err: any) {
      setTradingStatus(`error: ${err.message}`);
    }
  };

  if (isProfileLoading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  if (profileErr || !profile) {
    return (
      <LayoutShell>
        <div className="max-w-md mx-auto text-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Stock Not Found</h3>
          <p className="text-xs text-muted-foreground">The ticker "{symbol}" was not found in our database index.</p>
          <button 
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </LayoutShell>
    );
  }

  const isUp = quote ? quote.percentChange >= 0 : true;
  const capLabel = profile.marketCapitalization >= 100000 
    ? "Large Cap" 
    : profile.marketCapitalization >= 20000 
      ? "Mid Cap" 
      : "Small Cap";

  const shareholdingData = profile.shareholdingPattern ? [
    { name: "Promoter", value: profile.shareholdingPattern.promoter },
    { name: "FII", value: profile.shareholdingPattern.fii },
    { name: "DII", value: profile.shareholdingPattern.dii },
    { name: "Public", value: profile.shareholdingPattern.public }
  ] : [];

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between select-none gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center font-bold text-sm text-indigo-400">
              {symbol.substring(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white font-sans">{profile.name}</h2>
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-border text-[8px] font-bold text-muted-foreground font-mono">{profile.exchange || "NSE"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{symbol} | ISIN: {profile.isin || "INE000000000"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setWatchlistActive(!watchlistActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                watchlistActive ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/5 border-border text-muted-foreground hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${watchlistActive ? "fill-red-400 text-red-400" : ""}`} />
              <span>{watchlistActive ? "Watching" : "Add Watchlist"}</span>
            </button>

            <button 
              onClick={() => setPriceAlertActive(!priceAlertActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                priceAlertActive ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-white/5 border-border text-muted-foreground hover:text-white"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Price Alert</span>
            </button>
          </div>
        </div>

        {/* Live Quotes Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/40 border border-border/80 rounded-2xl p-5 select-none">
          <div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">LIVE PRICE</span>
            <p className="text-2xl font-mono font-bold text-white mt-1">
              {isQuoteLoading ? "..." : `₹${quote?.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">PRICE CHANGE</span>
            <p className={`text-md font-mono font-bold mt-2 flex items-center gap-1 ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isQuoteLoading ? "..." : (isUp ? `+${quote?.percentChange}%` : `${quote?.percentChange}%`)}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">52W HIGH</span>
            <p className="text-sm font-mono font-semibold text-green-400 mt-2">
              ₹{profile.fiftyTwoWeekHigh?.toLocaleString("en-IN") || "..."}
            </p>
          </div>
          <div>
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">52W LOW</span>
            <p className="text-sm font-mono font-semibold text-red-400 mt-2">
              ₹{profile.fiftyTwoWeekLow?.toLocaleString("en-IN") || "..."}
            </p>
          </div>
        </div>

        {/* Main Grid: Chart & Trading Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Historical price chart (col-span-2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-4 rounded-2xl border border-border min-h-[432px]">
              <MarketChart symbol={symbol} data={candles || []} isLoading={isCandlesLoading} />
            </div>

            {/* Financial metrics grid */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-5 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Valuation & Financial Ratios
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs select-none">
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">MARKET CAP</span>
                  <p className="text-sm font-semibold text-white mt-1">₹{(profile.marketCapitalization / 10).toLocaleString("en-IN")} Cr</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">ENTERPRISE VALUE</span>
                  <p className="text-sm font-semibold text-white mt-1">₹{(profile.enterpriseValue ? profile.enterpriseValue / 10 : profile.marketCapitalization / 10).toLocaleString("en-IN")} Cr</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">P/E RATIO</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">{profile.peRatio || "..."}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">P/B RATIO</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">{profile.pbRatio || "..."}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">DIVIDEND YIELD</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">{profile.dividendYield || 0}%</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">EPS (TTM)</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">₹{profile.eps || "..."}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">ROE / ROCE</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">{profile.roe || "..."}% / {profile.roce || "..."}%</p>
                </div>
                <div className="p-3.5 rounded-xl border border-border/50 bg-slate-950/20">
                  <span className="text-[9px] text-muted-foreground font-bold uppercase">DEBT TO EQUITY</span>
                  <p className="text-sm font-mono font-semibold text-white mt-1">{profile.debtToEquity || 0}</p>
                </div>
              </div>
            </div>

            {/* Income statement results (quarterly and annual) */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Financial Statements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Quarterly results */}
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">QUARTERLY REPORT (CR)</p>
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border/50">
                        <th className="pb-1.5">Quarter</th>
                        <th className="pb-1.5 text-right">Revenue</th>
                        <th className="pb-1.5 text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-slate-300">
                      {profile.quarterlyResults?.map((q: any) => (
                        <tr key={q.quarter}>
                          <td className="py-2">{q.quarter}</td>
                          <td className="py-2 text-right">₹{q.revenue.toLocaleString()}</td>
                          <td className="py-2 text-right text-green-400">₹{q.profit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Annual results */}
                <div className="space-y-3">
                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">ANNUAL PERFORMANCE (CR)</p>
                  <table className="w-full text-left font-mono">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border/50">
                        <th className="pb-1.5">Year</th>
                        <th className="pb-1.5 text-right">Revenue</th>
                        <th className="pb-1.5 text-right">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-slate-300">
                      {profile.annualResults?.map((a: any) => (
                        <tr key={a.year}>
                          <td className="py-2">{a.year}</td>
                          <td className="py-2 text-right">₹{a.revenue.toLocaleString()}</td>
                          <td className="py-2 text-right text-green-400">₹{a.profit.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar trading & analysis panel */}
          <div className="space-y-6">
            {/* Paper Trading Execution Console */}
            <div className="glass-card p-6 rounded-2xl border border-border bg-white/[0.01]">
              <div className="mb-4">
                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400 tracking-wider uppercase">
                  VIRTUAL TRADING (INR)
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-2">Execute Paper Trade</h4>
              </div>

              {/* Order toggles */}
              <form onSubmit={handlePaperTrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-border rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOrderAction("BUY")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      orderAction === "BUY" ? "bg-green-500 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderAction("SELL")}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      orderAction === "SELL" ? "bg-red-500 text-white" : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    SELL
                  </button>
                </div>

                {/* Order Type */}
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e: any) => setOrderType(e.target.value)}
                    className="w-full bg-slate-950 border border-border text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  >
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                    <option value="STOP">Stop Loss</option>
                    <option value="TAKE_PROFIT">Take Profit</option>
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase">Quantity (Shares)</label>
                  <input
                    type="number"
                    min={1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-border text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                  />
                </div>

                {/* Prices depending on type */}
                {orderType !== "MARKET" && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Target Price (₹)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={orderPrice}
                      onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-border text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                    />
                  </div>
                )}

                {orderType === "STOP" && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase">Stop Trigger Price (₹)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={triggerPrice}
                      onChange={(e) => setTriggerPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-border text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono"
                    />
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer ${
                    orderAction === "BUY" ? "bg-green-500 hover:bg-green-600 shadow-green-500/10" : "bg-red-500 hover:bg-red-600 shadow-red-500/10"
                  }`}
                >
                  Place {orderAction} Order
                </button>

                {/* Status indicator */}
                {tradingStatus === "success" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>Order executed and portfolio updated!</span>
                    </div>

                    {mistakeReport && (
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-300 space-y-3.5 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
                          <span className="font-bold text-indigo-400 uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" /> AI MISTAKE DETECTOR
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-bold font-mono">
                            Score: {mistakeReport.tradeScore}/100
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-200">{mistakeReport.explanation}</p>
                        
                        {mistakeReport.mistakes.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Mistakes Spotted:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400">
                              {mistakeReport.mistakes.map((m: string, i: number) => (
                                <li key={i}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <p className="text-[9px] text-green-400 font-bold uppercase tracking-wider">Educational Tips:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400">
                            {mistakeReport.learningTips.map((tip: string, i: number) => (
                              <li key={i}>{tip}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1 font-mono text-[9px] border-t border-border/40 pt-2 text-slate-500 space-y-0.5">
                          <p>Risk-Reward: {mistakeReport.riskRewardRatio}</p>
                          <p>Duration: {mistakeReport.holdingPeriodRecommendation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tradingStatus?.startsWith("error:") && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{tradingStatus}</span>
                  </div>
                )}
              </form>
            </div>

            {/* AI Analysis Card */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-indigo-400" /> AI Coach Assessment
                </h4>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-400/20 text-[9px] font-bold text-indigo-400">
                  Risk: {profile.riskScore || 30}/100
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">VALUATION HEALTH</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 rounded bg-slate-950 overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${profile.aiAnalysis?.valuationScore || 70}%` }} />
                    </div>
                    <span className="font-mono text-white text-[10px]">{profile.aiAnalysis?.valuationScore || 70}/100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-bold">OUTLOOK</p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">{profile.aiAnalysis?.outlook || "..."}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-green-400 font-bold">STRENGTH</p>
                    <p className="text-slate-400 leading-normal">{profile.aiAnalysis?.strength || "..."}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-red-400 font-bold">WEAKNESS</p>
                    <p className="text-slate-400 leading-normal">{profile.aiAnalysis?.weakness || "..."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shareholding Pattern Distribution */}
            {profile.shareholdingPattern && (
              <div className="glass-card p-6 rounded-2xl border border-border space-y-4 bg-white/[0.01]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Shareholding Pattern</h4>
                <div className="space-y-2.5 text-xs select-none">
                  {shareholdingData.map((s) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{s.name}</span>
                        <span className="font-mono text-white font-bold">{s.value}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className={`h-full ${
                            s.name === "Promoter" ? "bg-indigo-500" : s.name === "FII" ? "bg-green-500" : s.name === "DII" ? "bg-amber-500" : "bg-slate-500"
                          }`} 
                          style={{ width: `${s.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
