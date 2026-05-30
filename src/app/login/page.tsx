"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Fingerprint, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@signalos.io");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    document.cookie = "signalos-auth=true; path=/; max-age=86400; SameSite=Lax";
    router.push("/dashboard");
  };

  return (
    <div className="terminal-grid scanline relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.08)_0%,_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.06)_0%,_transparent_40%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-cyan/20 glow-cyan">
            <Zap className="h-6 w-6 text-accent-cyan" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-gradient">SignalOS</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            GTM Intelligence Terminal · Authenticated Access
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="glass-panel glow-cyan rounded-2xl p-8"
        >
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 px-3 py-2">
            <Fingerprint className="h-4 w-4 text-accent-cyan" />
            <span className="font-mono text-[11px] text-accent-cyan">
              SECURE SESSION · SSO READY
            </span>
          </div>

          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
              Work Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30"
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="mt-4 block">
            <span className="text-[11px] font-medium uppercase tracking-widest text-muted">
              Access Key
            </span>
            <input
              type="password"
              defaultValue="••••••••••••"
              className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-cyan/90 to-accent-violet/90 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="font-mono text-xs">AUTHENTICATING...</span>
            ) : (
              <>
                Enter Intelligence Terminal
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="mt-4 text-center font-mono text-[10px] text-muted">
            Demo environment · any credentials accepted
          </p>
        </form>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {["247 Sources", "Real-time", "AI-Native"].map((label) => (
            <div key={label} className="glass-panel rounded-lg py-2">
              <p className="font-mono text-[10px] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
