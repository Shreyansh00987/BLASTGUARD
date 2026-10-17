import pytest
from app.database import db_manager


def setup_function():
    """Ensure clean baseline for each test."""
    db_manager.reset_demo()


def test_attack_path_discovery():
    """Verify that multi-hop traversal finds paths from staging pod to Tier-0 crown jewels."""
    paths, latency = db_manager.discover_attack_paths("wkld-stage-payment-worker")
    assert len(paths) >= 1
    assert latency >= 0.0

    # Verify primary hero path targets customer backups
    targets = [p["target_resource_id"] for p in paths]
    assert "res-prod-customer-backups" in targets
    
    hero_path = next(p for p in paths if p["target_resource_id"] == "res-prod-customer-backups")
    assert hero_path["hop_count"] == 4
    assert hero_path["node_ids"] == [
        "wkld-stage-payment-worker",
        "ident-stage-payment-sa",
        "ident-prod-deployer-role",
        "pol-prod-s3-backup-admin",
        "res-prod-customer-backups",
    ]


def test_collateral_impact_assessment():
    """Verify that legitimate dependencies on the target role are identified."""
    impact = db_manager.assess_collateral_impact("ident-prod-deployer-role")
    assert len(impact["affected_workloads"]) >= 1
    workload_ids = [w["id"] for w in impact["affected_workloads"]]
    assert "wkld-prod-backup-service" in workload_ids
    assert len(impact["routes"]) >= 1
    assert impact["operational_risk_level"] in ("HIGH", "MEDIUM")


def test_simulated_remediation_and_verification():
    """Verify that simulated revocation cuts the path and reachability re-computation proves it."""
    # Pre-condition: paths exist
    pre_paths, _ = db_manager.discover_attack_paths("wkld-stage-payment-worker")
    assert len(pre_paths) >= 1

    # Simulate revocation of the CAN_ASSUME edge
    result, total_latency = db_manager.simulate_remediation(
        action_type="REVOKE_CAN_ASSUME",
        source_id="ident-stage-payment-sa",
        target_id="ident-prod-deployer-role",
        alert_id="ALERT-9041",
        workload_id="wkld-stage-payment-worker",
    )

    assert result["deleted_relationships"] == 1
    assert result["previous_path_count"] >= 1
    assert result["remaining_path_count"] == 0
    assert result["verified"] is True
    assert len(result["remaining_paths"]) == 0

    # Verify audit record is persisted
    audits = db_manager.get_audit_history()
    assert len(audits) >= 1
    assert audits[0]["action"] == "REVOKE_CAN_ASSUME"
    assert audits[0]["verified"] is True


def test_reset_demo_restores_state():
    """Verify that reset restores deleted relationships and initial attack paths."""
    # Revoke
    db_manager.simulate_remediation(
        action_type="REVOKE_CAN_ASSUME",
        source_id="ident-stage-payment-sa",
        target_id="ident-prod-deployer-role",
        alert_id="ALERT-9041",
        workload_id="wkld-stage-payment-worker",
    )
    paths_after_cut, _ = db_manager.discover_attack_paths("wkld-stage-payment-worker")
    assert len(paths_after_cut) == 0

    # Reset
    reset_res = db_manager.reset_demo()
    assert reset_res["status"] == "success"

    # Paths restored
    restored_paths, _ = db_manager.discover_attack_paths("wkld-stage-payment-worker")
    assert len(restored_paths) >= 1
