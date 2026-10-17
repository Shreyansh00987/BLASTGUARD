# BlastGuard Parameterized Cypher Queries

All graph traversals, impact assessments, mutations, and verification steps in BlastGuard are powered by real, parameterized Cypher queries executed against **FalkorDB**.

---

## 1. Attack Path Discovery (Multi-Hop Traversal)

**Purpose**: Discovers all transitive paths from an affected entry workload to any Tier-0 Critical Resource (crown jewels) up to 6 hops away, avoiding cycles and ordering from shortest to longest path.

```cypher
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN path, nodes(path) AS path_nodes, relationships(path) AS path_rels, length(path) AS hop_count
ORDER BY length(path) ASC
LIMIT 10
```

- **Parameters**: `{"workload_id": "wkld-stage-payment-worker"}`
- **Semantics**:
  - Traverses through workload execution, cross-account/cross-role assumption (`CAN_ASSUME`), policy attachments (`HAS_POLICY`), resource grants (`GRANTS_ACCESS_TO`), and secret credentials (`STORES_SECRET`, `AUTHENTICATES`).
  - Bounded at `1..6` hops to prevent unbounded traversal.
  - Matches only destinations categorized as `tier: 'TIER_0_CRITICAL'`.

---

## 2. Recompute Reachability (Post-Remediation Verification)

**Purpose**: Re-evaluates graph connectivity from the affected workload to sensitive resources after a simulated mutation. This query provides the **mathematical proof** of whether the attack path has been cut.

```cypher
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN count(path) AS remaining_paths, collect(path) AS paths
```

- **Parameters**: `{"workload_id": "wkld-stage-payment-worker"}`
- **Verification Criterion**: If `remaining_paths == 0`, remediation is mathematically verified clean. If `remaining_paths > 0`, BlastGuard honestly reports partial remediation and surfaces the alternate path.

---

## 3. Candidate Policy & Chokepoint Inspection

**Purpose**: Retrieves the detailed permissions, attached identities, and granted resources of a specific policy in the discovered path.

```cypher
MATCH (p:PermissionPolicy {id: $policy_id})
OPTIONAL MATCH (i:Identity)-[:HAS_POLICY]->(p)
OPTIONAL MATCH (p)-[:GRANTS_ACCESS_TO]->(r:Resource)
RETURN p, collect(DISTINCT i) AS identities, collect(DISTINCT r) AS resources
```

- **Parameters**: `{"policy_id": "pol-prod-s3-backup-admin"}`
- **Result**: Provides evidence of why this policy contributes to the attack vector.

---

## 4. Collateral Impact & Legitimate Dependency Check

**Purpose**: Inspects legitimate production workloads executing as the target identity and discovers active operational traffic dependencies (`ACTIVE_TRAFFIC_TO`). Prevents accidental production outages caused by naive role deletion.

```cypher
MATCH (i:Identity {id: $identity_id})<-[:EXECUTES_AS]-(w:Workload)
OPTIONAL MATCH (w)-[t:ACTIVE_TRAFFIC_TO]->(r:Resource)
RETURN w, i, collect(DISTINCT r) AS active_resources
```

- **Parameters**: `{"identity_id": "ident-prod-deployer-role"}`
- **Operational Defense**: Reveals that `prod-nightly-backup-agent` depends on this role to perform legitimate nightly backup syncs, guiding the engineer to sever the cross-account `CAN_ASSUME` relationship instead of deleting the production role.

---

## 5. Simulated Mutation: Revoke Cross-Account `CAN_ASSUME`

**Purpose**: Safely deletes the specific trust relationship between staging and production identities in the FalkorDB graph, and creates an audit record.

```cypher
MATCH (src:Identity {id: $source_id})-[rel:CAN_ASSUME]->(tgt:Identity {id: $target_id})
DELETE rel
CREATE (audit:RemediationAudit {
  id: $audit_id,
  action: 'REVOKE_CAN_ASSUME',
  source_id: $source_id,
  target_id: $target_id,
  alert_id: $alert_id,
  timestamp: $timestamp,
  verified: false
})
RETURN count(rel) AS deleted_count, audit
```

- **Parameters**:
  ```json
  {
    "source_id": "ident-stage-payment-sa",
    "target_id": "ident-prod-deployer-role",
    "audit_id": "audit-482a01",
    "alert_id": "ALERT-9041",
    "timestamp": "2026-10-18T03:00:00Z"
  }
  ```

---

## 6. Simulated Mutation: Revoke Policy Attachment `HAS_POLICY`

**Purpose**: Detaches an over-privileged policy from an identity in the graph.

```cypher
MATCH (src:Identity {id: $source_id})-[rel:HAS_POLICY]->(tgt:PermissionPolicy {id: $target_id})
DELETE rel
CREATE (audit:RemediationAudit {
  id: $audit_id,
  action: 'REVOKE_HAS_POLICY',
  source_id: $source_id,
  target_id: $target_id,
  alert_id: $alert_id,
  timestamp: $timestamp,
  verified: false
})
RETURN count(rel) AS deleted_count, audit
```

---

## 7. Record Verification Result in FalkorDB Audit Store

**Purpose**: Updates the persisted audit record with the mathematical result of the verification query.

```cypher
MATCH (audit:RemediationAudit {id: $audit_id})
SET audit.verified = $verified,
    audit.remaining_paths = $remaining_paths,
    audit.verified_at = $timestamp
RETURN audit
```

---

## 8. Subgraph Projection for Visualization

**Purpose**: Fetches the exact neighborhood of nodes and connecting relationships involved in an investigation.

```cypher
MATCH (n)
WHERE n.id IN $node_ids
OPTIONAL MATCH (n)-[r]-(m)
WHERE m.id IN $node_ids
RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
```

---

## 9. Live Graph Summary & Health Telemetry

**Purpose**: Verifies database connectivity and returns live node and edge counts.

```cypher
MATCH (n)
OPTIONAL MATCH ()-[r]->()
RETURN count(DISTINCT n) AS node_count, count(DISTINCT r) AS relationship_count
```
