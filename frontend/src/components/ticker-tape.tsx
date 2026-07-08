// ==============================================================================
// Ticker Tape Component (Market Banner ticker)
// ==============================================================================

"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: "STOCK" | "CRYPTO";
}

export default function TickerTape() {
  const [tickers, setTickers] = useState<TickerData[]>([
    { symbol: "BTC", price: 65240.50, change: 480.20, changePercent: 0.74, type: "CRYPTO" },
    { symbol: "ETH", price: 3512.80, change: -45.60, changePercent: -1.28, type: "CRYPTO" },
    { symbol: "AAPL", price: 185.74, change: 1.24, changePercent: 0.67, type: "STOCK" },
    { symbol: "MSFT", price: 420.45, change: -2.35, changePercent: -0.56, type: "STOCK" },
    { symbol: "NVDA", price: 887.20, change: 12.80, changePercent: 1.46, type: "STOCK" },
    { symbol: "SOL", price: 146.35, change: 5.40, changePercent: 3.83, type: "CRYPTO" },
    { symbol: "TSLA", price: 178.60, change: -0.90, changePercent: -0.50, type: "STOCK" }
  ]);

  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";
    let socket: any = null;

    try {
      const io = require("socket.io-client").io;
      socket = io(socketUrl, { 
        transports: ["websocket"],
        reconnectionAttempts: 3
      });

      socket.on("price_ticks", (ticks: Array<{ symbol: string; price: number }>) => {
        setTickers(prev => 
          prev.map(t => {
            const match = ticks.find(tick => tick.symbol === t.symbol);
            if (!match) return t;

            const direction = match.price > t.price ? 1 : -1;
            const newPrice = Number(match.price.toFixed(2));
            const changeValue = newPrice - t.price;
            const newChange = Number((t.change + changeValue).toFixed(2));
            const newChangePercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));

            // Trigger flash animation
            setFlashStates(f => ({
              ...f,
              [t.symbol]: direction > 0 ? "up" : "down"
            }));

            // Clear flash state after 1 sec
            setTimeout(() => {
              setFlashStates(f => ({
                ...f,
                [t.symbol]: null
              }));
            }, 800);

            return {
              ...t,
              price: newPrice,
              change: newChange,
              changePercent: newChangePercent
            };
          })
        );
      });
    } catch (err) {
      console.warn("[WebSocket] Failed to start socket client, falling back to local simulation.", err);
    }

    // Fallback simulation interval in case socket is offline
    const interval = setInterval(() => {
      if (socket && socket.connected) return;

      setTickers(prev => 
        prev.map(t => {
          const volatility = t.type === "CRYPTO" ? 0.005 : 0.002;
          const direction = Math.random() > 0.48 ? 1 : -1; // slight upward bias
          const changeValue = t.price * volatility * Math.random() * direction;
          const newPrice = Number((t.price + changeValue).toFixed(2));
          const newChange = Number((t.change + changeValue).toFixed(2));
          const newChangePercent = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));

          // Trigger flash animation
          setFlashStates(f => ({
            ...f,
            [t.symbol]: direction > 0 ? "up" : "down"
          }));

          // Clear flash state after 1 sec
          setTimeout(() => {
            setFlashStates(f => ({
              ...f,
              [t.symbol]: null
            }));
          }, 800);

          return {
            ...t,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent
          };
        })
      );
    }, 6000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="w-full overflow-hidden glass-panel border-b border-border h-12 flex items-center select-none py-1.5 shrink-0">
      <div className="flex whitespace-nowrap animate-ticker divide-x divide-border/40">
        {/* Render twice for seamless looping if needed, or simple scroll block */}
        <div className="flex gap-8 items-center px-4">
          {tickers.map((t) => {
            const isPositive = t.change >= 0;
            const flash = flashStates[t.symbol];
            
            let bgFlash = "";
            if (flash === "up") bgFlash = "bg-green-500/10 border-green-500/20";
            else if (flash === "down") bgFlash = "bg-red-500/10 border-red-500/20";

            return (
              <div 
                key={t.symbol}
                className={`flex items-center gap-2.5 px-3 py-1 border border-transparent rounded-lg transition-all duration-300 ${bgFlash}`}
              >
                <span className="font-bold text-xs text-white">{t.symbol}</span>
                <span className="font-mono text-xs text-slate-200">
                  ${t.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className={`flex items-center text-[10px] font-semibold ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {isPositive ? "+" : ""}{t.changePercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
