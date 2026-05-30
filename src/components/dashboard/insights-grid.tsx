"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { LucideIcon } from "lucide-react";

interface Insight {
  id: string;
  title: string;
  summary: string;
  impact: "opportunity" | "risk" | "neutral";
  company: string;
  type: string;
  confidence: number;
}

const impactConfig: Record<Insight["impact"], { icon: LucideIcon; color: string; border: string; bg: string }> = {
  opportunity: {
    icon: Lightbulb,
    color: "text-accent-emerald",
    border: "border-accent-emerald/20",
    bg: "bg-accent-emerald/5",
  },
  risk: {
    icon: AlertTriangle,
    color: "text-accent-rose",
    border: "border-accent-rose/20",
    bg: "bg-accent-rose/5",
  },
  neutral: {
    icon: Minus,
    color: "text-accent-amber",
    border: "border-accent-amber/20",
    bg: "bg-accent-amber/5",
  },
};

export function InsightsGrid() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/signals")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInsights(data.slice(0, 4).map((s) => ({
            id: s.id,
            title: s.title,
            summary: `Detected via ${s.source}. Confidence level ${s.confidence}.`,
            impact: s.type === "hiring" ? "opportunity" : s.type === "product" ? "risk" : "neutral",
            company: s.company,
            type: s.type,
            confidence: 85
          })));
        }
      });
  }, []);
  return (
    <GlassPanel className="p-5" delay={0.2}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">AI Insights</h3>
          <p className="text-[11px] text-muted font-mono">Generated · last 15 min</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-accent-cyan">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-cyan" />
          Live analysis
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((insight, i) => {
          const config = impactConfig[insight.impact];
          const Icon = config.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className={cn(
                "rounded-lg border p-4",
                config.border,
                config.bg
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{insight.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">
                    {insight.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => router.push(`/companies/${encodeURIComponent(insight.company)}`)}
                      className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {insight.company}
                    </button>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted">
                      {insight.type}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-muted">
                      {insight.confidence}% conf.
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
