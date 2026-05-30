"use client";

import { useSyncExternalStore } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassPanel } from "@/components/ui/glass-panel";
const intentScoreData = [
  { week: "Apr 28", score: 68 },
  { week: "May 05", score: 72 },
  { week: "May 12", score: 70 },
  { week: "May 19", score: 84 },
  { week: "May 26", score: 89 },
];

function subscribeToHydration(callback: () => void) {
  const frame = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frame);
}

export function IntentChart({ data = intentScoreData, currentScore = 89 }: { data?: any[], currentScore?: number }) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  return (
    <GlassPanel className="p-5" delay={0.15}>
      <div className="mb-4">
        <h3 className="text-sm font-medium">Market Intent Index</h3>
        <p className="text-[11px] text-muted font-mono">Composite buying signal score</p>
      </div>
      <div className="h-48 min-h-48 w-full min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="week" axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(3, 5, 8, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 3 }}
                activeDot={{ r: 5, fill: "#22d3ee" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg border border-white/8 bg-white/[0.02]" />
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2 border-t border-white/8 pt-3">
        <span className="font-mono text-2xl font-semibold text-accent-violet">{currentScore}</span>
        <span className="text-xs text-muted">current index · {currentScore > 75 ? "elevated" : currentScore > 40 ? "moderate" : "emerging"}</span>
      </div>
    </GlassPanel>
  );
}
