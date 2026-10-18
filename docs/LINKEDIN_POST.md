# 🛡️ BlastGuard: Trace the Attack. Cut the Path. Prove It's Gone.

> *How I built an autonomous, graph-powered cloud security investigation & remediation platform for the FalkorDB Graph Hacks Hackathon.*

---

## 📱 Short & Punchy LinkedIn Feed Post (Ready to Copy-Paste)

```markdown
🚀 Excited to introduce **BlastGuard** — an autonomous cloud security investigation & remediation platform powered by FalkorDB! 🛡️⚡

Built for the **FalkorDB Graph Hacks Hackathon** (@WeMakeDevs & @FalkorDB) under **Track 01: Agents That Act on Connected Data**.

💡 **The Big Problem in Cloud Security:**
Point-in-time scanners generate thousands of siloed alerts:
- A staging pod has a vulnerable npm package.
- An IAM policy allows wildcard S3 access.

In isolation, that staging pod looks low risk. But what isolated alerts hide is the **multi-hop attack path**:
`Compromised Staging Pod` ➔ `Service Account Token` ➔ `Assumes Production Deployer Role` ➔ `Accesses Production Customer Financial Backups`!

Relational databases and text search fail at dynamic multi-hop traversals. That's why I built **BlastGuard** with **FalkorDB** as the operational source of truth.

✨ **The Core Loop: Discover → Trace → Explain → Simulate → Verify**
1️⃣ **Discover:** Ingests alerts and queries FalkorDB to find all reachable Tier-0 Crown Jewels.
2️⃣ **Trace:** Sub-millisecond variable-length Cypher traversal maps the exact 4-hop privilege escalation path.
3️⃣ **Explain:** Performs collateral impact analysis — detects that `prod-nightly-backup-agent` legitimate service also relies on that role, so deleting the role would cause an outage!
4️⃣ **Simulate:** Proposes surgical remediation (revoking cross-account `CAN_ASSUME` trust via Terraform HCL).
5️⃣ **Verify:** Re-queries FalkorDB to mathematically prove **0 remaining attack paths**!

🌐 **Live Demo (Try it yourself!):** https://blastguard-cloud.vercel.app
*(Alternative link: https://blastguard-falkordb.vercel.app)*

📦 **GitHub Repo (Open Source):** https://github.com/Shreyansh00987/BLASTGUARD
🎬 **1-Min Demo Video with AI Voiceover:** https://github.com/Shreyansh00987/BLASTGUARD/blob/main/blastguard_demo_video.mp4

Special thanks to @WeMakeDevs, @Kunal Kushwaha, and the @FalkorDB team for organizing this incredible hackathon!

Would love to hear your feedback and thoughts from cloud security engineers, DevOps folks, and graph enthusiasts! 👇

#CloudSecurity #GraphDatabase #FalkorDB #CyberSecurity #DevSecOps #WeMakeDevs #BuildInPublic #OpenSource #NextJS #FastAPI #CloudArchitecture #IAM
```

---

## 📝 Long-Form Technical Article (For LinkedIn Articles, Dev.to, or Medium)

### Title:
# Trace the Attack. Cut the Path. Prove It's Gone: Building BlastGuard with FalkorDB

### Subtitle:
*How graph database traversals solve the transitive privilege escalation crisis in modern multi-cloud architectures.*

---

### Introduction: The Invisible Bridges in the Cloud

Modern cloud environments are dense networks of compute workloads, IAM roles, trust policies, service accounts, and data stores. 

When your container scanner triggers an alert on a staging Kubernetes pod with a remote code execution vulnerability, what is your initial reaction? Often, it gets deprioritized because *"it's just staging; there is no customer data there."*

**That assumption is often catastrophically wrong.**

In reality, cloud architectures are full of invisible bridges:
* That staging pod executes as a service account.
* That service account has trust permissions to assume an infrastructure deployment role in production (`sts:AssumeRole`).
* That production deployment role inherits a wildcard policy.
* That policy grants full read/write access to your company's crown jewels: the customer PII and backup database in production.

Looking at individual alerts or reading static JSON policy documents **cannot reveal transitive multi-hop attack paths**. 

To solve this, I designed and built **BlastGuard** — an autonomous cloud-security investigation and remediation platform powered by **FalkorDB**.

---

### Why FalkorDB?

Relational databases require costly, nested recursive joins to traverse arbitrary relationship depths. Text-based search engines cannot model directional graph semantics.

FalkorDB is uniquely suited for this challenge because:
1. **Low-Latency Cypher Traversals:** Variable-length relationship queries execute in sub-millisecond time (`O(k)` traversal latency where `k` is the path depth).
2. **Operational Source of Truth:** FalkorDB is not merely a decorative visualization cache; it actively decides which remediation actions are safe and mathematically verifies when attack paths are severed.
3. **Graph-Backed Agent Tools:** Rather than relying on LLMs to guess permissions, the autonomous security agent queries FalkorDB for deterministic graph facts.

---

### The Architecture: Discover ➔ Trace ➔ Explain ➔ Simulate ➔ Verify

BlastGuard implements a cohesive 5-step operational workflow:

```
[Security Alert Ingested]
       ↓
1. DISCOVER: Query FalkorDB from affected workload
       ↓
2. TRACE: Multi-hop Cypher traversal to Tier-0 crown jewels
       ↓
3. EXPLAIN: Inspect chokepoint policies & evaluate collateral impact
       ↓
4. SIMULATE: Apply surgical revocation to FalkorDB relationship
       ↓
5. VERIFY: Recompute graph reachability; mathematically prove 0 remaining paths
       ↓
[Persist FalkorDB Audit Record]
```

#### 1. Discover & Trace
When an engineer selects an incident (e.g. `ALERT-9041: Reverse Shell on Staging Pod`), BlastGuard runs a parameterized Cypher traversal:

```cypher
MATCH path = (w:Workload {id: $workload_id})
  -[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO*1..6]->
  (target:Resource {tier: 'TIER_0_CRITICAL'})
RETURN path, length(path) AS hop_count
ORDER BY hop_count ASC
```

Within microseconds, FalkorDB returns the exact multi-hop route reaching production crown jewels.

#### 2. Collateral Impact: Knowing What NOT to Break
The biggest fear in cloud remediation is causing a production outage. If an automated script blindly deletes an overly permissive role, critical production services might crash.

BlastGuard traverses the neighborhood of candidate chokepoint identities in FalkorDB to find modeled legitimate traffic (`ACTIVE_TRAFFIC_TO`). It detects that `prod-nightly-backup-agent` legitimate service also relies on that role.

Instead of deleting the production role, BlastGuard recommends the surgical least-privilege fix: **severing the cross-account `CAN_ASSUME` trust relationship** from staging to production. Staging is isolated, and production continuity is preserved!

#### 3. Simulation & Mathematical Verification
BlastGuard generates a proposed Terraform HCL diff. When the user approves the simulation:
1. BlastGuard applies the mutation directly to the FalkorDB graph.
2. A fresh verification traversal runs against the modified graph.
3. It proves mathematically that remaining reachable paths equal **0**.
4. The alert status transitions to **RESOLVED**, and an immutable audit record is persisted.

---

### Tech Stack

- **Primary Graph Database:** FalkorDB (Redis RESP protocol, low-latency graph traversals)
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, `@xyflow/react` for interactive graph rendering
- **Backend:** FastAPI, Python 3.11+, Pydantic
- **Deployment:** Vercel (Cloud Production) + Docker Compose (Local container orchestration)

---

### Try BlastGuard Live!

- 🌐 **Live Web Application:** [https://blastguard-cloud.vercel.app](https://blastguard-cloud.vercel.app)
- 📦 **Source Code on GitHub:** [https://github.com/Shreyansh00987/BLASTGUARD](https://github.com/Shreyansh00987/BLASTGUARD)
- 🎬 **Watch the 1-Minute Demo Video:** [https://github.com/Shreyansh00987/BLASTGUARD/blob/main/blastguard_demo_video.mp4](https://github.com/Shreyansh00987/BLASTGUARD/blob/main/blastguard_demo_video.mp4)
- 🏆 **Hackathon Track:** Track 01 — *Agents That Act on Connected Data* ([WeMakeDevs FalkorDB Hackathon](https://www.wemakedevs.org/hackathons/falkordb))

---

### Conclusion & What's Next

Graph databases change how we think about cloud infrastructure security. When you stop looking at individual vulnerabilities in isolation and start tracing connected relationship graphs, transitive threats become immediately visible and solvable.

I'd love to hear your thoughts, feedback, and questions in the comments!
