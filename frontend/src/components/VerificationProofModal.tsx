"use client";

import React from "react";
import { RemediationSimulateResponse } from "@/lib/types";
import { formatLatency } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Database,
  ArrowRight,
} from "lucide-react";

interface VerificationProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RemediationSimulateResponse | null;
}

export const VerificationProofModal: React.FC<VerificationProofModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const isSuccess = result.verified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isSuccess
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <h3 className="text-sm font-mono font-bold">
                {isSuccess ? "VERIFIED IN FALKORDB: ATTACK PATH SEVERED" : "PARTIAL REMEDIATION"}
              </h3>
              <p className="text-[11px] text-text-muted font-mono">
                Verification Query Executed Against Graph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Proof Metric Card */}
          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="p-3 rounded border border-border bg-canvas">
              <span className="text-[10px] text-text-muted block">Previous Threat Paths</span>
              <span className="text-lg font-bold text-red-400">{result.previous_path_count}</span>
            </div>
            <div className="p-3 rounded border border-border bg-canvas">
              <span className="text-[10px] text-text-muted block">Remaining Threat Paths</span>
              <span
                className={`text-lg font-bold ${
                  result.remaining_path_count === 0 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {result.remaining_path_count}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-3 rounded border border-border bg-surface-elevated/40 text-xs text-text-secondary leading-relaxed">
            {result.message}
          </div>

          {/* Verification Cypher Query Ran */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand" />
                <span>Verification Cypher Query (Live)</span>
              </div>
              <span className="text-emerald-400">{formatLatency(result.verification_latency_ms)}</span>
            </div>
            <pre className="p-2.5 rounded bg-canvas border border-border text-[10px] text-violet-300 overflow-x-auto leading-relaxed">
              {result.verification_query}
            </pre>
          </div>

          {/* Audit Record Identifier */}
          <div className="p-2.5 rounded border border-border bg-canvas flex items-center justify-between text-[11px] font-mono">
            <span className="text-text-muted">FalkorDB Audit ID:</span>
            <span className="text-brand font-semibold">{result.audit_id}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-surface-elevated/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-brand hover:bg-brand-hover text-xs font-mono font-semibold text-white transition-colors"
          >
            <span>View Updated Graph Subgraph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
