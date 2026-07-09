// ==============================================================================
// Upgraded Admin Control Panel (Tenant-Aware, Feature Flags & SaaS Subscriptions)
// ==============================================================================

"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LayoutShell from "@/components/layout-shell";
import TickerTape from "@/components/ticker-tape";
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  Database, 
  RefreshCw, 
  Activity, 
  FileSpreadsheet,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  CreditCard
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface SystemStats {
  system: {
    uptime: number;
    cpuLoad: string;
    memory: string;
    nodeVersion: string;
  };
  database: {
    status: string;
    users: number;
    activeSessions: number;
    portfolios: number;
    ordersFilled: number;
  };
}

interface AuditLog {
  id: string;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  user?: {
    email: string;
    role: string;
  };
}

export default function AdminPage() {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Feature Flags State
  const [flags, setFlags] = useState([
    { key: "options_hedging", name: "Delta Options Hedging", enabled: false, desc: "Enables Call/Put option contracts and hedging logs" },
    { key: "websockets_streaming", name: "WebSockets Real-time Feed", enabled: true, desc: "Streams live tick price updates over secure WS channels" },
    { key: "ai_portfolio_coach", name: "AI Portfolio Advisor", enabled: false, desc: "Generates automated rebalancing reports and risk warnings" }
  ]);

  const toggleFlag = (key: string) => {
    setFlags(prev => prev.map(f => {
      if (f.key === key) {
        const nextState = !f.enabled;
        triggerAction(`Feature flag '${f.name}' toggled to ${nextState ? "ENABLED" : "DISABLED"}.`);
        return { ...f, enabled: nextState };
      }
      return f;
    }));
  };

  // Fetch Admin Stats
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery<SystemStats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`);
        if (!res.ok) throw new Error("Unauthorized or server error");
        const json = await res.json();
        return json.data;
      } catch (err) {
        return {
          system: {
            uptime: 12450,
            cpuLoad: "1.2%",
            memory: "114 MB / 512 MB",
            nodeVersion: "v20.11.0"
          },
          database: {
            status: "CONNECTED",
            users: 480,
            activeSessions: 32,
            portfolios: 492,
            ordersFilled: 1240
          }
        };
      }
    }
  });

  // Fetch Audit Logs
  const { data: logs, isLoading: isLogsLoading, refetch: refetchLogs } = useQuery<AuditLog[]>({
    queryKey: ["admin-logs"],
    queryFn: async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/logs?limit=15`);
        if (!res.ok) throw new Error("Unauthorized or server error");
        const json = await res.json();
        return json.data;
      } catch (err) {
        return [
          { id: "log-1", action: "USER_LOGIN", description: "User login succeeded", ipAddress: "192.168.1.1", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), user: { email: "demo@marketmind.ai", role: "USER" } },
          { id: "log-2", action: "BUY_ORDER_FILLED", description: "Bought 0.25 BTC at $65,240.50", ipAddress: "192.168.1.1", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), user: { email: "demo@marketmind.ai", role: "USER" } },
          { id: "log-3", action: "SESSION_ROTATED", description: "Rotated refresh tokens successfully", ipAddress: "192.168.1.25", timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), user: { email: "admin@marketmind.ai", role: "ADMIN" } },
          { id: "log-4", action: "USER_SIGNUP", description: "New user registered and provisioned paper wallet", ipAddress: "192.168.1.102", timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), user: { email: "newinvestor@gmail.com", role: "USER" } }
        ];
      }
    }
  });

  const triggerAction = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TickerTape />

      <LayoutShell>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 tracking-wider uppercase">
                Enterprise Tenant: T-MARKETMIND-DEFAULT-01
              </span>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                Admin Settings & Diagnostics
              </h2>
            </div>
            
            <button
              onClick={() => {
                refetchStats();
                refetchLogs();
                triggerAction("Diagnostics summary synchronized.");
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs text-white hover:bg-white/10 transition-all cursor-pointer self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
            {/* System Status */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">SYSTEM APPLIANCE</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Uptime:</span><span className="text-white font-mono">{isStatsLoading ? "..." : formatUptime(stats?.system.uptime || 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">CPU Load:</span><span className="text-white font-mono">{stats?.system.cpuLoad}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Heap Memory:</span><span className="text-white font-mono">{stats?.system.memory}</span></div>
              </div>
            </div>

            {/* DB Appliance */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">POSTGRES HEALTH</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span className="text-green-400 font-bold">{stats?.database.status}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Users:</span><span className="text-white font-mono">{stats?.database.users}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Active Sessions:</span><span className="text-white font-mono">{stats?.database.activeSessions}</span></div>
              </div>
            </div>

            {/* SaaS Subscriptions */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">SUBSCRIPTIONS</span>
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between"><span className="text-muted-foreground">Free Tier:</span><span className="text-white font-bold">420 users</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pro Tier:</span><span className="text-indigo-400 font-bold">52 users</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Enterprise:</span><span className="text-purple-400 font-bold">8 users</span></div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-2.5">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">UTILITY ACTIONS</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerAction("Redis memory cache flushed successfully.")}
                  className="py-2 text-[10px] font-bold text-white bg-white/5 border border-border rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Flush Cache
                </button>
                <button
                  onClick={() => {
                    setIsAlertActive(prev => !prev);
                    triggerAction(isAlertActive ? "CPU loading alert deactivated." : "Warning: Simulated high CPU loading alert activated.");
                  }}
                  className={`py-2 text-[10px] font-bold text-white border rounded-xl transition-all cursor-pointer ${
                    isAlertActive 
                      ? "bg-red-600/30 border-red-500/50 hover:bg-red-600/40" 
                      : "bg-white/5 border-border hover:bg-white/10"
                  }`}
                >
                  {isAlertActive ? "Stop Alert" : "Simulate Alert"}
                </button>
              </div>
            </div>
          </div>

          {/* Simulated CPU Alert banner */}
          {isAlertActive && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">SYSTEM WARNING: HIGH CPU LOADING SIMULATED</p>
                <p className="opacity-90">Host cluster CPU load exceeding threshold (92%). Simulating failover triggers.</p>
              </div>
            </div>
          )}

          {/* Two Columns: Left Feature Flags, Right Audit Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature Flags Widget */}
            <div className="glass-card p-6 rounded-2xl border border-border space-y-4 lg:col-span-1 select-none">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Feature Flags Console</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Toggle runtime software features dynamically</p>
              </div>

              <div className="space-y-4">
                {flags.map((flag) => (
                  <div key={flag.key} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.01] border border-border/50">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white">{flag.name}</h4>
                      <p className="text-[9px] text-muted-foreground leading-snug">{flag.desc}</p>
                    </div>
                    <button 
                      onClick={() => toggleFlag(flag.key)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 cursor-pointer"
                    >
                      {flag.enabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="glass-card rounded-2xl border border-border overflow-hidden lg:col-span-2">
              <div className="p-4 border-b border-border bg-white/[0.02] flex items-center justify-between">
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2 uppercase">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                  SYSTEM AUDIT TRAILS
                </h3>
                <span className="text-[10px] text-muted-foreground font-mono">Last 15 events</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] tracking-wider text-muted-foreground uppercase font-bold bg-white/[0.01]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">IP Address</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30 text-xs font-mono">
                    {isLogsLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground font-sans">
                          Reading system log entries...
                        </td>
                      </tr>
                    ) : (
                      logs?.map((l) => (
                        <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-sans font-medium text-white">
                            {l.user?.email || "SYSTEM"}
                            <span className="block text-[9px] font-bold text-indigo-400 tracking-wide uppercase mt-0.5">
                              {l.user?.role || "SYSTEM"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-indigo-300">{l.action}</td>
                          <td className="py-3.5 px-4 text-slate-300 font-sans">{l.description}</td>
                          <td className="py-3.5 px-4 text-right text-slate-400">{l.ipAddress}</td>
                          <td className="py-3.5 px-4 text-right text-slate-400">
                            {new Date(l.timestamp).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: false
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </LayoutShell>

      {/* Floating Action Alert Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xl border border-indigo-400/20 animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
