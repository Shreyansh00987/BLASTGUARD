"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { AlertQueue } from "@/components/AlertQueue";
import { GraphWorkspace } from "@/components/GraphWorkspace";
import { EvidencePanel } from "@/components/EvidencePanel";
import { RemediationModal } from "@/components/RemediationModal";
import { VerificationProofModal } from "@/components/VerificationProofModal";
import { NodeInspector } from "@/components/NodeInspector";
import { AuditTimeline } from "@/components/AuditTimeline";
import {
  fetchHealth,
  fetchAlerts,
  startInvestigation,
  simulateRemediation,
  resetDemo,
} from "@/lib/api";
import {
  GraphSummary,
  SecurityAlert,
  InvestigationResponse,
  CandidateRemediation,
  RemediationSimulateResponse,
} from "@/lib/types";

export default function BlastGuardPage() {
  const [summary, setSummary] = useState<GraphSummary | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>("ALERT-9041");
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);

  // Selection & UI states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [remediationCandidate, setRemediationCandidate] = useState<CandidateRemediation | null>(null);
  const [verificationResult, setVerificationResult] = useState<RemediationSimulateResponse | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Loading states
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isApplyingRemediation, setIsApplyingRemediation] = useState(false);

  // Load health & alerts on initial render
  useEffect(() => {
    fetchHealth()
      .then((res) => setSummary(res))
      .catch((err) => console.error("Health check error:", err));

    fetchAlerts()
      .then((res) => {
        setAlerts(res);
        setIsLoadingAlerts(false);
        // Start hero investigation automatically on initial load
        if (res.length > 0) {
          handleSelectAlert("ALERT-9041");
        }
      })
      .catch((err) => {
        console.error("Alerts fetch error:", err);
        setIsLoadingAlerts(false);
      });
  }, []);

  // Investigation trigger
  const handleSelectAlert = async (alertId: string) => {
    setSelectedAlertId(alertId);
    setSelectedNodeId(null);
    setIsInvestigating(true);

    try {
      const inv = await startInvestigation(alertId);
      setInvestigation(inv);
      // Refresh summary
      const sum = await fetchHealth();
      setSummary(sum);
    } catch (err) {
      console.error("Investigation failed:", err);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Reset Scenario
  const handleResetDemo = async () => {
    setIsResetting(true);
    setSelectedNodeId(null);
    setVerificationResult(null);

    try {
      await resetDemo();
      const sum = await fetchHealth();
      setSummary(sum);
      const alertList = await fetchAlerts();
      setAlerts(alertList);
      if (selectedAlertId) {
        await handleSelectAlert(selectedAlertId);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setIsResetting(false);
    }
  };

  // Apply Simulated Remediation
  const handleConfirmRemediation = async () => {
    if (!remediationCandidate || !investigation || !selectedAlertId) return;

    setIsApplyingRemediation(true);
    try {
      const result = await simulateRemediation({
        alert_id: selectedAlertId,
        investigation_id: investigation.investigation_id,
        action_type: remediationCandidate.action_type,
        source_id: remediationCandidate.source_id,
        target_id: remediationCandidate.target_id,
      });

      // Show verification proof modal
      setVerificationResult(result);
      setRemediationCandidate(null);

      // Refresh investigation from FalkorDB to display updated severed graph!
      const updatedInv = await startInvestigation(selectedAlertId);
      setInvestigation(updatedInv);

      // Refresh graph summary
      const updatedSummary = await fetchHealth();
      setSummary(updatedSummary);
    } catch (err) {
      console.error("Remediation execution failed:", err);
    } finally {
      setIsApplyingRemediation(false);
    }
  };

  // Filtered alerts by search
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const q = searchQuery.toLowerCase();
    return alerts.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.affected_resource_name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
    );
  }, [alerts, searchQuery]);

  const activeAlert = alerts.find((a) => a.id === selectedAlertId) || null;
  const isRemediatedClean = investigation?.paths_found === 0 && Boolean(verificationResult);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-canvas text-text-primary">
      {/* Top Navigation */}
      <Navbar
        summary={summary}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onSearch={setSearchQuery}
        onOpenAudit={() => setIsAuditOpen(true)}
      />

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Alerts Queue */}
        <AlertQueue
          alerts={filteredAlerts}
          selectedAlertId={selectedAlertId}
          onSelectAlert={handleSelectAlert}
          isLoading={isLoadingAlerts}
        />

        {/* Center Column: Interactive Attack Graph Workspace */}
        <GraphWorkspace
          nodes={investigation?.nodes || []}
          edges={investigation?.edges || []}
          attackPaths={investigation?.attack_paths || []}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          isLoading={isInvestigating}
          isRemediatedClean={isRemediatedClean}
          onOpenRemediateModal={() => {
            if (investigation?.candidate_remediations?.[0]) {
              setRemediationCandidate(investigation.candidate_remediations[0]);
            }
          }}
        />

        {/* Right Column: Evidence & Remediation Action Panel */}
        <EvidencePanel
          investigation={investigation}
          alert={activeAlert}
          onOpenRemediateModal={(cand) => setRemediationCandidate(cand)}
          isRemediatedClean={isRemediatedClean}
          onOpenCypherDrawer={() => {}}
        />

        {/* Slide-over Node Inspector */}
        <NodeInspector nodeId={selectedNodeId} onClose={() => setSelectedNodeId(null)} />

        {/* Persistent Audit Timeline Drawer */}
        <AuditTimeline isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
      </div>

      {/* Remediation Confirmation Modal */}
      <RemediationModal
        isOpen={Boolean(remediationCandidate)}
        onClose={() => setRemediationCandidate(null)}
        candidate={remediationCandidate}
        onConfirm={handleConfirmRemediation}
        isApplying={isApplyingRemediation}
      />

      {/* Graph Verification Proof Modal */}
      <VerificationProofModal
        isOpen={Boolean(verificationResult)}
        onClose={() => setVerificationResult(null)}
        result={verificationResult}
      />
    </div>
  );
}
