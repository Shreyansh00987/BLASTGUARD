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
  ZoomIn,
  ZoomOut,
  Crosshair,
  Sparkles,
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
  const { fitView, zoomIn, zoomOut, zoomTo, setCenter } = useReactFlow();

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

  // Intelligent, compact deterministic layout (Guarantees zero overlap & readable scale)
  const flowNodes: Node[] = useMemo(() => {
    if (!nodes.length) return [];

    // Precise coordinates matching both node ID and name patterns
    const knownPositions: Record<string, { x: number; y: number }> = {
      // Alert 1: Staging Reverse Shell -> Production DB/KMS
      "wkld-stage-payment-worker": { x: 40, y: 160 },
      "staging-payment-worker": { x: 40, y: 160 },

      "ident-stage-payment-sa": { x: 310, y: 160 },
      "sa-payment-worker-stage": { x: 310, y: 160 },

      "ident-prod-deployer-role": { x: 580, y: 160 },
      "role-cross-env-deployer": { x: 580, y: 160 },
      "role-cicd-runner-deployer": { x: 580, y: 160 },

      // Legitimate operational workload (Separated into upper lane)
      "wkld-prod-backup-service": { x: 580, y: -60 },
      "prod-nightly-backup-agent": { x: 580, y: -60 },

      // Policies (Forked upper & lower)
      "pol-prod-s3-backup-admin": { x: 850, y: 70 },
      "PolicyS3CustomerBackupFullAccess": { x: 850, y: 70 },
      "pol-customer-backup-full-access": { x: 850, y: 70 },

      "pol-prod-kms-master-decrypt": { x: 850, y: 260 },
      "PolicyKMSMasterDecryptKey": { x: 850, y: 260 },
      "pol-prod-master-decrypt": { x: 850, y: 260 },

      // Crown Jewels
      "res-s3-prod-customer-pii": { x: 1120, y: 70 },
      "prod-customer-pii-backups": { x: 1120, y: 70 },
      "db-prod-customer-aurora-cluster": { x: 1120, y: 70 },

      "res-kms-prod-envelope-key": { x: 1120, y: 260 },
      "prod-master-envelope-key": { x: 1120, y: 260 },
      "secret-kms-customer-master-key": { x: 1120, y: 260 },

      // Alert 2: CI/CD Secret Exposure
      "wkld-ci-batch-runner": { x: 40, y: 160 },
      "ci-cd-build-runner-04": { x: 40, y: 160 },
      "sec-github-deployer-token": { x: 310, y: 160 },
      "ident-ci-deployer-role": { x: 580, y: 160 },
      "pol-prod-rds-superuser": { x: 850, y: 160 },
      "res-prod-customer-aurora-db": { x: 1120, y: 160 },

      // Alert 3: Ingress Gateway KMS Decrypt
      "wkld-public-ingress-gateway": { x: 40, y: 160 },
      "prod-ingress-gateway-alb": { x: 40, y: 160 },
      "ident-ingress-gateway-role": { x: 310, y: 160 },
      "pol-prod-kms-wildcard-decrypt": { x: 580, y: 160 },
    };

    // Fallback column assignment for any custom nodes
    const getColIndex = (node: IGraphNode) => {
      const type = node.node_type;
      const id = node.id.toLowerCase();
      const name = (node.properties?.name || "").toLowerCase();
      if (type === "Workload" && !id.includes("backup") && !name.includes("backup")) return 0;
      if (type === "Secret") return 1;
      if (type === "Identity" && (id.includes("stage") || name.includes("stage"))) return 1;
      if (type === "Identity") return 2;
      if (type === "PermissionPolicy") return 3;
      if (type === "Resource") return 4;
      return 1;
    };

    // Calculate layout for each node
    const result: Node[] = [];
    const colCounters: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

    nodes.forEach((n) => {
      const matchKey = knownPositions[n.id] ? n.id : n.properties?.name;
      let pos = matchKey ? knownPositions[matchKey] : undefined;

      if (!pos) {
        const col = getColIndex(n);
        const idxInCol = colCounters[col] || 0;
        colCounters[col] = idxInCol + 1;
        pos = {
          x: 40 + col * 270,
          y: 70 + idxInCol * 190,
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

  // High-contrast, clear edge labels
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
          fill: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#334155",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 11,
          fontWeight: 700,
        },
        labelBgStyle: {
          fill: "#FFFFFF",
          fillOpacity: 0.98,
        },
        labelBgPadding: [7, 3.5],
        labelBgBorderRadius: 5,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#94A3B8",
          width: 20,
          height: 20,
        },
        style: {
          stroke: isAttack ? "#DC2626" : isLegit ? "#0284C7" : "#CBD5E1",
          strokeWidth: isAttack ? 3.0 : isLegit ? 2.0 : 1.4,
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
      {/* 1. Horizontal Attack Progression Tracker & Action Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-sans shadow-sm z-10 flex-wrap">
        {/* Left: Progression Stages */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
            Attack Vector:
          </span>

          {isRemediatedClean ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs shadow-sm animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>THREAT SEVERED · 0 ACTIVE ATTACK PATHS IN FALKORDB</span>
            </div>
          ) : (
            <>
              {/* Stage 1: Compromised Workload */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-red-800 font-bold text-xs whitespace-nowrap shadow-sm">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-extrabold">1</span>
                <span>Compromised Pod</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              {/* Stage 2: IAM Identity */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs whitespace-nowrap shadow-sm">
                <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-extrabold">2</span>
                <span>Escalated IAM Role</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              {/* Stage 3: Wildcard Policy */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs whitespace-nowrap shadow-sm">
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-extrabold">3</span>
                <span>Excessive Policy</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

              {/* Stage 4: Crown Jewels */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs whitespace-nowrap shadow-sm">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-extrabold">4</span>
                <span>Crown Jewels (Aurora DB / KMS)</span>
              </div>
            </>
          )}
        </div>

        {/* Right: Quick View Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => zoomIn({ duration: 250 })}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomOut({ duration: 250 })}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomTo(1.0, { duration: 300 })}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold font-mono transition-colors shadow-sm"
            title="Reset Zoom to 100% (Crisp 1:1 view)"
          >
            100%
          </button>
          <button
            onClick={() => fitView({ padding: 0.12, duration: 300 })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
            title="Auto-fit graph to window"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Fit Graph</span>
          </button>

          {attackPaths.length > 0 && !isRemediatedClean && onOpenRemediateModal && (
            <button
              onClick={onOpenRemediateModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans transition-all shadow-sm active:scale-95 ml-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Fix</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Status HUD Bar */}
      <div className="h-9 px-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between z-10 text-xs font-sans">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Layers className="w-2.5 h-2.5" />
          </div>
          <span className="text-slate-900 font-bold uppercase tracking-wide text-[11px]">
            ATTACK GRAPH CANVAS
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-600 text-xs font-medium">FalkorDB Subgraph Projection</span>
        </div>

        {isRemediatedClean ? (
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 border border-emerald-300 px-3 py-0.5 rounded-full shadow-sm animate-in fade-in">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>THREAT SEVERED · ZERO REACHABLE CROWN JEWELS</span>
          </div>
        ) : attackPaths.length > 0 ? (
          <div className="flex items-center gap-1.5 text-red-800 font-bold bg-red-50 border border-red-300 px-3 py-0.5 rounded-full shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            <span>{attackPaths.length} MULTI-HOP ATTACK PATH(S) DETECTED</span>
          </div>
        ) : (
          <div className="text-slate-500 text-xs">Select an incident to run graph traversal</div>
        )}
      </div>

      {/* 3. Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-slate-50/50">
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
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
          fitViewOptions={{ padding: 0.1, minZoom: 0.7, maxZoom: 1.0 }}
          minZoom={0.3}
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
        <div className="absolute bottom-4 left-44 z-10 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-xl text-xs font-sans shadow-sm select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600" />
            <span className="text-slate-800 font-semibold">Workload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-600" />
            <span className="text-slate-800 font-semibold">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-600" />
            <span className="text-slate-800 font-semibold">Policy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500" />
            <span className="text-amber-900 font-bold">Crown Jewel (Tier-0)</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1.5 bg-red-600 rounded-full" />
            <span className="text-red-700 font-bold">Attack Traversal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-sky-600 border-dashed" />
            <span className="text-sky-800 font-semibold">Modeled Legitimate Traffic</span>
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
