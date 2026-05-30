"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { RESEARCH_WORKFLOW_STEPS } from "@/lib/research-data";
import { cn } from "@/lib/utils";

const STEP_DURATION_MS = 900;

interface ResearchWorkflowProps {
  company: string;
  onComplete: () => void;
  waitingForData?: boolean;
}

export function ResearchWorkflow({
  company,
  onComplete,
  waitingForData = false,
}: ResearchWorkflowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (activeIndex >= RESEARCH_WORKFLOW_STEPS.length) {
      const t = setTimeout(() => onCompleteRef.current(), 400);
      return () => clearTimeout(t);
    }

    const timer = setTimeout(() => {
      setCompleted((prev) => [...prev, activeIndex]);
      setActiveIndex((i) => i + 1);
    }, STEP_DURATION_MS);

    return () => clearTimeout(timer);
  }, [activeIndex]);

  const progress =
    ((completed.length + (activeIndex < RESEARCH_WORKFLOW_STEPS.length ? 0.35 : 0)) /
      RESEARCH_WORKFLOW_STEPS.length) *
    100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mx-auto w-full max-w-lg px-6"
    >
      <p className="text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        Research in progress
      </p>
      <h2 className="mt-2 text-center text-xl font-medium tracking-tight text-white">
        {company}
      </h2>

      <div className="mt-10 h-px w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      <ul className="mt-10 space-y-1">
        {RESEARCH_WORKFLOW_STEPS.map((step, index) => {
          const isDone = completed.includes(index);
          const isActive = activeIndex === index && !isDone;
          const isPending = index > activeIndex;

          return (
            <motion.li
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-3 transition-colors",
                isActive && "bg-white/[0.04]",
                isPending && "opacity-30"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
                  isDone && "border-white bg-white text-black",
                  isActive && "border-white/40",
                  isPending && "border-white/15"
                )}
              >
                <AnimatePresence mode="wait">
                  {isDone ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </motion.span>
                  ) : isActive ? (
                    <motion.span
                      key="pulse"
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  ) : null}
                </AnimatePresence>
              </span>
              <span
                className={cn(
                  "text-sm",
                  isDone && "text-white/50 line-through decoration-white/20",
                  isActive && "text-white",
                  isPending && "text-white/40"
                )}
              >
                {step}
              </span>
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-10 text-center font-mono text-[11px] text-white/25">
        {waitingForData
          ? "Finalizing report from live sources…"
          : `Synthesizing sources · ${Math.round(Math.min(progress, 100))}%`}
      </p>
    </motion.div>
  );
}
