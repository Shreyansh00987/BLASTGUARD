# BlastGuard 2.5-Minute Hackathon Demo Script

A concise, step-by-step presentation script designed for recording the official hackathon submission video.

---

### **0:00 – 0:20: The Problem**

**Visual**: Open BlastGuard dashboard. Show the top navigation and the alert queue.

**Voiceover**:
> *"In modern cloud environments, security alerts don't exist in a vacuum. A security scanner flags a vulnerable staging Kubernetes pod. By itself, staging looks low risk. But what individual alerts and policy documents hide is the connected path of identities, trusts, and wildcard permissions that lead from that staging pod straight into production crown jewels.
>
> This is BlastGuard: an autonomous cloud-security investigation and remediation platform powered by FalkorDB."*

---

### **0:20 – 0:55: Graph Discovery**

**Visual**: Click on `ALERT-9041: Reverse Shell on Staging Pod`. The graph animates, highlighting the 4-hop attack path in animated red dashes.

**Voiceover**:
> *"When we select this alert, BlastGuard queries FalkorDB using variable-length Cypher traversal.
>
> In under a millisecond, FalkorDB traces the multi-hop attack path:
>
> 1. The compromised staging pod executes as `sa-payment-worker-stage`.
> 2. That service account can assume `ProductionDeployerRole` across accounts.
> 3. That production role has a wildcard backup admin policy attached.
> 4. And that policy grants unrestricted access to `prod-customer-pii-backups` — our Tier-0 customer financial archives!
>
> Without graph traversal, this 4-hop privilege escalation path remains completely invisible."*

---

### **0:55 – 1:25: Evidence & Impact Analysis**

**Visual**: Open the Evidence Panel. Expand the FalkorDB Cypher query and the Collateral Impact section. Click on `ProductionDeployerRole` in the graph to show the Node Inspector.

**Voiceover**:
> *"BlastGuard doesn't rely on black-box AI hallucinations. In the Evidence Panel, we see the exact parameterized Cypher query that executed against FalkorDB, along with its measured sub-millisecond execution time.
>
> Next, BlastGuard conducts a collateral impact assessment. Notice that in FalkorDB, a legitimate production service — `prod-nightly-backup-agent` — also relies on `ProductionDeployerRole`.
>
> If an automated tool blindly deleted the entire role, it would trigger a production outage! BlastGuard's graph engine recognizes this dependency and recommends the surgical least-privilege fix: severing the cross-account `CAN_ASSUME` relationship while keeping the production role alive."*

---

### **1:25 – 2:00: Remediation Simulation**

**Visual**: Click the **Simulate Remediation** button. The modal pops up showing the proposed mutation, safety check, and Terraform HCL diff. Click **Apply Simulation & Verify in Graph**.

**Voiceover**:
> *"Let's click Simulate Remediation.
>
> BlastGuard presents an interactive confirmation dialog with a proposed Terraform HCL diff that tightens the IAM role trust policy.
>
> When we confirm, BlastGuard applies the mutation directly to the FalkorDB graph, removing the dangerous trust edge."*

---

### **2:00 – 2:30: Verification & Proof**

**Visual**: The Verification Proof Modal pops up. Shows `Previous Threat Paths: 1`, `Remaining Threat Paths: 0`, and the live verification Cypher query. Then close modal to show the updated severed graph and open the Audit Log.

**Voiceover**:
> *"Here is the defining experience of BlastGuard:
>
> Immediately after the mutation, BlastGuard re-runs the reachability traversal query against FalkorDB.
>
> This is not a frontend mock or an LLM claim — FalkorDB mathematically confirms that remaining reachable paths equals zero!
>
> The threat path has vanished from the graph, legitimate backup traffic continues uninterrupted, and a permanent, auditable record is persisted in FalkorDB.
>
> BlastGuard turns connected infrastructure data into an explainable security action — and proves the outcome in the graph."*
