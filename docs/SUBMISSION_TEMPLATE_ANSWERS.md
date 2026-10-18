# 📝 WeMakeDevs FalkorDB Graph Hacks — Complete Submission Form Answers

Use these exact answers to fill out the two-part submission form at:
https://www.wemakedevs.org/hackathons/falkordb/submit

---

## PART 1 OF 2: PROJECT DETAILS

### 1. Project title *(required)*
```text
BlastGuard
```

---

### 2. Description *(required)*
*What problem does your project solve, and who is it for?*

```text
The Problem:
Cloud environments contain dense, interconnected networks of compute workloads, IAM identities, trust policies, and sensitive resources. Traditional security scanners generate thousands of isolated alerts (e.g. a vulnerable npm package on a staging pod, or an overly broad S3 policy in production). In isolation, a staging alert looks harmless. What point-in-time scanners fail to detect are transitive multi-hop attack paths: an attacker who compromises a staging workload can assume a cross-account identity that inherits wildcard permissions granting access to production customer databases. Relational databases cannot efficiently compute multi-hop reachability across dynamic depth boundaries.

The Solution:
BlastGuard models cloud infrastructure and access relationships in FalkorDB as the operational source of truth. When an alert triggers, our autonomous security agent executes parameterized Cypher queries to:
1. Discover the exact multi-hop privilege escalation path to Tier-0 crown jewels in sub-millisecond latency.
2. Evaluate collateral operational impact on legitimate business dependencies (e.g. preserving production backup agents).
3. Synthesize candidate surgical least-privilege remediations with Terraform HCL diffs.
4. Mutate the FalkorDB graph and recompute reachability.
5. Mathematically prove zero remaining attack paths and persist an immutable audit trail.

Who is it for?
Cloud Security Engineers, DevSecOps Teams, Platform Engineers, Infrastructure Security Teams, and Security Operations Center (SOC) Analysts.
```

---

### 3. What track are you submitting for? *(required)*
*Select all applicable tracks*

```text
Track 01: Agents That Act on Connected Data
```
*(Select the checkbox for Track 01)*

---

### 4. Repository *(required)*
*This is what your project gets listed and opened by.*

```text
https://github.com/Shreyansh00987/BLASTGUARD
```

---

### 5. Demo video *(required)*
*It should be a YouTube video demo link. Keep it public or unlisted, so we can access the video through the link.*

```text
https://youtu.be/xTaC8N873TI
```

---

### 6. Live demo or deployment
```text
https://blastguard-cloud.vercel.app
```
*(Alternative Mirror: https://blastguard-falkordb.vercel.app)*

---

### 7. How did you use FalkorDB in your project? *(required)*
*Tell us what technical problems you solved using FalkorDB*

```text
FalkorDB is the primary operational database and source of truth for BlastGuard's cloud relationship topology (named graph: blastguard_cloud_graph). We solved four critical technical challenges using FalkorDB:

1. Sub-Millisecond Multi-Hop Traversal:
Evaluating transitive attack paths across workloads, identities, trust boundaries, and policies requires variable-length path traversal. In relational databases, this requires expensive recursive CTEs or nested joins that degrade exponentially. With FalkorDB, we execute parameterized Cypher:
`MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO*1..6]->(target:Resource {tier: 'TIER_0_CRITICAL'}) RETURN path, length(path) AS hop_count ORDER BY hop_count ASC`
FalkorDB evaluates these traversals in under 0.2 milliseconds, allowing real-time investigation of active security incidents.

2. Neighborhood Analysis for Collateral Impact:
Automated security remediation often triggers outages because naive tools delete roles without knowing what depends on them. BlastGuard uses FalkorDB to traverse the incoming neighborhood of chokepoint identities to find modeled legitimate business dependencies (`ACTIVE_TRAFFIC_TO`). When it detects that `prod-nightly-backup-agent` relies on `ProductionDeployerRole`, the agent avoids deleting the role and instead surgically severs only the cross-account trust edge (`CAN_ASSUME`).

3. Live Graph Mutation & Mathematical Verification:
FalkorDB provides immediate consistency upon mutation. When a remediation is simulated, the agent deletes the offending relationship and re-runs the reachability traversal against the modified FalkorDB graph. If the traversal returns 0 paths, it proves mathematically that the threat vector is gone.

4. Audit Persistence:
Every remediation action and its verification query latency are committed as persistent nodes (`:RemediationAudit`) in FalkorDB, providing an immutable graph audit trail for compliance.
```

---

### 8. Blog link
*Write a blog post about your project, the problem you solve and your learnings, and share it here. The best blog post wins Apple AirPods 5.*

```text
https://dev.to/shreyansh_agrahari_2009db/trace-the-attack-cut-the-path-prove-its-gone-building-blastguard-with-falkordb-52ed
```

---

## PART 2 OF 2: FEEDBACK

### 1. What did you like about FalkorDB? *(required)*
```text
1. Blazing Fast Traversal Performance: The in-memory execution engine over the Redis RESP protocol delivers query latencies under 1ms even for 6-hop graph traversals. It is orders of magnitude faster and lighter than traditional graph databases.
2. Expressive openCypher Implementation: Writing variable-length path traversals, label-based filtering, and edge mutations felt completely natural. The Cypher dialect is intuitive, standards-compliant, and easy to inspect.
3. Clean Integration & Simplicity: Connecting via the official Python client (`falkordb-py`) was straightforward with minimal boilerplate, making it ideal for autonomous AI agent tool-calling workflows where latency and deterministic ground truth are paramount.
4. Lightweight Deployment: The official Docker image starts up in seconds with tiny memory overhead, making local testing and CI/CD integration effortless.
```

---

### 2. What improvements would you like to see in FalkorDB? *(required)*
```text
1. Native Windows Binary / Client Support: While Docker works smoothly, having native Windows binary releases or wheels would make zero-docker local Windows development even faster for developers without WSL2.
2. Built-in Web Browser GUI: A lightweight web GUI out-of-the-box (similar to RedisInsight or Neo4j Browser) bundled into the FalkorDB Docker container for visual schema exploration and ad-hoc Cypher execution would dramatically improve developer onboarding.
3. Native Graph Algorithms in Cypher: Expanding built-in procedures for graph algorithms like Dijkstra shortest-path, betweenness centrality (useful for finding identity chokepoints), and Louvain community detection directly accessible via Cypher calls.
4. Next.js / Edge Runtime TypeScript Client: An official HTTP/REST or serverless-optimized TypeScript SDK tailored for Next.js Edge/Serverless environments to query FalkorDB Cloud without persistent TCP socket connections.
```
