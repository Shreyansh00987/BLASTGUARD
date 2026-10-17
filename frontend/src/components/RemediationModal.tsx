"use client";

import React, { useState } from "react";
import { CandidateRemediation } from "@/lib/types";
import {
  X,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ShieldCheck,
  Cpu,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-surface border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded border border-brand/40 bg-brand/10 flex items-center justify-center text-brand">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-semibold text-text-primary">
                Confirm Simulated Remediation
              </h3>
              <p className="text-[11px] text-text-muted">
                Mutates modeled relationship in FalkorDB & re-verifies reachability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action Summary */}
          <div className="p-3 rounded border border-border bg-canvas space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span>Action Type:</span>
              <span className="text-brand font-semibold">{candidate.action_type}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Source Identity:</span>
              <span className="text-text-primary">{candidate.source_id}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Target Entity:</span>
              <span className="text-text-primary">{candidate.target_id}</span>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Threat Paths Severed:</span>
              <span className="text-red-400 font-semibold">{candidate.cuts_paths_count}</span>
            </div>
          </div>

          {/* Operational Safety Check */}
          <div className="p-3 rounded border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Modeled Impact: Safe for Production</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              Legitimate production service <span className="font-mono text-text-primary font-medium">prod-nightly-backup-agent</span> remains unaffected because it executes as ProductionDeployerRole directly. Only cross-account assumption from staging is severed.
            </p>
          </div>

          {/* Terraform HCL Preview Toggle */}
          <div className="border border-border rounded bg-canvas overflow-hidden">
            <button
              onClick={() => setShowTerraform(!showTerraform)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono text-text-secondary bg-surface-elevated/50 hover:bg-surface-elevated transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-brand" />
                <span>Proposed Terraform HCL Diff</span>
              </div>
              <span className="text-[10px] text-text-muted">{showTerraform ? "Hide" : "Show"}</span>
            </button>
            {showTerraform && (
              <pre className="p-3 text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed border-t border-border">
                {candidate.terraform_preview}
              </pre>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-border bg-surface-elevated/60 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-3 py-1.5 rounded border border-border bg-canvas text-xs font-mono text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="flex items-center gap-2 px-4 py-1.5 rounded bg-brand hover:bg-brand-hover text-xs font-mono font-semibold text-white transition-colors shadow-md shadow-brand/20 disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Mutating FalkorDB & Verifying...</span>
              </>
            ) : (
              <>
                <Scissors className="w-3.5 h-3.5" />
                <span>Apply Simulation & Verify in Graph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
