"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
} as any;

export function CompetitorFeed() {
  const [feed, setFeed] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/companies")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeed(data.slice(0, 4).map((c: any) => ({
            id: c.id,
            name: c.name,
            movement: "Monitoring active",
            trend: "stable",
            threatLevel: "MODERATE",
            lastMovement: "Checked 1h ago"
          })));
        }
      });
  }, []);

  return (
    <GlassPanel className="p-5" delay={0.3}>
      <div className="mb-4">
        <h3 className="text-sm font-medium">Competitor Movement</h3>
        <p className="text-[11px] text-muted font-mono">Latest tracked changes</p>
      </div>
      <div className="space-y-3">
        {feed.map((comp, i) => {
          const TrendIcon = trendIcons[comp.trend];
          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              onClick={() => router.push(`/companies/${encodeURIComponent(comp.name)}`)}
              className="flex items-start gap-3 rounded-lg border border-white/6 bg-white/[0.02] p-3 transition-colors hover:border-white/12 cursor-pointer group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-violet/10 font-mono text-xs font-semibold text-accent-violet group-hover:bg-accent-violet/20 transition-colors">
                {comp.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium group-hover:text-accent-cyan transition-colors">{comp.name}</p>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 font-mono text-[10px]",
                      comp.trend === "up" && "text-accent-rose",
                      comp.trend === "down" && "text-accent-emerald",
                      comp.trend === "stable" && "text-muted"
                    )}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {comp.threatLevel}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-foreground/70">{comp.movement}</p>
                <p className="mt-1 font-mono text-[10px] text-muted">{comp.lastMovement}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
