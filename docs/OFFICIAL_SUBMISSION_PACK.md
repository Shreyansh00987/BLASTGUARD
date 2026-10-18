# 🏆 WeMakeDevs FalkorDB Graph Hacks — Official Submission Pack

> **Direct Submission Link:** [https://www.wemakedevs.org/hackathons/falkordb/submit](https://www.wemakedevs.org/hackathons/falkordb/submit)

Everything you need to fill into the submission form is laid out below. Copy and paste each field directly into the form.

---

### 1. Track Selection
* **Track:** `Track 01 — Agents That Act on Connected Data`

---

### 2. Project Name
```text
BlastGuard
```

---

### 3. Tagline / Pitch
```text
Trace the attack. Cut the path. Prove it's gone.
```

---

### 4. Primary Repository URL (Public GitHub)
```text
https://github.com/Shreyansh00987/BLASTGUARD
```

---

### 5. Demo Video URL (YouTube)
```text
https://youtu.be/xTaC8N873TI
```

---

### 6. Live Hosted Application URL (Vercel)
```text
https://blastguard-cloud.vercel.app
```
*(Alternative Mirror: https://blastguard-falkordb.vercel.app)*

---

### 7. Technical Blog / Documentation URL (Dev.to)
```text
https://dev.to/shreyansh_agrahari_2009db/trace-the-attack-cut-the-path-prove-its-gone-building-blastguard-with-falkordb-52ed
```

---

### 8. Project Description / Long Summary (Copy-Paste Ready)
```markdown
BlastGuard is an autonomous cloud-security investigation and remediation platform powered by FalkorDB.

Cloud environments contain interconnected workloads, identities, permissions, and sensitive crown jewels. Looking at point-in-time alerts in isolation fails to reveal multi-hop attack paths. An attacker who compromises a staging workload can assume a cross-account identity that inherits wildcard permissions granting access to production databases.

BlastGuard models infrastructure and access relationships in FalkorDB as the operational source of truth. When an alert triggers, our autonomous agent executes parameterized variable-length Cypher queries to:
1. Discover the exact multi-hop privilege escalation path in sub-millisecond latency.
2. Evaluate collateral operational impact on legitimate business dependencies (e.g. preserving production backup agents).
3. Synthesize candidate surgical least-privilege remediations with Terraform HCL diffs.
4. Mutate the FalkorDB graph and recompute reachability.
5. Mathematically prove zero remaining attack paths and persist an immutable audit trail.
```

---

### 9. Graph Data Model & Cypher Traversals Summary
```markdown
- Database: FalkorDB (blastguard_cloud_graph)
- Core Node Labels: Workload, Identity, PermissionPolicy, Resource, Secret, SecurityAlert, RemediationAudit
- Core Relationship Types: EXECUTES_AS, CAN_ASSUME, HAS_POLICY, GRANTS_ACCESS_TO, ACTIVE_TRAFFIC_TO (legitimate traffic), STORES_SECRET, AUTHENTICATES
- Key Traversal:
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(target:Resource {tier: 'TIER_0_CRITICAL'})
RETURN path, length(path) AS hop_count ORDER BY hop_count ASC
```

---

### 10. AI-Assisted Development Disclosure
```markdown
Antigravity AI coding assistant was used to assist with boilerplate scaffolding, React Flow component assembly, and documentation authoring. The underlying graph architecture, parameterized Cypher queries, least-privilege remediation engine, and test suites were designed, implemented, and verified specifically for this hackathon submission.
```
