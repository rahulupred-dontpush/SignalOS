"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { ResearchReportView } from "@/components/research/research-report";
import { Building2, Globe, Users, Zap, Shield, Radio, ExternalLink, Play, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { GTMIntelligenceReport } from "@/lib/research-types";
import { cn } from "@/lib/utils";
import { MarketSignal, ResearchReport } from "@prisma/client";

interface HistoricalReport extends Omit<ResearchReport, "report_json"> {
  report_json: GTMIntelligenceReport;
}

export default function CompanyIntelligencePage() {
  const params = useParams();
  const companyName = decodeURIComponent(params.company as string);
  
  const [report, setReport] = useState<GTMIntelligenceReport | null>(null);
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [stats, setStats] = useState<{ reportCount: number; lastResearched: string | Date }>({ 
    reportCount: 0, 
    lastResearched: "" 
  });
  const [loading, setLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, signalsRes] = await Promise.all([
        fetch("/api/research/history"),
        fetch("/api/signals")
      ]);
      
      const history = historyRes.ok ? await historyRes.json() : [];
      const allSignals = signalsRes.ok ? await signalsRes.json() : [];
      
      const historyArray = (Array.isArray(history) ? history : []) as HistoricalReport[];
      const signalsArray = (Array.isArray(allSignals) ? allSignals : []) as MarketSignal[];
      
      const companyReports = historyArray.filter((r) => 
        r.company?.toLowerCase() === companyName.toLowerCase()
      );
      const companySignals = signalsArray.filter((s) => 
        s.company?.toLowerCase() === companyName.toLowerCase()
      );
      
      if (companyReports.length > 0) {
        setReport(companyReports[0].report_json || null);
        setStats({
          reportCount: companyReports.length,
          lastResearched: companyReports[0].created_at || ""
        });
      } else {
        setReport(null);
        setStats({ reportCount: 0, lastResearched: "" });
      }
      setSignals(companySignals);
    } catch (e) {
      console.error("[Company Intelligence] Fetch Error:", e);
      setReport(null);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyName]);

  const runResearch = async () => {
    setIsResearching(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResearching(false);
    }
  };

  if (loading) {
    return (
      <AppShell title={companyName} subtitle="INTELLIGENCE://loading data">
        <div className="flex h-[calc(100vh-10rem)] items-center justify-center text-white/20 font-mono">
          <Zap className="mr-2 h-5 w-5 animate-pulse text-accent-cyan" />
          Synchronizing intelligence nodes...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={companyName} subtitle="INTELLIGENCE://account detail">
      <div className="mx-auto max-w-7xl p-8">
        <header className="relative z-10 mb-10 flex items-start justify-between">
          <div className="flex gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
              <Building2 className="h-10 w-10 text-accent-cyan" />
            </div>
            <div>
              <h1 className="text-4xl font-medium text-white tracking-tight">{companyName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {report?.enrichment?.industry || "Enterprise Tech"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {report?.enrichment?.size || "10,000+ employees"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  {report?.enrichment?.hq || "Global Headquarters"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Last Research: {stats.lastResearched ? format(new Date(stats.lastResearched), "MMM d, yyyy") : "Never"}
                </div>
              </div>
              { report?.enrichment?.description && (
                <p className="mt-4 text-sm text-white/60 max-w-2xl leading-relaxed">
                  {report.enrichment.description}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={runResearch}
            disabled={isResearching}
            className="relative z-20 flex items-center gap-2 rounded-xl bg-accent-cyan px-6 py-3 text-sm font-semibold text-black hover:bg-accent-cyan/90 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50"
          >
            {isResearching ? (
              <>
                <Zap className="h-4 w-4 animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run Intelligence Scan</span>
              </>
            )}
          </button>
        </header>

        {(!report || Object.keys(report).length === 0) ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
            <Radio className="mb-6 h-16 w-16 text-white/10 animate-pulse" />
            <h2 className="text-xl font-medium text-white/80">Intelligence Void Detected</h2>
            <p className="mt-2 text-white/40 text-center max-w-md">No strategic reports exist for {companyName}. Start a new intelligence scan to generate GTM insights.</p>
            <button
              onClick={runResearch}
              className="mt-8 rounded-lg border border-white/20 px-6 py-2 text-sm text-white hover:bg-white/5 transition-colors"
            >
              Initialize Onboarding
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <ResearchReportView report={report} onNewResearch={runResearch} />
            </div>
            
            <div className="space-y-6">
              <GlassPanel className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-accent-cyan" />
                  Buying Intent
                </h3>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-medium text-white">
                      {report.market_signals?.buying_intent?.[0]?.score || "Medium"}
                    </p>
                    <p className="text-[10px] text-white/30 uppercase mt-1">
                      Confidence: {report.market_signals?.confidence || "Medium"}
                    </p>
                  </div>
                  <div className={cn(
                    "h-10 w-1 rounded-full",
                    (report.market_signals?.buying_intent?.[0]?.score || "Medium").toLowerCase() === "high" ? "bg-accent-emerald shadow-[0_0_10px_#10b981]" :
                    (report.market_signals?.buying_intent?.[0]?.score || "Medium").toLowerCase() === "medium" ? "bg-accent-cyan shadow-[0_0_10px_#22d3ee]" :
                    "bg-accent-rose shadow-[0_0_10px_#f43f5e]"
                  )} />
                </div>
                <div className="mt-6 space-y-3">
                  {(report.market_signals?.buying_intent || []).slice(0, 3).map((intent, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-white/40 truncate pr-2">{intent.signal}</span>
                      <span className={cn(
                        "font-medium shrink-0",
                        intent.score.toLowerCase() === "high" ? "text-accent-emerald" :
                        intent.score.toLowerCase() === "medium" ? "text-accent-cyan" :
                        "text-accent-rose"
                      )}>{intent.score}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>

              <GlassPanel className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Recent Signals</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto divide-y divide-white/5">
                  {(signals || []).map((s) => (
                    <div key={s.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan group-hover:shadow-[0_0_8px_#22d3ee] transition-all" />
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider">{s.type}</span>
                      </div>
                      <p className="text-xs text-white leading-relaxed line-clamp-2">{s.title}</p>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-white/20 font-mono">
                        <span>{s.created_at ? format(new Date(s.created_at), "MMM d") : "Today"}</span>
                        {s.link && <ExternalLink className="h-3 w-3" />}
                      </div>
                    </div>
                  ))}
                  {(!signals || signals.length === 0) && (
                    <div className="p-8 text-center text-xs text-white/20">No signals recorded.</div>
                  )}
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 bg-accent-cyan/5 border-accent-cyan/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent-cyan mb-2">System Insight</p>
                <p className="text-xs text-white/70 leading-relaxed italic">
                  "The rapid succession of hiring signals in the EMEA region suggests an imminent launch of a localized sales hub."
                </p>
              </GlassPanel>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
