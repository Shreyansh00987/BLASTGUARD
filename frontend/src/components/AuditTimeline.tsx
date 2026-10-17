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
    <div className="fixed inset-y-0 right-0 w-96 bg-surface border-l border-border shadow-2xl z-50 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-elevated">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            FalkorDB Audit Timeline
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadAudits}
            className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && audits.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-text-muted animate-pulse">
            Loading persistent records from FalkorDB...
          </div>
        ) : audits.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-text-muted">
            <Database className="w-8 h-8 text-border mx-auto mb-2" />
            <p>No remediation actions recorded yet.</p>
            <p className="text-[10px] text-text-muted mt-1">
              Simulate a remediation to record an auditable change.
            </p>
          </div>
        ) : (
          audits.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border border-border bg-canvas text-xs font-mono space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted">
                  {formatTimestamp(entry.timestamp)}
                </span>
                {entry.verified ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-2.5 h-2.5" /> UNVERIFIED
                  </span>
                )}
              </div>

              <div className="font-semibold text-text-primary">
                Action: <span className="text-brand">{entry.action}</span>
              </div>

              <div className="text-[11px] text-text-muted">
                Target: {entry.source_id} → {entry.target_id}
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border/40">
                <span>Alert: {entry.alert_id}</span>
                <span>Remaining: {entry.remaining_paths} paths</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
