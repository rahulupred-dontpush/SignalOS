"use client";

import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Radio,
  Search,
  Sparkles,
} from "lucide-react";
import { useCommandPalette } from "@/context/command-palette-context";

const commands = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "research", label: "Research Agent", href: "/research", icon: Search },
  { id: "competitors", label: "Competitors", href: "/competitors", icon: Building2 },
  { id: "signals", label: "Signals Feed", href: "/signals", icon: Radio },
  { id: "reports", label: "Reports", href: "/reports", icon: FileText },
];

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-[60] w-full max-w-lg -translate-x-1/2 px-4"
          >
            <Command
              className="glass-panel glow-cyan overflow-hidden rounded-xl shadow-2xl"
              label="Command palette"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-4">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
                <Command.Input
                  placeholder="Search commands, pages, actions..."
                  className="flex-1 bg-transparent py-4 text-sm text-foreground placeholder:text-muted outline-none"
                />
                <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-72 overflow-y-auto p-2">
                <Command.Empty className="py-8 text-center text-sm text-muted">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted">
                  {commands.map((cmd) => (
                    <Command.Item
                      key={cmd.id}
                      value={cmd.label}
                      onSelect={() => run(cmd.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/90 aria-selected:bg-accent-cyan/10"
                    >
                      <cmd.icon className="h-4 w-4 text-accent-cyan" />
                      {cmd.label}
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted">
                  <Command.Item
                    value="Generate weekly report"
                    onSelect={() => run("/reports")}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent-cyan/10"
                  >
                    <BarChart3 className="h-4 w-4 text-accent-violet" />
                    Generate weekly report
                  </Command.Item>
                  <Command.Item
                    value="Run company research"
                    onSelect={() => run("/research")}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent-cyan/10"
                  >
                    <Search className="h-4 w-4 text-accent-emerald" />
                    Run company research
                  </Command.Item>
                </Command.Group>
              </Command.List>
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] text-muted">
                <span>SignalOS Command</span>
                <span className="flex gap-2">
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">↑↓</kbd>
                  navigate
                  <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">↵</kbd>
                  select
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
