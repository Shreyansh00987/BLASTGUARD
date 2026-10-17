"use client";

import React, { useState } from "react";
import { CandidateRemediation } from "@/lib/types";
import {
  X,
  Scissors,
  ShieldCheck,
  Code2,
  Cpu,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface border border-border/80 rounded-xl shadow-2xl overflow-hidden flex flex-col glow-brand">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-brand/50 bg-brand/15 flex items-center justify-center text-brand shadow-glow">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-text-primary">
                Simulate Least-Privilege Remediation
              </h3>
              <p className="text-[11px] text-text-muted font-mono">
                Mutates relationship in FalkorDB & proves reachability elimination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-1 text-text-muted hover:text-text-primary rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action Metric Cards */}
          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-lg border border-border bg-canvas/80">
              <span className="text-[10px] text-text-muted uppercase block">Mutation Type</span>
              <span className="text-brand font-bold text-xs mt-0.5 block truncate">
                {candidate.action_type}
              </span>
            </div>
            <div className="p-2.5 rounded-lg border border-border bg-canvas/80">
              <span className="text-[10px] text-text-muted uppercase block">Threat Paths Cut</span>
              <span className="text-red-400 font-bold text-xs mt-0.5 block">
                {candidate.cuts_paths_count} Threat Vector(s)
              </span>
            </div>
          </div>

          {/* Source to Target Card */}
          <div className="p-3 rounded-lg border border-border bg-canvas/90 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-text-muted text-[10px]">
              <span>TARGET CHOKEPOINT RELATIONSHIP</span>
              <span className="text-brand font-semibold">[:CAN_ASSUME]</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-surface border border-border/60">
              <span className="text-violet-300 font-medium truncate">{candidate.source_id}</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="text-amber-300 font-medium truncate">{candidate.target_id}</span>
            </div>
          </div>

          {/* Operational Safety Check */}
          <div className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-xs font-mono space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero Collateral Disruption Guaranteed</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans mt-0.5">
              Production workload <span className="font-mono text-white font-semibold">prod-nightly-backup-agent</span> continues running normally because it assumes ProductionDeployerRole directly. Only unauthorized cross-account assumption from staging is severed.
            </p>
          </div>

          {/* Terraform HCL Preview Toggle */}
          <div className="border border-border rounded-lg bg-canvas overflow-hidden">
            <button
              onClick={() => setShowTerraform(!showTerraform)}
              className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-mono font-semibold text-text-secondary bg-surface-elevated/40 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand" />
                <span>Proposed Terraform HCL Diff</span>
              </div>
              <span className="text-[10px] text-brand font-mono">{showTerraform ? "Collapse" : "Expand"}</span>
            </button>
            {showTerraform && (
              <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed border-t border-border bg-canvas/90">
                {candidate.terraform_preview}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-elevated/70 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-3.5 py-2 rounded-md border border-border bg-canvas text-xs font-mono text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-xs font-mono font-bold text-white transition-all shadow-glow disabled:opacity-50 active:scale-[0.98]"
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
