from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.database import db_manager
from app.agent import generate_terraform_diff
from app.seed_data import SYNTHETIC_ALERTS
from app.cypher_queries import RECOMPUTE_REACHABILITY_QUERY
from app.models import (
    RemediationSimulateRequest,
    RemediationSimulateResponse,
    AuditLogEntry,
    AttackPath,
)

router = APIRouter(tags=["Remediation & Audit"])

REMEDIATION_CACHE: Dict[str, RemediationSimulateResponse] = {}


@router.post("/remediations/simulate", response_model=RemediationSimulateResponse)
def simulate_remediation(req: RemediationSimulateRequest):
    """
    Applies simulated remediation to the FalkorDB graph.
    Mutates the target relationship/policy, re-executes the reachability traversal,
    verifies if the attack path is eliminated, and records an auditable record in FalkorDB.
    """
    # Resolve workload ID from alert
    alert = next((a for a in SYNTHETIC_ALERTS if a["id"].lower() == req.alert_id.lower()), None)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{req.alert_id}' not found.")
    workload_id = alert["entry_node_id"]

    # Execute simulated revocation in FalkorDB
    result_data, total_latency = db_manager.simulate_remediation(
        action_type=req.action_type,
        source_id=req.source_id,
        target_id=req.target_id,
        alert_id=req.alert_id,
        workload_id=workload_id,
    )

    remaining_paths_objs = [AttackPath(**p) for p in result_data["remaining_paths"]]
    audit = result_data["audit"]
    terraform_diff = generate_terraform_diff(req.action_type, req.source_id, req.target_id)

    status_str = "SUCCESSFULLY_VERIFIED" if result_data["verified"] else "PARTIAL_REMEDIATION"
    message_str = (
        f"Remediation verified: Attack path severed. Recomputed reachability confirmed 0 remaining paths to Tier-0 crown jewels."
        if result_data["verified"]
        else f"Partial remediation: {result_data['remaining_path_count']} alternate attack paths remain reachable."
    )

    response = RemediationSimulateResponse(
        remediation_id=f"rem-sim-{audit['id']}",
        status=status_str,
        action_applied=f"{req.action_type} ({req.source_id} -> {req.target_id})",
        previous_path_count=result_data["previous_path_count"],
        remaining_path_count=result_data["remaining_path_count"],
        verified=result_data["verified"],
        verification_query=RECOMPUTE_REACHABILITY_QUERY.strip(),
        verification_latency_ms=result_data["verification_latency_ms"],
        remaining_paths=remaining_paths_objs,
        terraform_diff=terraform_diff,
        audit_id=audit["id"],
        timestamp=audit["timestamp"],
        message=message_str,
    )

    REMEDIATION_CACHE[response.remediation_id] = response
    return response


@router.get("/remediations/{remediation_id}", response_model=RemediationSimulateResponse)
def get_remediation(remediation_id: str):
    """Retrieves a previously simulated remediation record."""
    if remediation_id not in REMEDIATION_CACHE:
        raise HTTPException(status_code=404, detail=f"Remediation '{remediation_id}' not found.")
    return REMEDIATION_CACHE[remediation_id]


@router.get("/audit", response_model=List[AuditLogEntry])
def get_audit_history():
    """Returns the persistent audit log of all investigations and remediations from FalkorDB."""
    raw_audits = db_manager.get_audit_history()
    return [AuditLogEntry(**a) for a in raw_audits]
