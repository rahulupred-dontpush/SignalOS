"use client";

import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

import { LucideIcon } from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: "weekly" | "competitive" | "market" | "account";
  status: "ready" | "generating" | "draft";
  createdAt: string;
  pages: number;
}

const typeLabels: Record<Report["type"], { label: string; color: string }> = {
  weekly: { label: "Weekly Brief", color: "text-accent-cyan" },
  competitive: { label: "Competitive", color: "text-accent-violet" },
  market: { label: "Market", color: "text-accent-emerald" },
  account: { label: "Account", color: "text-accent-amber" },
};

const statusConfig: Record<Report["status"], { label: string; icon: LucideIcon; color: string }> = {
  ready: { label: "Ready", icon: FileText, color: "text-accent-emerald" },
  generating: { label: "Generating", icon: Loader2, color: "text-accent-cyan" },
  draft: { label: "Draft", icon: FileText, color: "text-muted" },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    fetch("/api/research/history")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data.map((r) => ({
            id: r.id,
            title: `${r.company} Strategic Synthesis`,
            type: "account",
            status: "ready",
            createdAt: new Date(r.created_at).toLocaleDateString(),
            pages: 4
          })));
        }
      });
  }, []);
  return (
    <AppShell
      title="Reports"
      subtitle="ARCHIVE://intelligence briefs · export ready"
    >
      <div className="space-y-6">
        <GlassPanel className="p-6" glow>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-violet/20 p-2">
                <Sparkles className="h-5 w-5 text-accent-violet" />
              </div>
              <div>
                <h2 className="text-base font-medium">Generate Intelligence Report</h2>
                <p className="text-xs text-muted">
                  AI compiles signals, competitor data, and market trends into a brief
                </p>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl bg-accent-violet/90 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              New Report
            </button>
          </div>
        </GlassPanel>

        <div className="grid gap-3">
          {reports.map((report, i) => {
            const type = typeLabels[report.type];
            const status = statusConfig[report.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassPanel className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <FileText className="h-5 w-5 text-foreground/60" />
                      </div>
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3">
                          <span className={cn("font-mono text-[10px] uppercase", type.color)}>
                            {type.label}
                          </span>
                          <span className="font-mono text-[10px] text-muted">
                            {report.createdAt}
                          </span>
                          {report.pages > 0 && (
                            <span className="font-mono text-[10px] text-muted">
                              {report.pages} pages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 font-mono text-[10px] uppercase",
                          status.color
                        )}
                      >
                        <StatusIcon
                          className={cn(
                            "h-3 w-3",
                            report.status === "generating" && "animate-spin"
                          )}
                        />
                        {status.label}
                      </span>
                      {report.status === "ready" && (
                        <button
                          type="button"
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs transition-colors hover:border-accent-cyan/30 hover:text-accent-cyan"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export
                        </button>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
