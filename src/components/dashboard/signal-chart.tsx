"use client";

import { useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassPanel } from "@/components/ui/glass-panel";
const signalVolumeData = [
  { day: "Mon", intent: 45, hiring: 32, news: 12 },
  { day: "Tue", intent: 52, hiring: 38, news: 18 },
  { day: "Wed", intent: 48, hiring: 45, news: 22 },
  { day: "Thu", intent: 61, hiring: 42, news: 15 },
  { day: "Fri", intent: 55, hiring: 35, news: 28 },
  { day: "Sat", intent: 32, hiring: 20, news: 10 },
  { day: "Sun", intent: 28, hiring: 15, news: 8 },
];

function subscribeToHydration(callback: () => void) {
  const frame = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(frame);
}

export function SignalChart({ data = signalVolumeData }: { data?: any[] }) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );

  return (
    <GlassPanel className="p-5" delay={0.1}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Signal Volume</h3>
          <p className="text-[11px] text-muted font-mono">Aggregation by type</p>
        </div>
      </div>
      <div className="h-64 min-h-64 w-full min-w-0">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hiringGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgba(3, 5, 8, 0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                iconType="circle"
                iconSize={6}
              />
              <Area
                type="monotone"
                dataKey="intent"
                stroke="#22d3ee"
                fill="url(#intentGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="hiring"
                stroke="#34d399"
                fill="url(#hiringGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="news"
                stroke="#8b5cf6"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full rounded-lg border border-white/8 bg-white/[0.02]" />
        )}
      </div>
    </GlassPanel>
  );
}
