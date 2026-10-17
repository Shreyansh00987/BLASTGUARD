from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict
from app.agent import agent
from app.seed_data import SYNTHETIC_ALERTS
from app.models import InvestigationResponse

router = APIRouter(prefix="/investigations", tags=["Investigations"])

# Cache of active investigations
INVESTIGATIONS_CACHE: Dict[str, InvestigationResponse] = {}


class CreateInvestigationRequest(BaseModel):
    alert_id: str
    workload_id: Optional[str] = None


@router.post("", response_model=InvestigationResponse)
def create_investigation(req: CreateInvestigationRequest):
    """
    Triggers an investigation of an alert.
    Queries FalkorDB for reachable Tier-0 targets, evaluates candidate chokepoints,
    and returns graph nodes, edges, Cypher evidence, and impact analysis.
    """
    workload_id = req.workload_id

    # If workload_id not provided, look up in synthetic alerts
    if not workload_id:
        alert = next((a for a in SYNTHETIC_ALERTS if a["id"].lower() == req.alert_id.lower()), None)
        if not alert:
            raise HTTPException(status_code=404, detail=f"Alert '{req.alert_id}' not found.")
        workload_id = alert["entry_node_id"]

    investigation = agent.investigate_alert(req.alert_id, workload_id)
    INVESTIGATIONS_CACHE[investigation.investigation_id] = investigation
    return investigation


@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(investigation_id: str):
    """Retrieves an existing investigation by ID."""
    if investigation_id not in INVESTIGATIONS_CACHE:
        raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found.")
    return INVESTIGATIONS_CACHE[investigation_id]


@router.get("/{investigation_id}/evidence")
def get_investigation_evidence(investigation_id: str):
    """Returns Cypher query, parameters, and evidence details for an investigation."""
    if investigation_id not in INVESTIGATIONS_CACHE:
        raise HTTPException(status_code=404, detail=f"Investigation '{investigation_id}' not found.")
    inv = INVESTIGATIONS_CACHE[investigation_id]
    return {
        "investigation_id": inv.investigation_id,
        "alert_id": inv.alert_id,
        "cypher_query": inv.evidence_cypher,
        "cypher_params": inv.cypher_params,
        "query_latency_ms": inv.query_latency_ms,
        "paths_found": inv.paths_found,
        "attack_paths": [p.model_dump() for p in inv.attack_paths],
    }
