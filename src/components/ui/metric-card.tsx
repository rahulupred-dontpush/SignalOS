"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  delay?: number;
}

export function MetricCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      className="glass-panel rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs",
                trend === "up" ? "text-accent-emerald" : "text-accent-rose"
              )}
            >
              {trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-accent-cyan/10 p-2">
          <Icon className="h-4 w-4 text-accent-cyan" />
        </div>
      </div>
    </motion.div>
  );
}
