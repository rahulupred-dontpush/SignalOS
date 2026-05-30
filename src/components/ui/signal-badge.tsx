import { cn } from "@/lib/utils";
import type { SignalType } from "@/lib/research-types";

const typeStyles: Record<SignalType, string> = {
  hiring: "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30",
  funding: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
  product: "bg-accent-violet/15 text-accent-violet border-accent-violet/30",
  intent: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
  news: "bg-white/10 text-foreground/80 border-white/20",
  leadership: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
};

const severityStyles = {
  low: "border-white/10",
  medium: "border-accent-amber/40",
  high: "border-accent-cyan/40",
  critical: "border-accent-rose/50 shadow-[0_0_12px_rgba(251,113,133,0.15)]",
};

interface SignalBadgeProps {
  type: SignalType;
  severity?: "low" | "medium" | "high" | "critical";
  className?: string;
}

export function SignalBadge({ type, severity, className }: SignalBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        typeStyles[type],
        severity && severityStyles[severity],
        className
      )}
    >
      {type}
    </span>
  );
}
