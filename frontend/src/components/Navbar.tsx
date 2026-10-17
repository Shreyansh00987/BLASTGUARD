"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Database,
  RotateCcw,
  Search,
  ExternalLink,
  Activity,
  CheckCircle2,
  AlertCircle,
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
    <header className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between gap-4 select-none z-30">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded border border-brand/50 bg-brand/10 flex items-center justify-center text-brand shadow-[0_0_12px_rgba(139,92,246,0.3)]">
            <ShieldAlert className="w-4 h-4 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-text-primary text-base">
                BLASTGUARD
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                DEMO ENV
              </span>
            </div>
            <p className="text-[10px] text-text-muted hidden sm:block font-mono leading-none">
              Trace the attack. Cut the path. Prove it&apos;s gone.
            </p>
          </div>
        </div>
      </div>

      {/* Center: Search & Filter */}
      <div className="hidden md:flex items-center max-w-xs w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search workloads, identities, policies..."
            className="w-full bg-canvas border border-border rounded pl-8 pr-3 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand transition-colors font-mono"
          />
        </div>
      </div>

      {/* Right Controls: FalkorDB Real Status & Reset */}
      <div className="flex items-center gap-3">
        {/* FalkorDB Live Status Badge */}
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono transition-colors ${
            isConnected
              ? "bg-surface-elevated border-emerald-500/30 text-text-secondary"
              : "bg-red-500/10 border-red-500/30 text-red-400"
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            )}
            <Database className="w-3.5 h-3.5 text-brand" />
            <span className="font-semibold text-text-primary">FalkorDB</span>
          </div>

          <span className="text-text-muted hidden lg:inline">|</span>

          {summary ? (
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-text-muted">
              <span>{summary.node_count} nodes</span>
              <span>·</span>
              <span>{summary.relationship_count} edges</span>
              <span>·</span>
              <span className="text-emerald-400">{formatLatency(summary.latency_ms)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-text-muted">Connecting...</span>
          )}
        </div>

        {/* Audit History Button */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border bg-surface-elevated text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
          title="Open persistent FalkorDB audit timeline"
        >
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span className="hidden sm:inline">Audit Log</span>
        </button>

        {/* Reset Demo State Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded border border-border bg-canvas text-text-primary hover:border-brand/60 hover:text-brand transition-all disabled:opacity-50"
          title="Restore pristine synthetic graph scenario"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-brand" : ""}`} />
          <span>{isResetting ? "Resetting..." : "Reset Scenario"}</span>
        </button>
      </div>
    </header>
  );
};
