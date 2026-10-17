"use client";

import React from "react";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Server,
  ChevronRight,
  ShieldAlert,
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
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
            <Flame className="w-3 h-3 text-red-500" /> CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-500" /> HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {severity}
          </span>
        );
    }
  };

  return (
    <aside className="w-80 border-r border-border bg-surface flex flex-col h-full select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-violet-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Security Alerts
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface-elevated border border-border text-text-muted">
          {alerts.length} Seeded
        </span>
      </div>

      {/* Alert Instructions Banner */}
      <div className="p-2.5 bg-surface-elevated/40 border-b border-border text-[11px] text-text-secondary leading-relaxed">
        Select an alert to initiate a graph-backed investigation and trace multi-hop escalation paths.
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-surface-elevated rounded w-1/3" />
                <div className="h-3 bg-surface-elevated rounded w-3/4" />
                <div className="h-3 bg-surface-elevated rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted font-mono">
            No active alerts in queue.
          </div>
        ) : (
          alerts.map((alert) => {
            const isSelected = alert.id === selectedAlertId;
            const isResolved = alert.status === "RESOLVED";

            return (
              <button
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className={`w-full text-left p-3 transition-colors flex flex-col gap-1.5 group relative ${
                  isSelected
                    ? "bg-brand/10 border-l-2 border-l-brand"
                    : "hover:bg-surface-elevated/50 border-l-2 border-l-transparent"
                }`}
              >
                {/* Top Row: Severity & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getSeverityBadge(alert.severity)}
                    {isResolved && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
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
                  className={`text-xs font-semibold leading-snug line-clamp-2 transition-colors ${
                    isSelected ? "text-text-primary" : "text-text-secondary group-hover:text-text-primary"
                  }`}
                >
                  {alert.title}
                </h3>

                {/* Affected Workload */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-text-muted truncate mt-0.5">
                  <Server className="w-3 h-3 text-violet-400 shrink-0" />
                  <span className="truncate">{alert.affected_resource_name}</span>
                </div>

                {/* Brief description snippet */}
                <p className="text-[11px] text-text-muted line-clamp-2 leading-normal">
                  {alert.description}
                </p>

                {/* Arrow indicator when selected */}
                {isSelected && (
                  <ChevronRight className="w-4 h-4 text-brand absolute right-2.5 top-1/2 -translate-y-1/2" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Footer */}
      <div className="p-3 border-t border-border bg-surface-elevated/30 text-[10px] font-mono text-text-muted flex items-center justify-between">
        <span>Synthetic AWS Telemetry</span>
        <span>Track 01</span>
      </div>
    </aside>
  );
};
