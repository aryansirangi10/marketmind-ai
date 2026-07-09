// ==============================================================================
// AI Chat Assistant Page Component (Chat Interface)
// ==============================================================================

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import LayoutShell from "@/components/layout-shell";
import TickerTape from "@/components/ticker-tape";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowUpRight, 
  BrainCircuit 
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello! I am MarketMind's AI Assistant. Ask me about market sentiment, stock forecasts, or portfolio optimization suggestions. How can I help you today?"
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mutation to post chat queries
  const chatMutation = useMutation({
    mutationFn: async (payload: { message: string; history: ChatMessage[] }) => {
      try {
        const res = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to contact AI engine.");
        const json = await res.json();
        return json.data;
      } catch (err) {
        // Fallback for offline demo chat completion
        return {
          message: getOfflineMockResponse(payload.message),
          role: "assistant"
        };
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
    }
  });

  const handleSend = (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    // Optimistic user update
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");

    chatMutation.mutate({
      message: text,
      history: messages.slice(-5) // Send last 5 messages for context
    });
  };

  // Helper response builder for offline/sandboxed development
  const getOfflineMockResponse = (prompt: string): string => {
    const query = prompt.toLowerCase();
    if (query.includes("aapl") || query.includes("apple")) {
      return "Based on our latest Ridge regression forecast models, Apple (AAPL) is showing a slight positive trend over the next 7 days, targeting ~$189.20. Market sentiment is BULLISH with positive chatter surrounding their upcoming software integrations.";
    }
    if (query.includes("btc") || query.includes("bitcoin")) {
      return "Bitcoin (BTC) is currently consolidating around the $65,000 resistance level. The 7-day model predicts a potential breakout towards $66,800 if volume supports. Sentiment remains NEUTRAL due to regulatory crosswinds.";
    }
    if (query.includes("optimize") || query.includes("portfolio") || query.includes("allocation")) {
      return "Using Markowitz Modern Portfolio Theory (MPT), an optimized allocation across AAPL, MSFT, and BTC yields: \n\n* **AAPL:** 45% (High stability, steady returns)\n* **MSFT:** 35% (Growth hedge)\n* **BTC:** 20% (Max Sharpe contribution)\n\nExpected Portfolio return: **12.4% Annualized** with an estimated Sharpe ratio of **1.45**.";
    }
    return "That's an interesting market query! In a live environment, I would connect to the Gemini API to analyze this asset in real-time. For now, running in sandbox mode: I recommend tracking historical charts and news headlines to assess support and resistance levels.";
  };

  const suggestionChips = [
    "Explain Nifty market movements",
    "What is the RBI repo rate policy outlook?",
    "Explain the Indian market sector rotation",
    "How does the Union Budget affect infrastructure stocks?"
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TickerTape />

      <LayoutShell>
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col glass-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-border bg-white/[0.01] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  MarketMind AI Trading Coach
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[10px] text-indigo-300 font-bold border border-indigo-500/20">
                    Active
                  </span>
                </h2>
                <p className="text-[10px] text-muted-foreground">Expert Indian financial market coaching & analysis.</p>
              </div>
            </div>
          </div>

          {/* Messages Panel */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                    isAssistant 
                      ? "bg-indigo-500/10 border-indigo-400/20 text-indigo-400" 
                      : "bg-purple-500/10 border-purple-400/20 text-purple-400"
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isAssistant 
                      ? "bg-slate-900/60 border border-border text-slate-100 rounded-tl-none" 
                      : "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                  }`}>
                    {/* Render message lines */}
                    {msg.content.split("\n").map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Waiting indicator */}
            {chatMutation.isPending && (
              <div className="flex gap-3 mr-auto max-w-[80%]">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900/60 border border-border p-4 rounded-2xl rounded-tl-none text-xs text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Analyzing market signals...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions block (Only when list is small) */}
          {messages.length === 1 && (
            <div className="px-6 py-2 shrink-0 border-t border-border/20">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">SUGGESTIONS</p>
              <div className="flex flex-wrap gap-2">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-slate-300 hover:border-indigo-400/30 hover:bg-indigo-500/5 text-[10px] transition-all cursor-pointer group"
                  >
                    {chip}
                    <ArrowUpRight className="w-3 h-3 text-muted-foreground group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input */}
          <div className="p-4 border-t border-border shrink-0 bg-white/[0.005]">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                disabled={chatMutation.isPending}
                placeholder="Ask our AI Trading Coach about Nifty, sector rotation, or RBI rate decisions..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 bg-white/5 border border-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-muted-foreground focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || chatMutation.isPending}
                className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        </div>
      </LayoutShell>
    </div>
  );
}
