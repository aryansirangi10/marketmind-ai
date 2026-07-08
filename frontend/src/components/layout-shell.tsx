// ==============================================================================
// Layout Shell Component (Dashboard Frame)
// ==============================================================================

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Wallet, 
  MessageSquare, 
  Newspaper, 
  Settings, 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  ArrowUpRight 
} from "lucide-react";

interface LayoutShellProps {
  children: React.ReactNode;
  onSearchClick?: () => void;
}

export default function LayoutShell({ children, onSearchClick }: LayoutShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Portfolio", href: "/portfolio", icon: Wallet },
    { name: "AI Assistant", href: "/chat", icon: MessageSquare },
    { name: "Market News", href: "/news", icon: Newspaper }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* --------------------------------------------------------------------------
         Desktop Sidebar (Glassmorphic)
         -------------------------------------------------------------------------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col glass-panel border-r border-border h-full">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            M
          </div>
          <span className="font-bold text-lg tracking-wider text-white">
            Market<span className="text-indigo-400">Mind</span> AI
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-400 font-medium" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-indigo-400" : "text-muted-foreground"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === "/settings" 
                ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-400 font-medium" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50 mt-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center text-white border border-indigo-500/20">
              <User className="w-4 h-4 text-indigo-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Demo Account</p>
              <p className="text-[10px] text-muted-foreground truncate">demo@marketmind.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --------------------------------------------------------------------------
         Mobile Sidebar Overlay
         -------------------------------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex w-64 flex-col bg-slate-950 border-r border-border h-full p-4">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white">M</div>
                <span className="font-bold text-white">MarketMind</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-white/10 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    pathname === item.href 
                      ? "bg-indigo-500/10 text-indigo-300 border-l-2 border-indigo-400 font-medium" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* --------------------------------------------------------------------------
         Main Workspace Layout (Content Area)
         -------------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-border flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Clickable Search Bar (Cmd + K Trigger) */}
            <div 
              onClick={onSearchClick}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-muted-foreground hover:border-white/10 cursor-pointer text-xs w-64 transition-colors"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <span>Search everywhere...</span>
              <kbd className="ml-auto bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-muted-foreground">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Simple Notifications Indicator */}
            <button className="relative p-1.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            </button>

            {/* Profile Avatar Trigger */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-indigo-400/20 font-semibold text-xs shadow-md">
                DA
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
