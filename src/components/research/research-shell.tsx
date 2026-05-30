"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CommandPaletteProvider } from "@/context/command-palette-context";
import { CommandPalette } from "@/components/layout/command-palette";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { User, Settings, LogOut, Building } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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
  const router = useRouter();
  const isResearch = pathname === "/research";
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen bg-[#050505] text-[#fafafa]">
        <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#050505]/80 px-6 backdrop-blur-md">
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
            
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={cn(
                  "h-7 w-7 rounded-full border transition-colors overflow-hidden",
                  showProfile ? "border-accent-cyan" : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-[10px] font-medium text-white/70">
                  RU
                </div>
              </button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
                  >
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Workspace</p>
                    <p className="text-xs text-white mt-1">SignalOS Main</p>
                  </div>
                  <div className="space-y-0.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <User className="h-3.5 w-3.5" />
                      My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Building className="h-3.5 w-3.5" />
                      Team Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <Settings className="h-3.5 w-3.5" />
                      System Config
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button 
                      onClick={() => router.push("/login")}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

        <main className="relative z-10 flex-1 pt-14">{children}</main>
      </div>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
