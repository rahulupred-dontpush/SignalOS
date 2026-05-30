"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Radio, Globe, ExternalLink, Shield, Zap, Search } from "lucide-react";
import { format } from "date-fns";

interface Signal {
  id: string;
  company: string;
  type: string;
  title: string;
  source: string;
  link: string | null;
  confidence: string;
  created_at: string;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/signals")
      .then((res) => res.json())
      .then((data) => {
        setSignals(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell title="Signals" subtitle="STREAM://real-time intelligence feed">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-white">Market Signals</h1>
          <p className="mt-1 text-sm text-white/40">Real-time intelligence feed derived from deep-site monitoring and web research</p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-white/10 text-sm font-mono">
            Scanning 247 sources...
          </div>
        ) : signals.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-white/20">
            <Radio className="mb-4 h-10 w-10 opacity-20" />
            <p>No signals detected yet. Run research to generate signals.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {signals.map((s) => (
              <GlassPanel key={s.id} className="flex items-center gap-6 p-4 transition-all hover:bg-white/[0.04]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/10">
                  {s.type === "hiring" ? <Zap className="h-5 w-5 text-accent-cyan" /> : 
                   s.type === "product" ? <Shield className="h-5 w-5 text-accent-cyan" /> : 
                   <Globe className="h-5 w-5 text-accent-cyan" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-medium text-white truncate">{s.title}</h3>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/40 uppercase">
                      {s.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span className="font-medium text-accent-cyan/60">{s.company}</span>
                    <span>{s.source}</span>
                    <span>{format(new Date(s.created_at), "MMM d, HH:mm")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 pr-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Confidence</p>
                    <p className="text-xs font-mono text-white/60">{s.confidence}</p>
                  </div>
                  {s.link && (
                    <a 
                      href={s.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
