"use client";

import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

interface ResearchErrorProps {
  message: string;
  onRetry: () => void;
  onNewSearch: () => void;
}

export function ResearchError({ message, onRetry, onNewSearch }: ResearchErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-lg px-6 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03]">
        <AlertCircle className="h-5 w-5 text-white/60" />
      </div>
      <h2 className="mt-6 text-lg font-medium text-white">Research failed</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/45">{message}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
        <button
          type="button"
          onClick={onNewSearch}
          className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/70 transition-colors hover:border-white/30 hover:text-white"
        >
          New search
        </button>
      </div>
    </motion.div>
  );
}
