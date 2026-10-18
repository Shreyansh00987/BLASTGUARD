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
  Copy,
  Check,
  Flame,
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
  const [showAiSummary, setShowAiSummary] = useState(true);
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (!investigation || !alert) {
    return (
      <aside className="w-96 border-l border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center text-slate-500 select-none">
        <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center mb-3 text-slate-400">
          <Terminal className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-sm font-sans font-bold text-slate-900">No Incident Selected</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs leading-relaxed font-sans">
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
    <aside className="w-96 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden select-none shadow-sm">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-slate-900">
            Threat Evidence & Action
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
          {investigation.investigation_id}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Verification Status Card */}
        {isRemediatedClean ? (
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>VERIFIED CLEAN IN FALKORDB</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-sans font-medium">
              FalkorDB reachability traversal recomputed. The cross-account trust path has been completely severed. <span className="font-bold text-emerald-900">0 Tier-0 crown jewels</span> remain reachable from this workload.
            </p>
          </div>
        ) : pathsCount > 0 ? (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-900 font-bold text-sm font-sans">
                <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                <span>ACTIVE THREAT REACHABILITY</span>
              </div>
              <span className="text-xs font-sans font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300">
                {topPath?.hop_count || 4} HOPS
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-red-200 space-y-1">
              <div className="text-slate-500 text-[11px] font-sans font-semibold">Crown Jewel Target:</div>
              <div className="text-amber-900 font-bold text-xs truncate">
                {topPath?.target_resource_name}
              </div>
              <div className="text-[11px] text-red-700 font-semibold font-sans">
                Classification: {topPath?.target_sensitivity} ({topPath?.target_tier})
              </div>
            </div>
          </div>
        ) : null}

        {/* Primary Action Button (Simulate Remediation) */}
        {primaryRemediation && !isRemediatedClean && (
          <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans uppercase tracking-wider text-indigo-800 font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Recommended Fix
              </span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                LEAST PRIVILEGE
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans leading-snug">
                {primaryRemediation.title}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-sans mt-1.5">
                {primaryRemediation.description}
              </p>
            </div>

            <button
              onClick={() => onOpenRemediateModal(primaryRemediation)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-sans font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md active:scale-[0.98]"
            >
              <Scissors className="w-4 h-4" />
              <span>Simulate Remediation in Graph</span>
            </button>
          </div>
        )}

        {/* Multi-Hop Path Breakdown Stepper */}
        {investigation.attack_paths.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-sans font-bold text-slate-800">
              <span className="uppercase tracking-wider">Attack Traversal Sequence</span>
              <span className="text-xs text-slate-500 font-normal">{investigation.attack_paths.length} candidate path(s)</span>
            </div>

            <div className="space-y-2.5">
              {investigation.attack_paths.slice(0, 2).map((path, pIdx) => (
                <div
                  key={path.path_id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-sans space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center justify-center text-[10px] font-extrabold">
                        {pIdx + 1}
                      </span>
                      <span>Path #{pIdx + 1}: {path.hop_count} Hops</span>
                    </span>
                    <span className="text-[11px] text-red-700 font-extrabold">CRITICAL</span>
                  </div>

                  <div className="pl-2 border-l-2 border-red-300 space-y-2 py-1 text-xs">
                    {path.sequence_readable.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-slate-800">
                        <span className="w-4 h-4 rounded bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-snug font-medium font-mono text-[11px]">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modeled Legitimate Impact Safety Check */}
        {investigation.collateral_impact && (
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-sans space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Legitimate Business Safety</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  investigation.collateral_impact.legitimate_traffic_preserved
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-amber-50 text-amber-800 border-amber-300"
                }`}
              >
                {investigation.collateral_impact.legitimate_traffic_preserved ? "SAFE TO APPLY" : "IMPACT WARNING"}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {investigation.collateral_impact.recommendation || investigation.collateral_impact.detailed_notes}
            </p>

            <div className="pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">
                Dependent workloads modeled:{" "}
                <span className="text-slate-900 font-bold">
                  {investigation.collateral_impact.affected_workloads.length}
                </span>
              </div>
              {investigation.collateral_impact.affected_workloads.map((dep, dIdx) => (
                <div key={dIdx} className="text-sky-800 bg-sky-50 border border-sky-200 p-1.5 rounded-lg truncate font-mono text-[11px]">
                  • {dep.name} ({dep.environment})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real FalkorDB Cypher Evidence Terminal */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setShowCypher(!showCypher)}
            className="w-full p-2.5 bg-slate-50 flex items-center justify-between text-xs font-sans text-slate-900 font-bold border-b border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              <span>Real FalkorDB Cypher Query</span>
            </div>
            {showCypher ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {showCypher && (
            <div className="p-3 bg-slate-900 text-slate-100 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-1 text-[10px] text-slate-400">falkordb-cli</span>
                </div>
                <button
                  onClick={handleCopyCypher}
                  className="flex items-center gap-1 text-[10px] text-slate-200 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                >
                  {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedQuery ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <pre className="overflow-x-auto p-1 leading-relaxed text-indigo-300 whitespace-pre-wrap select-text text-[11px]">
                {investigation.evidence_cypher}
              </pre>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                <span>Execution Time: {formatLatency(investigation.query_latency_ms)}</span>
                <span className="text-emerald-400 font-bold">Parameterized Cypher</span>
              </div>
            </div>
          )}
        </div>

        {/* AI Agent Analysis Summary */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setShowAiSummary(!showAiSummary)}
            className="w-full p-2.5 bg-slate-50 flex items-center justify-between text-xs font-sans text-slate-900 font-bold border-b border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI Security Summary</span>
            </div>
            {showAiSummary ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {showAiSummary && (
            <div className="p-3 text-xs text-slate-700 leading-relaxed font-sans space-y-2">
              <p>{investigation.ai_summary}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-sans text-slate-500">
                <span>Model: Constrained Tool Calling</span>
                <span className="text-indigo-600 font-bold">FalkorDB Grounded</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
