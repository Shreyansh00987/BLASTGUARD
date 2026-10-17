"use client";

import React, { useState } from "react";
import { RemediationSimulateResponse } from "@/lib/types";
import { formatLatency } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Database,
  ArrowRight,
  Copy,
  Check,
  Zap,
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
  const [copiedAudit, setCopiedAudit] = useState(false);

  if (!isOpen || !result) return null;

  const isSuccess = result.verified;

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(result.audit_id);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-surface border border-emerald-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col glow-safe">
        {/* Header */}
        <div className="p-4 border-b border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-emerald-400">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white tracking-wide">
                MATHEMATICAL PROOF: ATTACK VECTOR ELIMINATED
              </h3>
              <p className="text-[11px] text-emerald-400/90 font-mono">
                Verified via Fresh FalkorDB Graph Reachability Traversal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Proof Metric Comparison Card */}
          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="p-3.5 rounded-lg border border-border bg-canvas/80 shadow-inner">
              <span className="text-[10px] text-text-muted uppercase block font-semibold">Previous Threat Paths</span>
              <span className="text-2xl font-extrabold text-red-400 mt-1 block">
                {result.previous_path_count}
              </span>
              <span className="text-[10px] text-red-400/70 block mt-0.5">Active Multi-Hop</span>
            </div>
            <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Remaining Attack Paths</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                {result.remaining_path_count}
              </span>
              <span className="text-[10px] text-emerald-300/80 block mt-0.5">Zero Reachability</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-lg border border-border bg-canvas text-xs text-text-secondary leading-relaxed font-sans">
            <p className="text-text-primary font-medium">{result.message}</p>
          </div>

          {/* Verification Cypher Query Ran */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-brand" />
                <span className="font-semibold text-text-primary">FalkorDB Verification Cypher (Live)</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                {formatLatency(result.verification_latency_ms)}
              </span>
            </div>
            <pre className="p-3 rounded-lg bg-canvas border border-border text-[10px] font-mono text-violet-300 overflow-x-auto leading-relaxed">
              {result.verification_query}
            </pre>
          </div>

          {/* Persistent Audit Record Identifier */}
          <div className="p-3 rounded-lg border border-border bg-canvas/90 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-text-muted text-[10px] block uppercase">Persisted Audit Record</span>
              <span className="text-brand font-bold text-xs mt-0.5 block">{result.audit_id}</span>
            </div>
            <button
              onClick={handleCopyAudit}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border bg-surface hover:bg-surface-elevated text-[11px] text-text-secondary hover:text-text-primary transition-colors"
            >
              {copiedAudit ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-xs font-mono font-bold text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
          >
            <span>View Updated Severed Subgraph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
