"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RESEARCH_EXAMPLES } from "@/lib/research-data";
import { cn } from "@/lib/utils";

interface ResearchSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ResearchSearch({
  query,
  onQueryChange,
  onSubmit,
  disabled,
}: ResearchSearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) onSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-2xl px-6"
    >
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-white/30">
        GTM Intelligence
      </p>
      <h1 className="text-center text-3xl font-medium tracking-tight text-white sm:text-4xl">
        What should we research?
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-white/45">
        SignalOS analyzes competitors, hiring, news, and market activity — then
        delivers an analyst-grade brief.
      </p>

      <form onSubmit={handleSubmit} className="mt-12">
        <div
          className={cn(
            "group relative flex items-center gap-2 rounded-2xl border bg-white/[0.02] px-2 py-2 transition-colors",
            "border-white/10 focus-within:border-white/25 focus-within:bg-white/[0.04]"
          )}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Research a company, competitor, or market…"
            disabled={disabled}
            autoFocus
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base text-white placeholder:text-white/25 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !query.trim()}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            Research
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-white/25">Examples</span>
        {RESEARCH_EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            disabled={disabled}
            onClick={() => onQueryChange(example)}
            className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-white/55 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white/90 disabled:opacity-40"
          >
            {example}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
