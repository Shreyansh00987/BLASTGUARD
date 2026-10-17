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
    <div className="fixed inset-y-0 right-0 w-96 bg-white/98 backdrop-blur-md border-l border-slate-200 shadow-2xl z-50 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            FalkorDB Audit Store
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={loadAudits}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && audits.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
            Loading persistent records from FalkorDB...
          </div>
        ) : audits.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-400 space-y-2">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-slate-800 font-bold">No Records Yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              Simulate an attack-path remediation in the graph to persist an auditable verification record.
            </p>
          </div>
        ) : (
          audits.map((entry) => (
            <div
              key={entry.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(entry.timestamp)}
                </span>
                {entry.verified ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED (0 PATHS)
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> PARTIAL
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block font-semibold">ACTION:</span>
                <span className="text-indigo-600 font-bold text-xs">{entry.action}</span>
              </div>

              <div className="p-2 rounded-lg bg-white border border-slate-200 text-[10px] text-slate-700 truncate">
                {entry.source_id} → {entry.target_id}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Alert: {entry.alert_id}</span>
                <span className="text-emerald-700 font-bold">{entry.applied_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
