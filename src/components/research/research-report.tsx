"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { GTMIntelligenceReport } from "@/lib/research-types";
import { cn } from "@/lib/utils";

interface ResearchReportViewProps {
  report: GTMIntelligenceReport;
  onNewResearch: () => void;
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "high" | "medium" | "low" | "immediate" | "short-term" | "long-term";
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        variant === "default" && "border-white/15 text-white/50",
        (variant === "high" || variant === "immediate") && "border-white/30 text-white",
        (variant === "medium" || variant === "short-term") && "border-white/20 text-white/70",
        (variant === "low" || variant === "long-term") && "border-white/10 text-white/40"
      )}
    >
      {children}
    </span>
  );
}

function ExpandableSection({
  id,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section id={id} className="border-b border-white/[0.06] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-4 py-6 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-sm font-medium tracking-tight text-white">{title}</h2>
          {subtitle && !open && (
            <p className="mt-1 line-clamp-1 text-sm text-white/35">{subtitle}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-white/30 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-8 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-white/65">{children}</p>;
}

export function ResearchReportView({ report, onNewResearch }: ResearchReportViewProps) {
  const generatedDate = new Date(report.generated_at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl px-6 pb-24 pt-8"
    >
      <header className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
            GTM Intelligence Report
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-white sm:text-4xl">
            {report.company}
          </h1>
          <p className="mt-3 font-mono text-[11px] text-white/25">
            AI synthesis · {generatedDate}
          </p>
        </div>
        <button
          type="button"
          onClick={onNewResearch}
          className="shrink-0 self-start rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          New research
        </button>
      </header>

      <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
          Executive Summary
        </p>
        <div className="mt-4">
          <Prose>{report.executive_summary}</Prose>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] px-5">
        <ExpandableSection
          id="competitors"
          title="Competitor Landscape"
          subtitle={report.competitor_landscape.summary}
          defaultOpen
        >
          <Prose>{report.competitor_landscape.summary}</Prose>
          <ul className="mt-6 space-y-5">
            {report.competitor_landscape.competitors.map((c, i) => (
              <li key={`${c.name}-${i}`} className="border-t border-white/[0.06] pt-5 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-white">{c.name}</h3>
                  <Badge variant={c.threat_level}>{c.threat_level} threat</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.analysis}</p>
                {c.recent_moves.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {c.recent_moves.map((move, mi) => (
                      <li key={`${move}-${mi}`} className="flex gap-2 text-sm text-white/45">
                        <span className="text-white/20">—</span>
                        {move}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </ExpandableSection>

        {report.social_intelligence && (
          <ExpandableSection
            id="social"
            title="Social Intelligence"
            subtitle={report.social_intelligence.summary}
          >
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-lg bg-white/[0.03] p-4 border border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">Sentiment</p>
                <Badge variant={report.social_intelligence.sentiment === "positive" ? "high" : report.social_intelligence.sentiment === "negative" ? "low" : "medium"}>
                  {report.social_intelligence.sentiment}
                </Badge>
              </div>
              <Prose>{report.social_intelligence.summary}</Prose>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.social_intelligence.signals.map((s, i) => (
                <li key={`${s.platform}-${i}`} className="rounded-lg border border-white/[0.06] p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-widest">{s.platform}</span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{s.insight}</p>
                </li>
              ))}
            </ul>
          </ExpandableSection>
        )}

        <ExpandableSection
          id="hiring"
          title="Hiring Activity"
          subtitle={report.hiring_activity.summary}
        >
          <Prose>{report.hiring_activity.summary}</Prose>
          <ul className="mt-6 space-y-4">
            {report.hiring_activity.signals.map((s, i) => (
              <li key={`${s.title}-${i}`} className="rounded-lg border border-white/[0.06] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-white">{s.title}</h3>
                  <Badge variant={s.urgency}>{s.urgency}</Badge>
                </div>
                <p className="mt-2 text-sm text-white/50">{s.insight}</p>
              </li>
            ))}
          </ul>
        </ExpandableSection>

        <ExpandableSection
          id="products"
          title="Product Activity"
          subtitle={report.product_activity.summary}
        >
          <Prose>{report.product_activity.summary}</Prose>
          <ul className="mt-6 space-y-4">
            {report.product_activity.launches.map((l, i) => (
              <li key={`${l.title}-${i}`} className="border-l-2 border-white/20 pl-4">
                <h3 className="text-sm font-medium text-white">{l.title}</h3>
                <p className="mt-1 text-sm text-white/50">{l.impact}</p>
                <p className="mt-2 font-mono text-[11px] text-white/30">{l.timing}</p>
              </li>
            ))}
          </ul>
        </ExpandableSection>

        <ExpandableSection
          id="market"
          title="Market Signals"
          subtitle={report.market_signals.summary}
        >
          <Prose>{report.market_signals.summary}</Prose>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/30">Trends</p>
              <ul className="mt-3 space-y-3">
                {report.market_signals.trends.map((t, i) => (
                  <li key={`${t.signal}-${i}`} className="rounded-lg bg-white/[0.02] p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{t.signal}</span>
                      <Badge>{t.strength}</Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-white/50">{t.implication}</p>
                  </li>
                ))}
              </ul>
            </div>
            {report.market_signals.buying_intent.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/30">
                  Buying Intent
                </p>
                <ul className="mt-3 space-y-3">
                  {report.market_signals.buying_intent.map((b, i) => (
                    <li key={`${b.signal}-${i}`} className="flex gap-4 border-t border-white/[0.06] pt-3">
                      <Badge variant={b.score}>{b.score}</Badge>
                      <div>
                        <p className="text-sm font-medium text-white">{b.signal}</p>
                        <p className="mt-1 text-sm text-white/45">{b.evidence}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ExpandableSection>

        <ExpandableSection
          id="risks"
          title="Risks"
          subtitle={
            report.risks[0]
              ? `${report.risks[0].title} · ${report.risks.length} identified`
              : undefined
          }
        >
          <ul className="space-y-4">
            {report.risks.map((r, i) => (
              <li key={`${r.title}-${i}`} className="rounded-lg border border-white/[0.08] p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">{r.title}</h3>
                  <Badge variant={r.severity}>{r.severity}</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{r.description}</p>
              </li>
            ))}
          </ul>
        </ExpandableSection>

        <ExpandableSection
          id="opportunities"
          title="Opportunities"
          subtitle={
            report.opportunities[0]
              ? `${report.opportunities[0].title} · ${report.opportunities.length} identified`
              : undefined
          }
        >
          <ul className="space-y-4">
            {report.opportunities.map((o, i) => (
              <li key={`${o.title}-${i}`} className="rounded-lg border border-white/[0.08] p-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-white">{o.title}</h3>
                  <Badge variant={o.potential}>{o.potential} potential</Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{o.description}</p>
              </li>
            ))}
          </ul>
        </ExpandableSection>

        <ExpandableSection
          id="actions"
          title="Recommended Actions"
          subtitle={
            report.recommended_actions[0]
              ? report.recommended_actions[0].action
              : undefined
          }
          defaultOpen
        >
          <ol className="space-y-5">
            {report.recommended_actions.map((a, i) => (
              <li key={`${a.action}-${i}`} className="flex gap-4">
                <span className="font-mono text-sm text-white/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-white">{a.action}</p>
                    <Badge variant={a.priority}>{a.priority}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm text-white/45">{a.rationale}</p>
                </div>
              </li>
            ))}
          </ol>
        </ExpandableSection>
      </div>

      <footer className="mt-12 font-mono text-[11px] text-white/20">
        SignalOS · AI-generated GTM intelligence · Not raw search output
      </footer>
    </motion.article>
  );
}
