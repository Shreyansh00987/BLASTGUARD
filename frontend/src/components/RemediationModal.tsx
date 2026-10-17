"use client";

import React, { useState } from "react";
import { CandidateRemediation } from "@/lib/types";
import {
  X,
  Scissors,
  ShieldCheck,
  Code2,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface RemediationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateRemediation | null;
  onConfirm: () => Promise<void>;
  isApplying: boolean;
}

export const RemediationModal: React.FC<RemediationModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onConfirm,
  isApplying,
}) => {
  const [showTerraform, setShowTerraform] = useState(true);

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-slate-900">
                Simulate Least-Privilege Remediation
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Mutates relationship in FalkorDB & proves reachability elimination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Mutation Type</span>
              <span className="text-indigo-600 font-bold text-xs mt-0.5 block truncate">
                {candidate.action_type}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Threat Paths Cut</span>
              <span className="text-red-600 font-bold text-xs mt-0.5 block">
                {candidate.cuts_paths_count} Threat Vector(s)
              </span>
            </div>
          </div>

          {/* Source to Target Card */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold">
              <span>TARGET CHOKEPOINT RELATIONSHIP</span>
              <span className="text-indigo-600 font-bold">[:CAN_ASSUME]</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200">
              <span className="text-purple-700 font-semibold truncate">{candidate.source_id}</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="text-amber-800 font-semibold truncate">{candidate.target_id}</span>
            </div>
          </div>

          {/* Operational Safety Check */}
          <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-mono space-y-1 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero Collateral Disruption Guaranteed</span>
            </div>
            <p className="text-[11px] text-slate-700 leading-relaxed font-sans mt-0.5">
              Production workload <span className="font-mono text-slate-900 font-bold">prod-nightly-backup-agent</span> continues running normally because it assumes ProductionDeployerRole directly. Only unauthorized cross-account assumption from staging is severed.
            </p>
          </div>

          {/* Terraform HCL Preview Toggle */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setShowTerraform(!showTerraform)}
              className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-mono font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Proposed Terraform HCL Diff</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-bold">{showTerraform ? "Collapse" : "Expand"}</span>
            </button>
            {showTerraform && (
              <pre className="p-3 text-[10px] font-mono text-slate-200 overflow-x-auto leading-relaxed border-t border-slate-800 bg-slate-900">
                {candidate.terraform_preview}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-mono text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-mono font-bold text-white transition-all shadow-sm disabled:opacity-50 active:scale-[0.98]"
          >
            {isApplying ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-white" />
                <span>Mutating FalkorDB & Proving...</span>
              </>
            ) : (
              <>
                <Scissors className="w-4 h-4" />
                <span>Apply Simulation & Verify in FalkorDB</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
