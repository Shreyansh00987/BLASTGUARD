"use client";

import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomSecurityNode from "./nodes/CustomSecurityNode";
import { GraphNode as IGraphNode, GraphEdge as IGraphEdge, AttackPath } from "@/lib/types";
import {
  ShieldCheck,
  AlertTriangle,
  Layers,
  Info,
  Database,
  ArrowRight,
  Maximize2,
  Lock,
  Server,
  Key,
  ShieldAlert,
} from "lucide-react";

interface GraphWorkspaceProps {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  attackPaths: AttackPath[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isLoading: boolean;
  isRemediatedClean: boolean;
  onOpenRemediateModal?: () => void;
}

const nodeTypes = {
  customSecurity: CustomSecurityNode,
};

const FlowWorkspaceInner: React.FC<GraphWorkspaceProps> = ({
  nodes,
  edges,
  attackPaths,
  selectedNodeId,
  onSelectNode,
  isLoading,
  isRemediatedClean,
  onOpenRemediateModal,
}) => {
  const { fitView } = useReactFlow();

  // Collect all node IDs and edge IDs on active attack paths
  const attackNodeIds = useMemo(() => {
    const set = new Set<string>();
    attackPaths.forEach((p) => p.node_ids.forEach((id) => set.add(id)));
    return set;
  }, [attackPaths]);

  const attackEdgeIds = useMemo(() => {
    const set = new Set<string>();
    attackPaths.forEach((p) => p.edge_ids.forEach((id) => set.add(id)));
    return set;
  }, [attackPaths]);

  // Intelligent, non-overlapping deterministic layout for security graphs
  const flowNodes: Node[] = useMemo(() => {
    if (!nodes.length) return [];

    // Distinct positions for key scenario nodes to guarantee 0% overlap
    const fixedLayout: Record<string, { x: number; y: number }> = {
      // Alert 1: Reverse shell
      "wkld-stage-payment-worker": { x: 80, y: 200 },
      "sa-payment-worker-stage": { x: 480, y: 200 },
      "role-cicd-runner-deployer": { x: 880, y: 200 },
      "wkld-prod-nightly-backup-agent": { x: 880, y: -90 }, // Legitimate agent placed safely above
      "pol-customer-backup-full-access": { x: 1300, y: 80 },
      "pol-prod-master-decrypt": { x: 1300, y: 320 },
      "db-prod-customer-aurora-cluster": { x: 1720, y: 80 },
      "secret-kms-customer-master-key": { x: 1720, y: 320 },

      // Alert 2: Hardcoded CI/CD Token
      "wkld-ci-cd-runner": { x: 80, y: 200 },
      "sec-gh-actions-token": { x: 480, y: 200 },

      // Alert 3: Ingress Gateway
      "wkld-prod-ingress-gw": { x: 80, y: 200 },
      "role-ingress-gw-identity": { x: 480, y: 200 },
      "pol-wildcard-kms-decrypt": { x: 1300, y: 200 },
    };

    // Fallback column calculation for any other node
    const getColumnIndex = (node: IGraphNode) => {
      const type = node.node_type;
      const id = node.id.toLowerCase();
      if (type === "Workload" && !id.includes("backup")) return 0;
      if (type === "Secret") return 1;
      if (type === "Identity" && id.includes("stage")) return 1;
      if (type === "Identity") return 2;
      if (type === "Workload" && id.includes("backup")) return 2; // handled in fixed or swimlane
      if (type === "PermissionPolicy") return 3;
      if (type === "Resource") return 4;
      return 1;
    };

    // Group remaining nodes by column
    const colBuckets: Record<number, IGraphNode[]> = {};
    nodes.forEach((n) => {
      if (!fixedLayout[n.id]) {
        const col = getColumnIndex(n);
        colBuckets[col] = colBuckets[col] || [];
        colBuckets[col].push(n);
      }
    });

    const result: Node[] = [];

    // Add fixed positioned nodes
    nodes.forEach((n) => {
      let pos = fixedLayout[n.id];
      if (!pos) {
        const col = getColumnIndex(n);
        const colNodes = colBuckets[col] || [n];
        const idx = colNodes.indexOf(n);
        const total = colNodes.length;
        const startY = 200 - ((total - 1) * 220) / 2;
        pos = {
          x: 80 + col * 400,
          y: startY + idx * 220,
        };
      }

      result.push({
        id: n.id,
        type: "customSecurity",
        position: pos,
        selected: n.id === selectedNodeId,
        data: {
          id: n.id,
          label: n.display_name,
          nodeType: n.node_type,
          properties: n.properties,
          isOnAttackPath: attackNodeIds.has(n.id),
          isRemediated: isRemediatedClean,
        },
      });
    });

    return result;
  }, [nodes, selectedNodeId, attackNodeIds, isRemediatedClean]);

  // High contrast edges for Light Mode
  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((e) => {
      const isAttack = attackEdgeIds.has(e.id);
      const isLegit = e.is_legitimate_dependency || e.type === "ACTIVE_TRAFFIC_TO";

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: `[:${e.type}]`,
        animated: isAttack,
        className: isAttack ? "attack-path-edge" : isLegit ? "legitimate-edge" : "default-edge",
        labelStyle: {
          fill: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#475569",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 9.5,
          fontWeight: isAttack ? 700 : 600,
        },
        labelBgStyle: {
          fill: "#FFFFFF",
          fillOpacity: 0.95,
        },
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#94A3B8",
          width: 18,
          height: 18,
        },
        style: {
          stroke: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#CBD5E1",
          strokeWidth: isAttack ? 2.6 : isLegit ? 1.8 : 1.3,
        },
      };
    });
  }, [edges, attackEdgeIds]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  return (
    <div className="flex-1 h-full relative bg-canvas flex flex-col overflow-hidden">
      {/* 1. Horizontal Attack Progression Pipeline Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-mono shadow-sm z-10">
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline mr-1">
            Attack Vector:
          </span>

          {/* Stage 1: Workload Breach */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 font-semibold text-[11px] whitespace-nowrap shadow-sm">
            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">1</span>
            <span>Compromised Pod</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {/* Stage 2: IAM Identity */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-semibold text-[11px] whitespace-nowrap shadow-sm">
            <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">2</span>
            <span>Escalated IAM Role</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {/* Stage 3: Wildcard Policy */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[11px] whitespace-nowrap shadow-sm">
            <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] font-bold">3</span>
            <span>Excessive Policy</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

          {/* Stage 4: Crown Jewel Database */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-800 font-bold text-[11px] whitespace-nowrap shadow-sm">
            <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold">4</span>
            <span>Crown Jewels (Aurora DB / KMS)</span>
          </div>
        </div>

        {/* View Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fitView({ padding: 0.18, duration: 400 })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium transition-colors shadow-sm"
            title="Auto-fit all graph nodes in viewport"
          >
            <Maximize2 className="w-3 h-3 text-slate-500" />
            <span className="hidden md:inline">Fit Graph</span>
          </button>
        </div>
      </div>

      {/* 2. Top Canvas Status Bar */}
      <div className="h-9 px-4 border-b border-slate-200/90 bg-slate-50/90 flex items-center justify-between z-10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Layers className="w-2.5 h-2.5" />
          </div>
          <span className="text-slate-900 font-bold">ATTACK GRAPH CANVAS</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 text-[11px]">FalkorDB Subgraph Projection</span>
        </div>

        {isRemediatedClean ? (
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-sm animate-in fade-in">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>THREAT SEVERED · ZERO REACHABLE CROWN JEWELS</span>
          </div>
        ) : attackPaths.length > 0 ? (
          <div className="flex items-center gap-1.5 text-red-800 font-bold bg-red-50 border border-red-300 px-2.5 py-0.5 rounded-full shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>{attackPaths.length} MULTI-HOP ATTACK PATH(S) DETECTED</span>
          </div>
        ) : (
          <div className="text-slate-500 text-[11px]">Select an incident to run graph traversal</div>
        )}
      </div>

      {/* 3. Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-slate-50/40">
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm">
            <div className="relative flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
              <Database className="w-4 h-4 text-indigo-600 absolute" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-800">Executing FalkorDB Cypher Traversal...</p>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">Multi-hop graph reachability calculation</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-indigo-600 mb-3 shadow-sm">
              <Info className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 font-mono mb-1">
              Select a Security Alert to Trace Multi-Hop Path
            </h3>
            <p className="text-[11px] text-slate-500 max-w-md leading-relaxed">
              BlastGuard traverses live FalkorDB relationships to uncover escalation routes from compute pods to sensitive production databases.
            </p>
          </div>
        ) : null}

        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#CBD5E1" gap={22} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            nodeColor={(node) => {
              if (node.data?.nodeType === "Resource") return "#D97706";
              if (node.data?.nodeType === "Workload") return "#4F46E5";
              if (node.data?.nodeType === "Identity") return "#7C3AED";
              if (node.data?.nodeType === "PermissionPolicy") return "#E11D48";
              return "#0284C7";
            }}
            maskColor="rgba(248, 250, 252, 0.75)"
            className="!bg-white !border !border-slate-200 !rounded-xl !shadow-sm"
          />
        </ReactFlow>

        {/* 4. Canvas Floating Legend Bar */}
        <div className="absolute bottom-4 left-44 z-10 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-md border border-slate-200 px-3.5 py-1.5 rounded-lg text-[10px] font-mono shadow-sm select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span className="text-slate-700 font-medium">Workload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-purple-600" />
            <span className="text-slate-700 font-medium">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
            <span className="text-slate-700 font-medium">Policy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-amber-800 font-bold">Crown Jewel (Tier-0)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-red-600 rounded-full" />
            <span className="text-red-700 font-bold">Attack Traversal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-sky-600 border-dashed" />
            <span className="text-sky-700 font-medium">Modeled Legitimate Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GraphWorkspace: React.FC<GraphWorkspaceProps> = (props) => {
  return (
    <ReactFlowProvider>
      <FlowWorkspaceInner {...props} />
    </ReactFlowProvider>
  );
};
