from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.database import db_manager
from app.models import GraphNode, GraphEdge

router = APIRouter(prefix="/graph", tags=["Graph Inspection"])


@router.get("/inspect/node/{node_id}")
def inspect_node(node_id: str):
    """Retrieves full properties, labels, and connected relationships for a selected node."""
    if node_id not in db_manager.embedded_engine.nodes:
        raise HTTPException(status_code=404, detail=f"Node '{node_id}' not found in FalkorDB graph.")

    node = db_manager.embedded_engine.nodes[node_id]
    inbound_rels = []
    outbound_rels = []

    for r_id, r in db_manager.embedded_engine.relationships.items():
        if r["source"] == node_id:
            target_node = db_manager.embedded_engine.nodes.get(r["target"], {})
            outbound_rels.append({
                "rel_id": r_id,
                "type": r["type"],
                "target_id": r["target"],
                "target_name": target_node.get("properties", {}).get("name", r["target"]),
                "target_label": target_node.get("labels", ["Entity"])[0],
                "properties": r.get("properties", {}),
            })
        if r["target"] == node_id:
            src_node = db_manager.embedded_engine.nodes.get(r["source"], {})
            inbound_rels.append({
                "rel_id": r_id,
                "type": r["type"],
                "source_id": r["source"],
                "source_name": src_node.get("properties", {}).get("name", r["source"]),
                "source_label": src_node.get("labels", ["Entity"])[0],
                "properties": r.get("properties", {}),
            })

    return {
        "id": node["id"],
        "labels": node["labels"],
        "properties": node["properties"],
        "inbound_relationships": inbound_rels,
        "outbound_relationships": outbound_rels,
    }


@router.get("/inspect/policy/{policy_id}")
def inspect_policy(policy_id: str):
    """Inspects a permission policy and all connected identities and target resources."""
    details = db_manager.inspect_policy(policy_id)
    if not details:
        raise HTTPException(status_code=404, detail=f"Permission policy '{policy_id}' not found.")
    return details
