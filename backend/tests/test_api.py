import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db_manager

client = TestClient(app)


def setup_function():
    db_manager.reset_demo()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "FalkorDB"
    assert data["connected"] is True
    assert data["node_count"] > 0
    assert data["relationship_count"] > 0


def test_list_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 4
    alert_ids = [a["id"] for a in alerts]
    assert "ALERT-9041" in alert_ids


def test_investigation_workflow():
    response = client.post("/api/investigations", json={"alert_id": "ALERT-9041"})
    assert response.status_code == 200
    data = response.json()
    assert data["alert_id"] == "ALERT-9041"
    assert data["paths_found"] >= 1
    assert len(data["attack_paths"]) >= 1
    assert len(data["candidate_remediations"]) >= 1
    assert "match" in data["evidence_cypher"].lower()
    assert "return" in data["evidence_cypher"].lower()


def test_simulated_remediation_api():
    # 1. Investigate
    inv_res = client.post("/api/investigations", json={"alert_id": "ALERT-9041"})
    inv_data = inv_res.json()
    rem = inv_data["candidate_remediations"][0]

    # 2. Simulate
    sim_res = client.post(
        "/api/remediations/simulate",
        json={
            "alert_id": "ALERT-9041",
            "investigation_id": inv_data["investigation_id"],
            "action_type": rem["action_type"],
            "source_id": rem["source_id"],
            "target_id": rem["target_id"],
        },
    )
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["verified"] is True
    assert sim_data["remaining_path_count"] == 0
    assert "terraform" in sim_data["terraform_diff"].lower()

    # 3. Check Audit Log
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    audit_list = audit_res.json()
    assert len(audit_list) >= 1
    assert audit_list[0]["verified"] is True
