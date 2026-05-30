"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Plus, Trash2, Building2, Globe, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  industry?: string;
  created_at: string;
}

export default function CompetitorsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to sync tracked companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      
      if (!res.ok) throw new Error("Failed to add company");
      
      setNewName("");
      fetchCompanies();
    } catch (err) {
      setError("Could not add company. It may already be tracked.");
    }
  };

  const removeCompany = async (id: string) => {
    try {
      const res = await fetch("/api/companies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchCompanies();
    } catch (err) {
      setError("Failed to remove company");
    }
  };

  return (
    <AppShell title="Companies" subtitle="MANAGEMENT://tracked accounts">
      <div className="mx-auto max-w-5xl p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-accent-rose/10 border border-accent-rose/20 p-3 text-xs text-accent-rose flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="hover:text-white">Close</button>
          </div>
        )}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-white">Tracked Companies</h1>
            <p className="mt-1 text-sm text-white/40">Manage accounts and competitors for automated monitoring</p>
          </div>
          
          <form onSubmit={addCompany} className="flex gap-2">
            <input
              type="text"
              placeholder="Company name or domain..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-64 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white outline-none focus:border-white/20 transition-all focus:bg-white/[0.05]"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Track
            </button>
          </form>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-white/10 text-sm font-mono">Syncing database...</div>
        ) : companies.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-white/20">
            <Building2 className="mb-4 h-10 w-10 opacity-20" />
            <p>No companies tracked yet. Start by adding one above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <GlassPanel 
                key={c.id} 
                className="group relative p-5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                onClick={() => router.push(`/companies/${encodeURIComponent(c.name)}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 group-hover:bg-accent-cyan/10 transition-colors">
                    <Building2 className="h-5 w-5 text-white/40 group-hover:text-accent-cyan transition-colors" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCompany(c.id);
                    }}
                    className="rounded-md p-1.5 text-white/10 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <h3 className="mt-4 text-lg font-medium text-white group-hover:text-accent-cyan transition-colors">{c.name}</h3>
                <p className="text-[10px] text-white/30 font-mono mt-1 line-clamp-1">{c.industry || "Industry not enriched"}</p>
                
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30">
                    <Globe className="h-3 w-3 text-accent-emerald" />
                    <span className="text-accent-emerald/60">Monitoring active</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-white/20 group-hover:text-white transition-colors" />
                </div>
              </GlassPanel>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
