"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPaletteProvider } from "@/context/command-palette-context";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";

const secondaryNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/competitors", label: "Competitors" },
  { href: "/signals", label: "Signals" },
  { href: "/reports", label: "Reports" },
];

interface ResearchShellProps {
  children: React.ReactNode;
  minimal?: boolean;
}

export function ResearchShell({ children, minimal = false }: ResearchShellProps) {
  const pathname = usePathname();
  const isResearch = pathname === "/research";

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-[#050505] text-[#fafafa]">
        <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050505]/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <Link href="/research" className="text-sm font-semibold tracking-tight">
              SignalOS
            </Link>
            {!minimal && (
              <nav className="hidden items-center gap-6 md:flex">
                <Link
                  href="/research"
                  className={cn(
                    "text-sm transition-colors",
                    isResearch ? "text-white" : "text-white/40 hover:text-white/70"
                  )}
                >
                  Research Agent
                </Link>
                {secondaryNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors",
                      pathname === item.href
                        ? "text-white"
                        : "text-white/40 hover:text-white/70"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-3">
            <kbd className="hidden rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-white/30 sm:inline">
              ⌘K
            </kbd>
            <div className="h-7 w-7 rounded-full border border-white/10 bg-white/5" />
          </div>
        </header>

        <main className="flex-1 pt-14">{children}</main>
      </div>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
