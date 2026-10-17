from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class GraphNode(BaseModel):
    id: str
    labels: List[str]
    properties: Dict[str, Any]
    node_type: str = "Resource"
    display_name: str = ""
    environment: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[str] = None


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    is_attack_path: bool = False
    is_legitimate_dependency: bool = False


class AttackPath(BaseModel):
    path_id: str
    hop_count: int
    entry_workload_id: str
    target_resource_id: str
    target_resource_name: str
    target_tier: str
    target_sensitivity: str
    node_ids: List[str]
    edge_ids: List[str]
    sequence_readable: List[str]
    chokepoint_suggestion: Optional[Dict[str, Any]] = None


class CollateralImpact(BaseModel):
    candidate_remediation: str
    affected_workloads: List[Dict[str, Any]] = Field(default_factory=list)
    legitimate_traffic_preserved: bool = True
    operational_risk_level: str = "LOW"
    recommendation: str = ""
    detailed_notes: str = ""


class CandidateRemediation(BaseModel):
    id: str
    title: str
    action_type: str  # e.g., 'REVOKE_CAN_ASSUME', 'REVOKE_HAS_POLICY'
    source_id: str
    target_id: str
    target_label: str
    description: str
    cuts_paths_count: int
    impact_level: str
    terraform_preview: str


class InvestigationResponse(BaseModel):
    investigation_id: str
    alert_id: str
    entry_workload_id: str
    entry_workload_name: str
    status: str
    timestamp: str
    paths_found: int
    attack_paths: List[AttackPath]
    candidate_remediations: List[CandidateRemediation]
    collateral_impact: CollateralImpact
    evidence_cypher: str
    cypher_params: Dict[str, Any]
    query_latency_ms: float
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    ai_summary: Optional[str] = None


class RemediationSimulateRequest(BaseModel):
    alert_id: str
    investigation_id: str
    action_type: str
    source_id: str
    target_id: str
    notes: Optional[str] = "Simulated via BlastGuard interactive interface"


class RemediationSimulateResponse(BaseModel):
    remediation_id: str
    status: str
    action_applied: str
    previous_path_count: int
    remaining_path_count: int
    verified: bool
    verification_query: str
    verification_latency_ms: float
    remaining_paths: List[AttackPath]
    terraform_diff: str
    audit_id: str
    timestamp: str
    message: str


class SecurityAlert(BaseModel):
    id: str
    title: str
    severity: str
    status: str
    entry_node_id: str
    affected_resource_name: str
    description: str
    timestamp: str
    synthetic: bool = True


class GraphSummary(BaseModel):
    database: str
    connected: bool
    connection_type: str
    host: str
    port: int
    graph_name: str
    node_count: int
    relationship_count: int
    latency_ms: float
    last_verified: str


class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    alert_id: str
    action: str
    source_id: str
    target_id: str
    previous_paths: int
    remaining_paths: int
    verified: bool
    verified_at: Optional[str] = None
    applied_by: str = "BlastGuard Agent"
