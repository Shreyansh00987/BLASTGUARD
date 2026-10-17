"use client";

import React, { useState } from "react";
import { RemediationSimulateResponse } from "@/lib/types";
import { formatLatency } from "@/lib/utils";
import {
  X,
  CheckCircle2,
  Database,
  ArrowRight,
  Copy,
  Check,
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

  const handleCopyAudit = () => {
    navigator.clipboard.writeText(result.audit_id);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-emerald-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-emerald-200 bg-emerald-50/80 flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-emerald-950 tracking-wide">
                MATHEMATICAL PROOF: ATTACK VECTOR ELIMINATED
              </h3>
              <p className="text-[11px] text-emerald-700 font-mono">
                Verified via Fresh FalkorDB Graph Reachability Traversal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Proof Metric Comparison Card */}
          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 shadow-sm">
              <span className="text-[10px] text-red-700 uppercase block font-bold">Previous Threat Paths</span>
              <span className="text-2xl font-extrabold text-red-600 mt-1 block">
                {result.previous_path_count}
              </span>
              <span className="text-[10px] text-red-500 block mt-0.5 font-medium">Active Multi-Hop</span>
            </div>
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm">
              <span className="text-[10px] text-emerald-800 uppercase block font-bold">Remaining Attack Paths</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                {result.remaining_path_count}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">Zero Reachability</span>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed font-sans">
            <p className="text-slate-900 font-semibold">{result.message}</p>
          </div>

          {/* Verification Cypher Query Ran */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold text-slate-900">FalkorDB Verification Cypher (Live)</span>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                {formatLatency(result.verification_latency_ms)}
              </span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {result.verification_query}
            </pre>
          </div>

          {/* Persistent Audit Record Identifier */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-semibold">Persisted Audit Record</span>
              <span className="text-indigo-600 font-bold text-xs mt-0.5 block">{result.audit_id}</span>
            </div>
            <button
              onClick={handleCopyAudit}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] text-slate-700 transition-colors shadow-sm"
            >
              {copiedAudit ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-mono font-bold text-white transition-all shadow-sm active:scale-[0.98]"
          >
            <span>View Updated Severed Subgraph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
