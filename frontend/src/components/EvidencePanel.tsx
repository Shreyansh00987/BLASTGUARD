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
  Sparkles,
  Info,
  Copy,
  Check,
  Flame,
  ArrowRight,
  ShieldCheck,
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
}) => {
  const [showCypher, setShowCypher] = useState(true);
  const [showImpact, setShowImpact] = useState(true);
  const [showAiSummary, setShowAiSummary] = useState(true);
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (!investigation || !alert) {
    return (
      <aside className="w-96 border-l border-border bg-surface flex flex-col items-center justify-center p-6 text-center text-text-muted select-none">
        <div className="w-12 h-12 rounded-xl border border-border bg-surface-elevated flex items-center justify-center mb-3 text-text-dim">
          <Terminal className="w-6 h-6 text-brand" />
        </div>
        <p className="text-xs font-mono font-bold text-text-primary">No Incident Selected</p>
        <p className="text-[11px] text-text-muted mt-1 max-w-xs leading-relaxed">
          Select an alert from the stream to inspect multi-hop Cypher evidence, execution timing, and least-privilege remediation options.
        </p>
      </aside>
    );
  }

  const primaryRemediation = investigation.candidate_remediations[0];
  const pathsCount = investigation.paths_found;
  const topPath = investigation.attack_paths[0];

  const handleCopyCypher = () => {
    navigator.clipboard.writeText(investigation.evidence_cypher);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <aside className="w-96 border-l border-border bg-surface flex flex-col h-full overflow-hidden select-none shadow-xl">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-elevated/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-brand" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Threat Evidence & Action
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
          {investigation.investigation_id}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Verification Status Card */}
        {isRemediatedClean ? (
          <div className="p-4 rounded-lg border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 shadow-safeGlow space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>VERIFIED CLEAN IN FALKORDB</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed font-sans">
              FalkorDB reachability traversal recomputed. The cross-account trust path has been completely severed. <span className="font-bold text-white">0 Tier-0 crown jewels</span> remain reachable from this workload.
            </p>
          </div>
        ) : pathsCount > 0 ? (
          <div className="p-3.5 rounded-lg border border-red-500/40 bg-gradient-to-br from-red-500/15 to-red-500/5 shadow-threatGlow space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-300 font-bold text-xs font-mono">
                <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                <span>ACTIVE THREAT REACHABILITY</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/25 text-red-200 border border-red-500/40">
                {topPath?.hop_count || 4} HOPS
              </span>
            </div>
            <div className="p-2 rounded bg-canvas/80 border border-border/80 text-[11px] font-mono space-y-1">
              <div className="text-text-muted text-[10px]">Crown Jewel Target:</div>
              <div className="text-amber-300 font-bold truncate">
                {topPath?.target_resource_name}
              </div>
              <div className="text-[10px] text-red-400 font-medium">
                Classification: {topPath?.target_sensitivity} ({topPath?.target_tier})
              </div>
            </div>
          </div>
        ) : null}

        {/* Primary Action Button (Simulate Remediation) */}
        {primaryRemediation && !isRemediatedClean && (
          <div className="p-4 rounded-lg border border-brand/50 bg-gradient-to-br from-brand/15 via-brand/5 to-transparent shadow-glow space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recommended Remediation
              </span>
              <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-brand/20 text-brand border border-brand/30">
                LEAST PRIVILEGE
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-text-primary font-mono">
                {primaryRemediation.title}
              </p>
              <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                {primaryRemediation.description}
              </p>
            </div>

            <button
              onClick={() => onOpenRemediateModal(primaryRemediation)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono font-bold bg-gradient-to-r from-brand to-brand-dark hover:from-brand-hover hover:to-brand text-white transition-all shadow-md shadow-brand/30 active:scale-[0.98]"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Simulate Remediation in Graph</span>
            </button>
          </div>
        )}

        {/* Multi-Hop Path Breakdown Stepper */}
        {investigation.attack_paths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-text-secondary">
              <span>Attack Traversal Sequence</span>
              <span className="text-[10px] text-text-muted font-normal">{investigation.attack_paths.length} candidate path(s)</span>
            </div>

            <div className="bg-canvas/90 border border-border rounded-lg p-3 space-y-2">
              {investigation.attack_paths[0].sequence_readable.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-[10px] font-mono group">
                  <div className="w-4 h-4 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-[9px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-text-secondary break-all leading-normal group-hover:text-text-primary transition-colors">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modeled Collateral Impact Assessment */}
        <div className="border border-border rounded-lg bg-surface-card overflow-hidden">
          <button
            onClick={() => setShowImpact(!showImpact)}
            className="w-full p-3 flex items-center justify-between text-left text-xs font-mono font-bold text-text-primary hover:bg-surface-elevated/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Collateral Impact Assessment</span>
            </div>
            {showImpact ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
          </button>

          {showImpact && (
            <div className="p-3 border-t border-border space-y-2.5 text-[11px] bg-canvas/40">
              <div className="flex items-center justify-between font-mono">
                <span className="text-text-muted">Operational Risk:</span>
                <span className="font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">
                  {investigation.collateral_impact.operational_risk_level}
                </span>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {investigation.collateral_impact.recommendation}
              </p>
              {investigation.collateral_impact.affected_workloads.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-text-muted text-[10px] font-mono">Modeled Legitimate Workloads:</span>
                  <div className="mt-1.5 space-y-1">
                    {investigation.collateral_impact.affected_workloads.map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-[10px] font-mono bg-canvas px-2.5 py-1.5 rounded border border-border">
                        <span className="text-text-primary font-medium">{w.name}</span>
                        <span className="text-emerald-400 font-semibold">{w.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FalkorDB Cypher Evidence Terminal */}
        <div className="border border-border rounded-lg bg-surface-card overflow-hidden">
          <div className="p-2.5 border-b border-border bg-surface-elevated/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-[10px] font-mono font-bold text-text-primary ml-1">
                FalkorDB Cypher Evidence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {formatLatency(investigation.query_latency_ms)}
              </span>
              <button
                onClick={handleCopyCypher}
                className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                title="Copy Cypher query"
              >
                {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-canvas/95 space-y-2">
            <pre className="text-[10px] font-mono text-violet-300 overflow-x-auto leading-relaxed">
              {investigation.evidence_cypher}
            </pre>
            <div className="pt-2 border-t border-border/40 text-[10px] font-mono text-text-muted">
              Params: <span className="text-cyan-300">{JSON.stringify(investigation.cypher_params)}</span>
            </div>
          </div>
        </div>

        {/* Agent Grounded Explanation */}
        {investigation.ai_summary && (
          <div className="border border-border rounded-lg bg-surface-card overflow-hidden">
            <button
              onClick={() => setShowAiSummary(!showAiSummary)}
              className="w-full p-3 flex items-center justify-between text-left text-xs font-mono font-bold text-text-primary hover:bg-surface-elevated/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Agent Grounded Synthesis</span>
              </div>
              {showAiSummary ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
            </button>

            {showAiSummary && (
              <div className="p-3 border-t border-border text-[11px] text-text-secondary leading-relaxed whitespace-pre-line font-sans bg-canvas/40">
                {investigation.ai_summary}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
