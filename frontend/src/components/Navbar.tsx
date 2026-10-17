"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Database,
  RotateCcw,
  Search,
  Activity,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { GraphSummary } from "@/lib/types";
import { formatLatency } from "@/lib/utils";

interface NavbarProps {
  summary: GraphSummary | null;
  onResetDemo: () => Promise<void>;
  isResetting: boolean;
  onSearch: (query: string) => void;
  onOpenAudit: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  summary,
  onResetDemo,
  isResetting,
  onSearch,
  onOpenAudit,
}) => {
  const [searchVal, setSearchVal] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch(e.target.value);
  };

  const isConnected = summary?.connected ?? false;

  return (
    <header className="h-14 border-b border-border bg-surface/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 select-none z-30 shadow-card">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg border border-brand/60 bg-gradient-to-br from-brand/20 to-brand-dark/40 flex items-center justify-center text-brand shadow-glow">
            <ShieldAlert className="w-4 h-4 text-brand" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-text-primary text-base font-mono">
                BLASTGUARD
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 tracking-wide">
                DEMO ENVIRONMENT
              </span>
            </div>
            <p className="text-[10px] text-text-muted hidden sm:block font-mono leading-none tracking-tight">
              Trace the attack. Cut the path. Prove it&apos;s gone.
            </p>
          </div>
        </div>
      </div>

      {/* Center: Search with Shortcut Key */}
      <div className="hidden md:flex items-center max-w-sm w-full">
        <div className="relative w-full group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search workloads, identities, policies..."
            className="w-full bg-canvas/90 border border-border rounded-md pl-9 pr-8 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand/80 focus:ring-1 focus:ring-brand/40 transition-all font-mono"
          />
          <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-text-dim px-1.5 py-0.5 rounded bg-surface border border-border">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls: FalkorDB Real Status & Actions */}
      <div className="flex items-center gap-2.5">
        {/* FalkorDB Live Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
            isConnected
              ? "bg-surface-elevated/80 border-emerald-500/30 text-text-secondary shadow-[0_0_12px_rgba(16,185,129,0.12)]"
              : "bg-red-500/10 border-red-500/40 text-red-400"
          }`}
          title={
            summary
              ? `Graph: ${summary.graph_name} | Type: ${summary.connection_type} | Latency: ${formatLatency(
                  summary.latency_ms
                )}`
              : "Checking FalkorDB health..."
          }
        >
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <Database className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-bold text-text-primary tracking-wide">FalkorDB</span>
          </div>

          <span className="text-border hidden lg:inline">|</span>

          {summary ? (
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-text-muted">
              <span>{summary.node_count} nodes</span>
              <span>·</span>
              <span>{summary.relationship_count} edges</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{formatLatency(summary.latency_ms)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-text-muted">Connecting...</span>
          )}
        </div>

        {/* Audit Log Button */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-border bg-surface-elevated hover:bg-surface-hover text-text-secondary hover:text-text-primary hover:border-border-active transition-all"
          title="Open persistent FalkorDB audit timeline"
        >
          <Activity className="w-3.5 h-3.5 text-brand" />
          <span className="hidden sm:inline font-medium">Audit Log</span>
        </button>

        {/* Reset Demo State Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-md border border-brand/40 bg-gradient-to-r from-brand/15 to-brand/5 text-brand hover:border-brand hover:bg-brand/20 transition-all disabled:opacity-50"
          title="Restore pristine synthetic graph scenario"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-brand" : ""}`} />
          <span>{isResetting ? "Resetting..." : "Reset Scenario"}</span>
        </button>
      </div>
    </header>
  );
};
