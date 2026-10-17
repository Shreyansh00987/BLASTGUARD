"use client";

import React, { useEffect, useState } from "react";
import { fetchAuditHistory } from "@/lib/api";
import { AuditLogEntry } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Database,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface AuditTimelineProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ isOpen, onClose }) => {
  const [audits, setAudits] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAudits = () => {
    setLoading(true);
    fetchAuditHistory()
      .then((res) => setAudits(res))
      .catch((err) => console.error("Audit history error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadAudits();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-surface/98 backdrop-blur-md border-l border-border shadow-2xl z-50 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-elevated/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            FalkorDB Audit Store
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadAudits}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && audits.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-text-muted animate-pulse">
            Loading persistent records from FalkorDB...
          </div>
        ) : audits.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-text-muted space-y-2">
            <Database className="w-8 h-8 text-border mx-auto" />
            <p className="text-text-primary font-bold">No Records Yet</p>
            <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
              Simulate an attack-path remediation in the graph to persist an auditable verification record.
            </p>
          </div>
        ) : (
          audits.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-lg border border-border bg-canvas text-xs font-mono space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(entry.timestamp)}
                </span>
                {entry.verified ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> VERIFIED (0 PATHS)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3 text-amber-400" /> PARTIAL
                  </span>
                )}
              </div>

              <div>
                <span className="text-text-muted text-[10px] block">ACTION:</span>
                <span className="text-brand font-bold text-xs">{entry.action}</span>
              </div>

              <div className="p-2 rounded bg-surface border border-border/60 text-[10px] text-text-secondary truncate">
                {entry.source_id} → {entry.target_id}
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-dim pt-1 border-t border-border/40">
                <span>Alert: {entry.alert_id}</span>
                <span className="text-emerald-400 font-semibold">{entry.applied_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
