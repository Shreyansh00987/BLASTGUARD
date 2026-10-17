"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Server,
  ChevronRight,
  ShieldAlert,
  Radio,
  Filter,
} from "lucide-react";
import { SecurityAlert } from "@/lib/types";

interface AlertQueueProps {
  alerts: SecurityAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (alertId: string) => void;
  isLoading: boolean;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  isLoading,
}) => {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "RESOLVED">("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "CRITICAL") return a.severity === "CRITICAL";
    if (filter === "RESOLVED") return a.status === "RESOLVED";
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.25)]">
            <Flame className="w-3 h-3 text-red-400" /> CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {severity}
          </span>
        );
    }
  };

  return (
    <aside className="w-80 border-r border-border bg-surface flex flex-col h-full select-none shadow-lg">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-brand" />
            <span className="absolute w-2 h-2 rounded-full bg-brand animate-ping opacity-60" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Threat Stream
          </h2>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary">
          {alerts.length} Incidents
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-border bg-canvas/40 flex items-center gap-1">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded transition-colors ${
            filter === "ALL"
              ? "bg-brand/20 text-brand border border-brand/40"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter("CRITICAL")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded transition-colors ${
            filter === "CRITICAL"
              ? "bg-red-500/20 text-red-300 border border-red-500/40"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Critical ({alerts.filter((a) => a.severity === "CRITICAL").length})
        </button>
        <button
          onClick={() => setFilter("RESOLVED")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded transition-colors ${
            filter === "RESOLVED"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Resolved ({alerts.filter((a) => a.status === "RESOLVED").length})
        </button>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-2 rounded bg-surface-elevated/40">
                <div className="h-4 bg-surface-elevated rounded w-1/3" />
                <div className="h-3 bg-surface-elevated rounded w-3/4" />
                <div className="h-2.5 bg-surface-elevated rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted font-mono">
            No matching incidents in stream.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isSelected = alert.id === selectedAlertId;
            const isResolved = alert.status === "RESOLVED";

            return (
              <button
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 group relative border-l-2 ${
                  isSelected
                    ? "bg-surface-elevated border-l-brand shadow-[inset_0_0_20px_rgba(139,92,246,0.06)]"
                    : "border-l-transparent hover:bg-surface-elevated/50"
                }`}
              >
                {/* Top Row: Severity & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getSeverityBadge(alert.severity)}
                    {isResolved && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" /> RESOLVED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{alert.timestamp}</span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className={`text-xs font-bold leading-snug line-clamp-2 transition-colors ${
                    isSelected ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                  }`}
                >
                  {alert.title}
                </h3>

                {/* Affected Workload Chip */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted truncate">
                  <div className="w-4 h-4 rounded bg-canvas border border-border flex items-center justify-center text-violet-400 shrink-0">
                    <Server className="w-2.5 h-2.5" />
                  </div>
                  <span className="truncate text-text-secondary font-medium">{alert.affected_resource_name}</span>
                </div>

                {/* Description snippet */}
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>

                {/* Indicator icon */}
                {isSelected && (
                  <ChevronRight className="w-4 h-4 text-brand absolute right-2.5 top-1/2 -translate-y-1/2 drop-shadow" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="p-2.5 border-t border-border bg-canvas text-[10px] font-mono text-text-muted flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          FalkorDB Sync Active
        </span>
        <span className="text-text-dim">Track 01</span>
      </div>
    </aside>
  );
};
