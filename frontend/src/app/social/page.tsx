// ==============================================================================
// Social Investing Hub - Frontend Page
// ==============================================================================

"use client";

import React, { useState } from "react";
import LayoutShell from "@/components/layout-shell";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Send, 
  TrendingUp, 
  TrendingDown, 
  Award 
} from "lucide-react";

interface SocialPost {
  id: string;
  userName: string;
  userRole: string;
  content: string;
  symbol?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  pnlPct: number;
  valuation: number;
  isPositive: boolean;
}

export default function SocialHubPage() {
  const [postContent, setPostContent] = useState("");
  const [postSymbol, setPostSymbol] = useState("");
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: "post_1",
      userName: "Alex Rivers",
      userRole: "Pro Trader",
      content: "BTC consolidations look extremely bullish. Standard deviation channels narrowed, preparing for volume breaks. Targeting $68,500.",
      symbol: "BTC",
      likes: 24,
      comments: 7,
      timestamp: "2 hours ago"
    },
    {
      id: "post_2",
      userName: "Sarah Patel",
      userRole: "Quant Analyst",
      content: "Just ran a 100-day Black-Litterman optimization overlay on my stock holdings. S&P indices drift suggests increasing tech weights.",
      symbol: "AAPL",
      likes: 18,
      comments: 3,
      timestamp: "5 hours ago"
    }
  ]);

  const leaderboard: LeaderboardUser[] = [
    { rank: 1, name: "Marcus Aurelius", pnlPct: 45.2, valuation: 145200.0, isPositive: true },
    { rank: 2, name: "Elena Rostova", pnlPct: 32.8, valuation: 132800.0, isPositive: true },
    { rank: 3, name: "Kenji Sato", pnlPct: 18.5, valuation: 118500.0, isPositive: true },
    { rank: 4, name: "Sarah Patel", pnlPct: 9.7, valuation: 109700.0, isPositive: true },
    { rank: 5, name: "David Miller", pnlPct: -2.4, valuation: 97600.0, isPositive: false }
  ];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: SocialPost = {
      id: Math.random().toString(),
      userName: "You (Paper Trader)",
      userRole: "Beginner",
      content: postContent,
      symbol: postSymbol ? postSymbol.toUpperCase() : undefined,
      likes: 0,
      comments: 0,
      timestamp: "Just now"
    };

    setPosts([newPost, ...posts]);
    setPostContent("");
    setPostSymbol("");
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Social Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Share trading strategies, publish sentiment views, and benchmark against top paper portfolios</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start select-none">
          {/* Main Feed Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Block */}
            <div className="glass-card p-5 rounded-2xl border border-border">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  placeholder="Share a trading strategy, market thesis, or portfolio update..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase shrink-0">Link Ticker:</span>
                    <input
                      type="text"
                      placeholder="e.g. BTC, AAPL"
                      value={postSymbol}
                      onChange={(e) => setPostSymbol(e.target.value)}
                      className="bg-white/5 border border-border rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-indigo-500 w-24"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!postContent.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" /> PUBLISH
                  </button>
                </div>
              </form>
            </div>

            {/* Feeds stream */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="glass-card p-5 rounded-2xl border border-border space-y-3.5">
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {post.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          {post.userName}
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-border text-[8px] text-muted-foreground font-bold uppercase">
                            {post.userRole}
                          </span>
                        </h4>
                        <p className="text-[9px] text-muted-foreground">{post.timestamp}</p>
                      </div>
                    </div>

                    {post.symbol && (
                      <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300">
                        ${post.symbol}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <p className="text-xs text-slate-200 leading-relaxed">{post.content}</p>

                  {/* Action controls */}
                  <div className="flex items-center gap-5 border-t border-border/20 pt-3 text-muted-foreground text-[10px] font-bold">
                    <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" /> {post.likes} Likes
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" /> {post.comments} Comments
                    </button>
                    <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer ml-auto">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Leaderboards */}
          <div className="space-y-6 lg:col-span-1">
            {/* PnL rankings */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> Leaderboard (Paper PnL)
              </h3>

              <div className="divide-y divide-border/30 text-xs">
                {leaderboard.map((user) => (
                  <div key={user.rank} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono font-bold text-slate-500 text-center">{user.rank}</span>
                      <span className="font-bold text-slate-200">{user.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <p className={`font-bold flex items-center gap-0.5 justify-end ${user.isPositive ? "text-green-400" : "text-red-400"}`}>
                        {user.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {user.isPositive ? `+${user.pnlPct}%` : `${user.pnlPct}%`}
                      </p>
                      <p className="text-[9px] text-muted-foreground">${user.valuation.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Sentiment Index */}
            <div className="glass-card p-5 rounded-2xl border border-border space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Community Sentiment</h3>
              <p className="text-[10px] text-muted-foreground">Aggregated index matching user post symbols</p>
              
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold">
                    <span className="text-green-400">Bullish (68%)</span>
                    <span className="text-red-400">Bearish (32%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-500" style={{ width: "68%" }} />
                    <div className="h-full bg-red-500" style={{ width: "32%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
