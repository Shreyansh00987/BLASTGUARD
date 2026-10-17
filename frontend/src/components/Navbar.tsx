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
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 select-none z-30 shadow-sm">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-base font-mono">
                BLASTGUARD
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 tracking-wide">
                DEMO ENVIRONMENT
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden sm:block font-mono leading-none tracking-tight">
              Trace the attack. Cut the path. Prove it&apos;s gone.
            </p>
          </div>
        </div>
      </div>

      {/* Center: Search with Shortcut Key */}
      <div className="hidden md:flex items-center max-w-sm w-full">
        <div className="relative w-full group">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Search workloads, identities, policies..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
          />
          <kbd className="hidden lg:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white border border-slate-200">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls: FalkorDB Real Status & Actions */}
      <div className="flex items-center gap-2.5">
        {/* FalkorDB Live Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isConnected
              ? "bg-emerald-50/70 border-emerald-200 text-slate-700 shadow-sm"
              : "bg-red-50 border-red-200 text-red-700"
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
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            )}
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-bold text-slate-900 tracking-wide">FalkorDB</span>
          </div>

          <span className="text-slate-200 hidden lg:inline">|</span>

          {summary ? (
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
              <span>{summary.node_count} nodes</span>
              <span>·</span>
              <span>{summary.relationship_count} edges</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">{formatLatency(summary.latency_ms)}</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400">Connecting...</span>
          )}
        </div>

        {/* Audit Log Button */}
        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all shadow-sm"
          title="Open persistent FalkorDB audit timeline"
        >
          <Activity className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline font-medium">Audit Log</span>
        </button>

        {/* Reset Demo State Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all disabled:opacity-50 shadow-sm"
          title="Restore pristine synthetic graph scenario"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-indigo-600" : ""}`} />
          <span>{isResetting ? "Resetting..." : "Reset Scenario"}</span>
        </button>
      </div>
    </header>
  );
};
