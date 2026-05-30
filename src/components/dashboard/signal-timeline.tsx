"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SignalBadge } from "@/components/ui/signal-badge";

export function SignalTimeline() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/signals")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data.slice(0, 6).map((s: any) => ({
            id: s.id,
            time: format(new Date(s.created_at), "HH:mm"),
            type: s.type,
            company: s.company,
            label: s.title
          })));
        }
      });
  }, []);
  return (
    <GlassPanel className="p-5" delay={0.25}>
      <div className="mb-4">
        <h3 className="text-sm font-medium">Signal Timeline</h3>
        <p className="text-[11px] text-muted font-mono">Real-time event stream</p>
      </div>
      <div className="relative space-y-0">
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan/40 via-accent-violet/20 to-transparent" />
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.04 }}
            className="relative flex gap-4 py-3"
          >
            <div className="relative z-10 flex w-14 shrink-0 flex-col items-end">
              <span className="font-mono text-[11px] text-accent-cyan">{event.time}</span>
            </div>
            <div className="relative z-10 mt-1 h-2 w-2 shrink-0 rounded-full border-2 border-accent-cyan bg-background shadow-[0_0_8px_#22d3ee]" />
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <SignalBadge type={event.type} />
                <span className="text-xs text-muted">{event.company}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">{event.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassPanel>
  );
}
