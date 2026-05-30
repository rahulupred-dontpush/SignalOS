"use client";

import { useEffect, useState } from "react";
import { ResearchShell } from "@/components/research/research-shell";
import { ResearchReportView } from "@/components/research/research-report";
import { format } from "date-fns";
import { Search, Clock, FileText, ExternalLink } from "lucide-react";
import { GTMIntelligenceReport } from "@/lib/research-types";
import { useRouter } from "next/navigation";

interface HistoricalReport {
  id: string;
  company: string;
  report_json: GTMIntelligenceReport;
  created_at: string;
}

export default function ResearchHistoryPage() {
  const [reports, setReports] = useState<HistoricalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<GTMIntelligenceReport | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/research/history")
      .then((res) => res.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) =>
    r.company.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedReport) {
    return (
      <ResearchShell minimal>
        <div className="p-6">
          <button
            onClick={() => setSelectedReport(null)}
            className="mb-6 flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            ← Back to history
          </button>
          <ResearchReportView report={selectedReport} onNewResearch={() => setSelectedReport(null)} />
        </div>
      </ResearchShell>
    );
  }

  return (
    <ResearchShell>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-white">Research History</h1>
            <p className="mt-1 text-sm text-white/40">Access and review previous strategic synthesis</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-white outline-none focus:border-white/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-white/20">
            <Clock className="mr-2 h-5 w-5 animate-spin" />
            Loading history...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-white/20">
            <FileText className="mb-4 h-10 w-10 opacity-20" />
            <p>No reports found.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((report) => (
              <div
                key={report.id}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <button
                  onClick={() => setSelectedReport(report.report_json)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-medium text-white group-hover:text-accent-cyan transition-colors">
                    {report.company}
                  </h3>
                  <p className="mt-1 text-xs text-white/30">
                    {format(new Date(report.created_at), "MMM d, yyyy · HH:mm")}
                  </p>
                </button>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5">
                    {report.report_json.market_signals?.confidence || "low"} confidence
                  </span>
                  <button
                    onClick={() => router.push(`/companies/${encodeURIComponent(report.company)}`)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                    title="View Company Profile"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <FileText className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ResearchShell>
  );
}
