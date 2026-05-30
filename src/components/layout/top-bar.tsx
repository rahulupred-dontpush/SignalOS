"use client";

import { Bell, Command, Search, CheckCircle2, X, User, Settings, LogOut, Building, ExternalLink } from "lucide-react";
import { useCommandPalette } from "@/context/command-palette-context";
import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  reportId?: string;
  read: boolean;
  created_at: string;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { setOpen } = useCommandPalette();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    if (n.reportId) {
      // Logic to view specific report - for now we route to history
      router.push("/research/history");
    }
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between border-b border-white/8 px-6 bg-black/20 backdrop-blur-sm z-50">
      <div>
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-muted font-mono">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent-cyan/30 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="ml-1 hidden rounded border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-muted transition-colors hover:text-foreground"
          aria-label="Command palette"
        >
          <Command className="h-4 w-4" />
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={cn(
              "relative rounded-lg border border-white/10 bg-white/5 p-2 transition-colors",
              showNotifications ? "text-accent-cyan border-accent-cyan/30" : "text-muted hover:text-foreground"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent-rose shadow-[0_0_8px_#f43f5e]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-black/90 p-1 shadow-2xl backdrop-blur-xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Alerts & Signals</p>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAsRead()}
                      className="text-[10px] text-accent-cyan hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto overflow-x-hidden py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-xs text-white/20">No active alerts</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotificationClick(n)}
                        className={cn(
                          "group relative flex gap-3 px-3 py-3 hover:bg-white/[0.03] transition-colors rounded-lg mx-1 cursor-pointer",
                          !n.read && "bg-accent-cyan/[0.02]"
                        )}
                      >
                        <div className={cn(
                          "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                          !n.read ? "bg-accent-cyan shadow-[0_0_5px_#22d3ee]" : "bg-white/10"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-white/90 leading-normal">{n.title}</p>
                            {n.reportId && <ExternalLink className="h-2.5 w-2.5 text-white/20 group-hover:text-accent-cyan transition-colors" />}
                          </div>
                          <p className="text-[11px] text-white/40 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-white/20 mt-1.5 font-mono">{format(new Date(n.created_at), "MMM d, HH:mm")}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className={cn(
              "ml-2 flex items-center gap-2 rounded-lg border bg-white/5 pl-1 pr-3 py-1 transition-colors",
              showProfile ? "border-accent-cyan/30 text-foreground" : "border-white/10 text-muted hover:text-foreground"
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent-cyan/30 to-accent-violet/30 text-xs font-medium text-white">
              RU
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-foreground">Revenue Ops</p>
              <p className="text-[10px] text-muted font-mono">Pro workspace</p>
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
  );
}
