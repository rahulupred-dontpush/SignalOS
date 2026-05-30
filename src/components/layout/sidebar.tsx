"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  FileText,
  LayoutDashboard,
  Radio,
  Search,
  Zap,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/research", label: "Research Agent", icon: Search },
  { href: "/research/history", label: "Research History", icon: History },
  { href: "/competitors", label: "Companies", icon: Building2 },
  { href: "/signals", label: "Signals Feed", icon: Radio },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-white/8 bg-black/40 backdrop-blur-xl">
      <Link href="/dashboard" className="flex items-center gap-2.5 border-b border-white/8 px-4 py-5 hover:bg-white/[0.02] transition-colors">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/20">
          <Zap className="h-4 w-4 text-accent-cyan" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">SignalOS</p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted">
            GTM Intel
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative block">
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "text-accent-cyan"
                    : "text-foreground/60 hover:text-foreground/90"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/8 p-3">
        <div className="glass-panel rounded-lg p-3">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
            System Status
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald shadow-[0_0_8px_#34d399]" />
            <span className="font-mono text-xs text-foreground/80">All signals live</span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted">MVP · Database Active</p>
        </div>
      </div>
    </aside>
  );
}
