# BlastGuard Technical Walkthrough

A comprehensive technical defense and explanation of BlastGuard for judges, security engineers, and developers.

---

## 1. Why FalkorDB is Strictly Required

In cloud security, individual resources, IAM policies, and alerts are stored in disconnected silos. A staging workload compromise alert in Wazuh or Falco gives no hint that an IAM role can be assumed, which in turn inherits a policy granting full S3 read permissions to production customer archives.

Relational databases and document stores struggle with multi-hop reachability:
- Recursive SQL CTEs or multi-table self-joins on arbitrary relationship depths (`1..6` hops) are computationally expensive and awkward to model.
- Vector search or text search over IAM policies only finds policies whose textual descriptions mention keywords, completely missing transitive access paths created by chaining disparate permissions across accounts.

**FalkorDB** provides an in-memory graph database built on GraphBLAS sparse matrix linear algebra:
- Path traversals are executed as matrix operations with microsecond-level latency (typically `< 1ms`).
- Variable-length path discovery (`(w:Workload)-[...*1..6]->(r:Resource)`) is native to Cypher.
- FalkorDB allows live graph mutations (`DELETE rel`) followed immediately by graph traversal recomputations, providing instantaneous verification.

Without FalkorDB, BlastGuard would degrade into an ordinary alert viewer with hardcoded mock paths. FalkorDB is the operational calculation engine for every threat path, impact assessment, and verification in BlastGuard.

---

## 2. How the Graph Model Works

The graph represents five primary entity classes and their relationships:
1. **Workloads** (`:Workload`): Execution environments (e.g. Kubernetes pods, EC2 instances, ALB gateways).
2. **Identities** (`:Identity`): IAM roles and service accounts. Workloads connect via `-[:EXECUTES_AS]->`.
3. **Policies** (`:PermissionPolicy`): IAM permissions attached to identities via `-[:HAS_POLICY]->`.
4. **Resources** (`:Resource`): Cloud assets categorized by criticality (`TIER_0_CRITICAL` for crown jewels like customer PII backups, financial ledgers, or root encryption keys). Policies grant access via `-[:GRANTS_ACCESS_TO]->`.
5. **Secrets** (`:Secret`): Hardcoded tokens or CI/CD keys connected via `-[:STORES_SECRET]->` and `-[:AUTHENTICATES]->`.

Crucially, the graph also models **legitimate operational dependencies**:
- `(:Workload {id: "wkld-prod-backup-service"})-[:EXECUTES_AS]->(:Identity {id: "ident-prod-deployer-role"})`
- `(:Workload {id: "wkld-prod-backup-service"})-[:ACTIVE_TRAFFIC_TO]->(:Resource {id: "res-prod-customer-backups"})`

This dual representation of attack vectors and legitimate traffic enables BlastGuard to distinguish between naive remediation (destroying the role and causing an outage) and surgical least-privilege remediation (revoking the cross-account `CAN_ASSUME` relationship).

---

## 3. How the Primary Traversal Works

When an alert is investigated, the backend retrieves the alert's `entry_node_id` and executes:

```cypher
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN path, nodes(path) AS path_nodes, relationships(path) AS path_rels, length(path) AS hop_count
ORDER BY length(path) ASC
LIMIT 10
```

- **Traversal Mechanics**: The query performs a bounded breadth-first traversal matching valid permission transition edges.
- **Cycle Prevention**: Paths with duplicate nodes are avoided.
- **Result Set**: Returns the ordered sequence of nodes and relationships, the hop count, and the destination crown jewel.

---

## 4. How Remediation Simulation Changes the Graph

When the security engineer clicks **Simulate Remediation** and confirms the action:
1. The backend executes a targeted mutation Cypher query:
   ```cypher
   MATCH (src:Identity {id: $source_id})-[rel:CAN_ASSUME]->(tgt:Identity {id: $target_id})
   DELETE rel
   ```
2. The specific directed edge is removed from FalkorDB's active graph topology.
3. A `:RemediationAudit` node is inserted with a timestamp, action type, source, target, and `verified = false`.

---

## 5. How Verification Mathematically Establishes the Outcome

Immediately after the mutation, BlastGuard re-runs the reachability traversal query against FalkorDB:

```cypher
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN count(path) AS remaining_paths, collect(path) AS paths
```

- **Outcome Determination**:
  - If `remaining_paths == 0`: BlastGuard flags the remediation as `VERIFIED CLEAN` in FalkorDB, sets `audit.verified = true`, and highlights the severed path.
  - If `remaining_paths > 0`: BlastGuard honestly flags `PARTIAL REMEDIATION`, renders the remaining alternate paths, and alerts the operator that further chokepoint tightening is needed.
- **No Animations / No LLM Assertions**: The verification outcome comes directly from FalkorDB query execution.

---

## 6. Agent Architecture: Deterministic vs. LLM Decisions

BlastGuard strictly adheres to the principle: **The graph is truth; the AI provides human-readable synthesis.**

| Decision / Task | Engine | Rationale |
|---|---|---|
| Finding attack paths | **FalkorDB Cypher** | Mathematical graph traversal cannot be hallucinated. |
| Identifying chokepoints | **Deterministic Graph Logic** | Identifies cut-vertices and high-leverage edges. |
| Assessing collateral impact | **FalkorDB Cypher** | Queries modeled `ACTIVE_TRAFFIC_TO` dependencies. |
| Graph mutation | **FalkorDB Cypher** | Only parameterized, validated backend mutations allowed. |
| Verification | **FalkorDB Cypher** | Fresh query count of remaining paths. |
| Narrative Incident Summary | **AI Agent / Grounded Fallback** | Synthesizes FalkorDB facts into an executive summary. |
| Terraform HCL Diff Generation | **Deterministic HCL Templates** | Generates valid, syntax-checked infrastructure diffs. |

If an external LLM API key (`GEMINI_API_KEY` or `OPENAI_API_KEY`) is not configured, BlastGuard falls back to a deterministic, evidence-grounded summary without losing a single capability.

---

## 7. How to Run Backend Tests

The backend test suite verifies every graph query, impact check, mutation, and API endpoint:

```bash
# From repository root
$env:PYTHONPATH="backend"; python -m pytest backend/tests -v
```

All 8 tests run against the graph engine and verify end-to-end functionality.

---

## 8. What the System Cannot Prove (Boundaries & Honest Scope)

Honesty is a core hackathon requirement:
1. **Modeled Dependencies vs. Production Reality**: BlastGuard can only analyze dependencies that have been modeled as relationships in the graph. If an undeclared microservice connects to a resource without an edge in FalkorDB, BlastGuard cannot predict its outage.
2. **Synthetic Data**: All workloads, identities, ARNs, and IP addresses in the demo are fictional and synthetic. BlastGuard does not connect to live AWS or production cloud telemetry.
3. **Cloud IAM Context Limits**: Real AWS IAM evaluates session policies, service control policies (SCPs), permission boundaries, and condition keys (e.g. `aws:SourceIp`). BlastGuard models the primary structural relationships (`sts:AssumeRole`, wildcard policy grants), but does not evaluate arbitrary runtime condition expressions.

---

## 9. How to Explain BlastGuard to a Hackathon Judge in 30 Seconds

> *"Most cloud security tools alert on symptoms — like an unpatched pod in staging. BlastGuard connects workloads, identities, policies, and secrets into FalkorDB to find the hidden multi-hop path from that staging pod all the way to production customer backups.*
>
> *Before applying a fix, BlastGuard queries FalkorDB to check which legitimate production services rely on that identity, recommending a least-privilege fix that cuts the attack path without breaking production. Finally, BlastGuard re-runs the traversal against FalkorDB to prove mathematically that the threat path is gone."*
