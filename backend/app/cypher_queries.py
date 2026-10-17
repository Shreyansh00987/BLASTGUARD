"""
Central Repository of Parameterized Cypher Queries for BlastGuard.
Every query executed against FalkorDB is defined here with explicit documentation
of its parameters, graph traversal semantics, and return contract.
"""

# 1. Attack Path Discovery: Find all paths up to 6 hops from an affected entry workload to any Tier-0 Critical Resource
ATTACK_PATH_DISCOVERY_QUERY = """
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN path, nodes(path) AS path_nodes, relationships(path) AS path_rels, length(path) AS hop_count
ORDER BY length(path) ASC
LIMIT 10
"""

# 2. Recompute Reachability: Count and return any remaining attack paths after mutation
RECOMPUTE_REACHABILITY_QUERY = """
MATCH path = (w:Workload {id: $workload_id})-[:EXECUTES_AS|CAN_ASSUME|HAS_POLICY|GRANTS_ACCESS_TO|STORES_SECRET|AUTHENTICATES*1..6]->(r:Resource {tier: 'TIER_0_CRITICAL'})
RETURN count(path) AS remaining_paths, collect(path) AS paths
"""

# 3. Neighborhood Retrieval: Retrieve nodes and edges for subgraph visualization
SUBGRAPH_NEIGHBORHOOD_QUERY = """
MATCH (n)
WHERE n.id IN $node_ids
OPTIONAL MATCH (n)-[r]-(m)
WHERE m.id IN $node_ids
RETURN collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
"""

# 4. Inspect Permission Policy Details and Attached Entities
INSPECT_POLICY_QUERY = """
MATCH (p:PermissionPolicy {id: $policy_id})
OPTIONAL MATCH (i:Identity)-[:HAS_POLICY]->(p)
OPTIONAL MATCH (p)-[:GRANTS_ACCESS_TO]->(r:Resource)
RETURN p, collect(DISTINCT i) AS identities, collect(DISTINCT r) AS resources
"""

# 5. Collateral Impact: Discover legitimate workloads executing as target identity and active traffic dependencies
COLLATERAL_IMPACT_QUERY = """
MATCH (i:Identity {id: $identity_id})<-[:EXECUTES_AS]-(w:Workload)
OPTIONAL MATCH (w)-[t:ACTIVE_TRAFFIC_TO]->(r:Resource)
RETURN w, i, collect(DISTINCT r) AS active_resources
"""

# 6. Simulate Revocation of CAN_ASSUME Relationship
REVOKE_CAN_ASSUME_MUTATION = """
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
"""

# 7. Simulate Revocation of HAS_POLICY Relationship
REVOKE_HAS_POLICY_MUTATION = """
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
"""

# 8. Record Audit Verification Result in FalkorDB
RECORD_AUDIT_VERIFICATION_MUTATION = """
MATCH (audit:RemediationAudit {id: $audit_id})
SET audit.verified = $verified,
    audit.remaining_paths = $remaining_paths,
    audit.verified_at = $timestamp
RETURN audit
"""

# 9. Graph Health and Topology Summary
GRAPH_SUMMARY_QUERY = """
MATCH (n)
OPTIONAL MATCH ()-[r]->()
RETURN count(DISTINCT n) AS node_count, count(DISTINCT r) AS relationship_count
"""

# 10. Audit History Query
AUDIT_HISTORY_QUERY = """
MATCH (a:RemediationAudit)
RETURN a.id AS id, a.timestamp AS timestamp, a.alert_id AS alert_id,
       a.action AS action, a.source_id AS source_id, a.target_id AS target_id,
       a.remaining_paths AS remaining_paths, a.verified AS verified,
       a.verified_at AS verified_at
ORDER BY a.timestamp DESC
LIMIT 50
"""
