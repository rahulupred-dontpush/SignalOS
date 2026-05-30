"use client";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SignalTimeline } from "@/components/dashboard/signal-timeline";
import { CompetitorFeed } from "@/components/dashboard/competitor-feed";
import { SignalChart } from "@/components/dashboard/signal-chart";
import { IntentChart } from "@/components/dashboard/intent-chart";
import { InsightsGrid } from "@/components/dashboard/insights-grid";
import { useEffect, useState } from "react";
import { FileText, Radio, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function Dashboard() {
  const [data, setData] = useState<any>({
    signals: [],
    reports: [],
    stats: {
      active_signals: 0,
      tracked_companies: 0,
      reports_generated: 0,
      avg_confidence: "0%"
    }
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/signals").then(res => res.json()),
      fetch("/api/research/history").then(res => res.json()),
      fetch("/api/companies").then(res => res.json())
    ]).then(([signals, reports, companies]) => {
      const signalsArray = Array.isArray(signals) ? signals : [];
      const reportsArray = Array.isArray(reports) ? reports : [];
      const companiesArray = Array.isArray(companies) ? companies : [];

      // Process signals for chart
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const chartData = days.map(day => ({
        day,
        intent: signalsArray.filter((s: any) => format(new Date(s.created_at), "EEE") === day && s.type === "intent").length * 5,
        hiring: signalsArray.filter((s: any) => format(new Date(s.created_at), "EEE") === day && s.type === "hiring").length * 5,
        news: signalsArray.filter((s: any) => format(new Date(s.created_at), "EEE") === day && s.type === "news").length * 5,
      }));

      // Calculate intent index
      const totalSignals = signalsArray.length;
      const intentSignals = signalsArray.filter((s: any) => s.type === "intent" || s.type === "hiring").length;
      const currentScore = totalSignals > 0 ? Math.min(100, Math.round((intentSignals / totalSignals) * 100 + 40)) : 45;

      const intentChartData = [
        { week: "W1", score: Math.max(0, currentScore - 15) },
        { week: "W2", score: Math.max(0, currentScore - 10) },
        { week: "W3", score: Math.max(0, currentScore - 5) },
        { week: "Current", score: currentScore },
      ];

      // Calculate avg confidence from reports
      const totalConfidence = reportsArray.reduce((acc: number, curr: any) => {
        const conf = curr.report_json?.market_signals?.confidence || "low";
        return acc + (conf === "high" ? 95 : conf === "medium" ? 75 : 45);
      }, 0);
      const avgConf = reportsArray.length > 0 
        ? Math.round(totalConfidence / reportsArray.length) + "%" 
        : "0%";

      setData({
        signals: signalsArray,
        reports: reportsArray,
        chartData,
        intentChartData,
        currentScore,
        stats: {
          active_signals: signalsArray.length,
          tracked_companies: companiesArray.length,
          reports_generated: reportsArray.length,
          avg_confidence: avgConf
        }
      });
    });
  }, []);

  return (
    <AppShell title="Dashboard" subtitle="OVERVIEW://revenue intelligence terminal">
      <div className="flex-1 space-y-6 p-8 overflow-y-auto">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Revenue Intelligence
            </h1>
            <p className="text-sm text-white/40">
              Live signals and strategic synthesis for your target accounts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/research"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
            >
              New Research
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active Signals"
            value={data.stats.active_signals.toString()}
            change="+12%"
            trend="up"
            icon={Radio}
          />
          <MetricCard
            label="Tracked Companies"
            value={data.stats.tracked_companies.toString()}
            change="+4"
            trend="up"
            icon={Users}
          />
          <MetricCard
            label="Reports Generated"
            value={data.stats.reports_generated.toString()}
            change="+2"
            trend="up"
            icon={FileText}
          />
          <MetricCard
            label="Avg Confidence"
            value={data.stats.avg_confidence}
            change="Stable"
            trend="up"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <GlassPanel className="p-6">
              <h3 className="text-sm font-medium text-white mb-6">Market Activity Trend</h3>
              <div className="h-80">
                <SignalChart data={data.chartData} />
              </div>
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel className="p-6">
                <h3 className="text-sm font-medium text-white mb-6">Target Intent Scores</h3>
                <div className="h-64">
                  <IntentChart data={data.intentChartData} currentScore={data.currentScore} />
                </div>
              </GlassPanel>
              <GlassPanel className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-sm font-medium text-white">Latest Research Reports</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {data.reports.slice(0, 5).map((r: any) => (
                    <div key={r.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <p className="text-sm font-medium text-white">{r.company}</p>
                      <p className="text-[10px] text-white/30 mt-1 uppercase">
                        {format(new Date(r.created_at), "MMM d, HH:mm")} · Synthesized
                      </p>
                    </div>
                  ))}
                  {data.reports.length === 0 && (
                    <div className="p-8 text-center text-xs text-white/20">No reports yet.</div>
                  )}
                </div>
              </GlassPanel>
            </div>
          </div>

          <div className="space-y-6">
            <GlassPanel className="p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-sm font-medium text-white">Live Signal Feed</h3>
              </div>
              <div className="h-[600px] overflow-y-auto">
                <div className="divide-y divide-white/5">
                  {data.signals.map((s: any) => (
                    <div key={s.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider">{s.type}</span>
                      </div>
                      <p className="text-sm text-white leading-snug">{s.title}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-white/40">{s.company}</span>
                        <span className="text-[10px] text-white/20">{format(new Date(s.created_at), "HH:mm")}</span>
                      </div>
                    </div>
                  ))}
                  {data.signals.length === 0 && (
                    <div className="p-8 text-center text-xs text-white/20">Awaiting signals...</div>
                  )}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
