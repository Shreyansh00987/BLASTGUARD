"use client";

import React, { useState } from "react";
import {
  InvestigationResponse,
  CandidateRemediation,
  SecurityAlert,
} from "@/lib/types";
import { formatLatency } from "@/lib/utils";
import {
  ShieldAlert,
  Terminal,
  AlertTriangle,
  Scissors,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Code2,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";

interface EvidencePanelProps {
  investigation: InvestigationResponse | null;
  alert: SecurityAlert | null;
  onOpenRemediateModal: (candidate: CandidateRemediation) => void;
  isRemediatedClean: boolean;
  onOpenCypherDrawer: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  investigation,
  alert,
  onOpenRemediateModal,
  isRemediatedClean,
  onOpenCypherDrawer,
}) => {
  const [showCypher, setShowCypher] = useState(true);
  const [showImpact, setShowImpact] = useState(true);
  const [showAiSummary, setShowAiSummary] = useState(true);

  if (!investigation || !alert) {
    return (
      <aside className="w-96 border-l border-border bg-surface flex flex-col items-center justify-center p-6 text-center text-text-muted select-none">
        <div className="w-10 h-10 rounded border border-border bg-surface-elevated flex items-center justify-center mb-3">
          <Terminal className="w-5 h-5 text-text-muted" />
        </div>
        <p className="text-xs font-mono font-medium text-text-secondary">No Investigation Selected</p>
        <p className="text-[11px] text-text-muted mt-1 max-w-xs">
          Select an alert from the queue to inspect graph-backed evidence, query latency, and candidate remediation options.
        </p>
      </aside>
    );
  }

  const primaryRemediation = investigation.candidate_remediations[0];
  const pathsCount = investigation.paths_found;

  return (
    <aside className="w-96 border-l border-border bg-surface flex flex-col h-full overflow-hidden select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-text-primary">
            Investigation Evidence
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-text-muted">
          {investigation.investigation_id}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Verification Status Card */}
        {isRemediatedClean ? (
          <div className="p-3.5 rounded border border-emerald-500/40 bg-emerald-500/10 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>VERIFIED REMEDIATED IN FALKORDB</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              FalkorDB reachability traversal recomputed. The attack path has been completely severed. 0 Tier-0 sensitive resources remain reachable from this entry point.
            </p>
          </div>
        ) : pathsCount > 0 ? (
          <div className="p-3.5 rounded border border-red-500/40 bg-red-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>CRITICAL ESCALATION PATH DETECTED</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                {investigation.attack_paths[0]?.hop_count || 4} HOPS
              </span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Target: <span className="text-red-300 font-mono font-medium">{investigation.attack_paths[0]?.target_resource_name}</span> ({investigation.attack_paths[0]?.target_tier})
            </p>
          </div>
        ) : null}

        {/* Primary Action Button (Simulate Remediation) */}
        {primaryRemediation && !isRemediatedClean && (
          <div className="p-3 rounded-md border border-brand/40 bg-brand/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-semibold">
                Recommended Action
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand/20 text-brand">
                Least Privilege
              </span>
            </div>

            <p className="text-xs font-semibold text-text-primary">
              {primaryRemediation.title}
            </p>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {primaryRemediation.description}
            </p>

            <button
              onClick={() => onOpenRemediateModal(primaryRemediation)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-mono font-semibold bg-brand hover:bg-brand-hover text-white transition-colors shadow-md shadow-brand/20"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Simulate Remediation</span>
            </button>
          </div>
        )}

        {/* Exact Multi-Hop Path Breakdown */}
        {investigation.attack_paths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-text-secondary">
              <span>Attack Path Sequence</span>
              <span className="text-[10px] text-text-muted">{investigation.attack_paths.length} path(s)</span>
            </div>

            <div className="bg-canvas border border-border rounded p-2.5 space-y-1.5">
              {investigation.attack_paths[0].sequence_readable.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[10px] font-mono">
                  <span className="text-brand font-bold shrink-0">{idx + 1}.</span>
                  <span className="text-text-secondary break-all">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modeled Collateral Impact Assessment */}
        <div className="border border-border rounded bg-surface-elevated/40">
          <button
            onClick={() => setShowImpact(!showImpact)}
            className="w-full p-2.5 flex items-center justify-between text-left text-xs font-mono font-semibold text-text-primary"
          >
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Collateral Impact Assessment</span>
            </div>
            {showImpact ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
          </button>

          {showImpact && (
            <div className="p-3 border-t border-border space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-text-muted font-mono">Operational Risk:</span>
                <span className="font-mono font-semibold text-blue-400">
                  {investigation.collateral_impact.operational_risk_level}
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {investigation.collateral_impact.recommendation}
              </p>
              {investigation.collateral_impact.affected_workloads.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-text-muted text-[10px] font-mono">Modeled Legitimate Workloads:</span>
                  <div className="mt-1 space-y-1">
                    {investigation.collateral_impact.affected_workloads.map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-[10px] font-mono bg-canvas px-2 py-1 rounded border border-border">
                        <span className="text-text-primary">{w.name}</span>
                        <span className="text-emerald-400">{w.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FalkorDB Cypher Query Evidence Viewer */}
        <div className="border border-border rounded bg-surface-elevated/40">
          <button
            onClick={() => setShowCypher(!showCypher)}
            className="w-full p-2.5 flex items-center justify-between text-left text-xs font-mono font-semibold text-text-primary"
          >
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-violet-400" />
              <span>FalkorDB Cypher Evidence</span>
            </div>
            {showCypher ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
          </button>

          {showCypher && (
            <div className="p-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Execution Time:</span>
                <span className="text-emerald-400 font-semibold">{formatLatency(investigation.query_latency_ms)}</span>
              </div>
              <pre className="p-2.5 rounded bg-canvas border border-border text-[10px] font-mono text-violet-300 overflow-x-auto leading-relaxed">
                {investigation.evidence_cypher}
              </pre>
              <div className="text-[10px] font-mono text-text-muted">
                Parameters: <span className="text-text-secondary">{JSON.stringify(investigation.cypher_params)}</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Agent Grounded Summary */}
        {investigation.ai_summary && (
          <div className="border border-border rounded bg-surface-elevated/40">
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="w-full p-2.5 flex items-center justify-between text-left text-xs font-mono font-semibold text-text-primary"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Agent Grounded Explanation</span>
              </div>
              {showAiSummary ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
            </button>

            {showAiSummary && (
              <div className="p-3 border-t border-border text-[11px] text-text-secondary leading-relaxed whitespace-pre-line font-sans">
                {investigation.ai_summary}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
