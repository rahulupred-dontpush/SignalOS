"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ResearchShell } from "@/components/research/research-shell";
import { ResearchError } from "@/components/research/research-error";
import { ResearchReportView } from "@/components/research/research-report";
import { ResearchSearch } from "@/components/research/research-search";
import { ResearchWorkflow } from "@/components/research/research-workflow";
import type { GTMIntelligenceReport, ResearchErrorResponse } from "@/lib/research-types";

type Phase = "idle" | "workflow" | "report" | "error";

async function fetchResearch(
  company: string,
  signal?: AbortSignal
): Promise<GTMIntelligenceReport> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ company }),
    signal,
  });

  const payload = (await response.json()) as GTMIntelligenceReport | ResearchErrorResponse;

  if (!response.ok) {
    throw new Error("error" in payload ? payload.error : "Research request failed");
  }

  return payload as GTMIntelligenceReport;
}

export default function ResearchPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [report, setReport] = useState<GTMIntelligenceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchDone, setFetchDone] = useState(false);
  const [workflowDone, setWorkflowDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setPhase("idle");
    setReport(null);
    setError(null);
    setFetchDone(false);
    setWorkflowDone(false);
    setQuery("");
  }, []);

  const runResearch = useCallback(
    async (company: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setReport(null);
      setError(null);
      setFetchDone(false);
      setWorkflowDone(false);
      setPhase("workflow");

      try {
        const result = await fetchResearch(company, controller.signal);
        if (controller.signal.aborted) return;
        setReport(result);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Research failed");
      } finally {
        if (!controller.signal.aborted) {
          setFetchDone(true);
        }
      }
    },
    []
  );

  const startResearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    void runResearch(trimmed);
  }, [query, runResearch]);

  const finishWorkflow = useCallback(() => {
    setWorkflowDone(true);
  }, []);

  useEffect(() => {
    if (!fetchDone || !workflowDone) return;
    if (error) {
      setPhase("error");
    } else if (report) {
      setPhase("report");
    }
  }, [fetchDone, workflowDone, error, report]);

  const isCentered = phase === "idle" || phase === "workflow" || phase === "error";

  return (
    <ResearchShell minimal={phase === "report"}>
      <div
        className={
          isCentered
            ? "flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center"
            : ""
        }
      >
        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <motion.div
              key="search"
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <ResearchSearch
                query={query}
                onQueryChange={setQuery}
                onSubmit={startResearch}
              />
            </motion.div>
          )}

          {phase === "workflow" && (
            <motion.div
              key="workflow"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <ResearchWorkflow
                company={query.trim()}
                onComplete={finishWorkflow}
                waitingForData={fetchDone === false && workflowDone}
              />
            </motion.div>
          )}

          {phase === "error" && error && (
            <motion.div key="error" className="w-full">
              <ResearchError
                message={error}
                onRetry={() => runResearch(query.trim())}
                onNewSearch={reset}
              />
            </motion.div>
          )}

          {phase === "report" && report && (
            <motion.div key="report" className="w-full">
              <ResearchReportView report={report} onNewResearch={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ResearchShell>
  );
}
