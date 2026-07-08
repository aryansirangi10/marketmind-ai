// ==============================================================================
// Economic Calendar Widget Component
// ==============================================================================

import React from "react";
import { Calendar, AlertCircle } from "lucide-react";

interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  event: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  previous: string;
  consensus: string;
}

export default function EconomicCalendar() {
  const events: EconomicEvent[] = [
    { id: "1", time: "18:00", country: "US", event: "CPI Inflation MoM (Jun)", impact: "HIGH", previous: "0.0%", consensus: "0.1%" },
    { id: "2", time: "21:30", country: "US", event: "Fed Interest Rate Decision", impact: "HIGH", previous: "5.50%", consensus: "5.50%" },
    { id: "3", time: "12:15", country: "EU", event: "ECB Deposit Facility Rate", impact: "MEDIUM", previous: "3.75%", consensus: "3.75%" },
    { id: "4", time: "06:00", country: "IN", event: "RBI Interest Rate Decision", impact: "MEDIUM", previous: "6.50%", consensus: "6.50%" }
  ];

  return (
    <div className="glass-card p-5 rounded-2xl border border-border h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-indigo-400" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Economic Calendar</h4>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center justify-between text-xs border-b border-border/30 pb-2.5 last:border-0 last:pb-0">
            <div className="space-y-0.5 max-w-[65%]">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-border text-[9px] font-bold text-muted-foreground">
                  {ev.country}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded ${
                  ev.impact === "HIGH" 
                    ? "bg-red-500/10 text-red-400 border border-red-400/10" 
                    : ev.impact === "MEDIUM" 
                    ? "bg-amber-500/10 text-amber-400 border border-amber-400/10"
                    : "bg-slate-500/10 text-muted-foreground border border-border"
                }`}>
                  {ev.impact}
                </span>
              </div>
              <p className="text-white font-medium truncate">{ev.event}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground font-semibold">{ev.time}</p>
              <p className="text-[10px] font-mono mt-0.5">
                Cons: <span className="text-indigo-300 font-semibold">{ev.consensus}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
