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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomSecurityNode from "./nodes/CustomSecurityNode";
import { GraphNode as IGraphNode, GraphEdge as IGraphEdge, AttackPath } from "@/lib/types";
import { ShieldCheck, AlertTriangle, Layers, Info, Sparkles, Database } from "lucide-react";

interface GraphWorkspaceProps {
  nodes: IGraphNode[];
  edges: IGraphEdge[];
  attackPaths: AttackPath[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  isLoading: boolean;
  isRemediatedClean: boolean;
}

const nodeTypes = {
  customSecurity: CustomSecurityNode,
};

export const GraphWorkspace: React.FC<GraphWorkspaceProps> = ({
  nodes,
  edges,
  attackPaths,
  selectedNodeId,
  onSelectNode,
  isLoading,
  isRemediatedClean,
}) => {
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

  // Layout nodes horizontally based on graph role
  const flowNodes: Node[] = useMemo(() => {
    if (!nodes.length) return [];

    const getColumnIndex = (node: IGraphNode) => {
      const type = node.node_type;
      const id = node.id;
      if (type === "Workload" && id.includes("stage")) return 0;
      if (type === "Workload" && id.includes("ci")) return 0;
      if (type === "Secret") return 0.8;
      if (type === "Workload" && id.includes("ingress")) return 0;
      if (type === "Identity" && id.includes("stage")) return 1;
      if (type === "Identity" && id.includes("ci")) return 1.5;
      if (type === "Identity" && id.includes("ingress")) return 1;
      if (type === "Identity" && id.includes("prod")) return 2;
      if (type === "PermissionPolicy") return 3;
      if (type === "Resource") return 4;
      if (type === "Workload" && id.includes("prod")) return 2.6;
      return 1;
    };

    const colBuckets: Record<number, IGraphNode[]> = {};
    nodes.forEach((n) => {
      const col = getColumnIndex(n);
      colBuckets[col] = colBuckets[col] || [];
      colBuckets[col].push(n);
    });

    const result: Node[] = [];

    Object.entries(colBuckets).forEach(([colStr, colNodes]) => {
      const col = parseFloat(colStr);
      const x = 60 + col * 330;
      const totalInCol = colNodes.length;
      const startY = 120 - ((totalInCol - 1) * 150) / 2;

      colNodes.forEach((node, idx) => {
        const y = startY + idx * 165;
        result.push({
          id: node.id,
          type: "customSecurity",
          position: { x, y: Math.max(40, y) },
          selected: node.id === selectedNodeId,
          data: {
            id: node.id,
            label: node.display_name,
            nodeType: node.node_type,
            properties: node.properties,
            isOnAttackPath: attackNodeIds.has(node.id),
            isRemediated: isRemediatedClean,
          },
        });
      });
    });

    return result;
  }, [nodes, selectedNodeId, attackNodeIds, isRemediatedClean]);

  // Edges with laser-gradient effects
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
          fill: isAttack ? "#FF3B30" : isLegit ? "#06B6D4" : "#94A3B8",
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: 9.5,
          fontWeight: isAttack ? 700 : 500,
        },
        labelBgStyle: {
          fill: "#0D1017",
          fillOpacity: 0.95,
        },
        labelBgPadding: [5, 2.5],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAttack ? "#FF3B30" : isLegit ? "#06B6D4" : "#4A5568",
          width: 17,
          height: 17,
        },
        style: {
          stroke: isAttack ? "#FF3B30" : isLegit ? "#06B6D4" : "#334155",
          strokeWidth: isAttack ? 2.8 : isLegit ? 1.8 : 1.3,
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
      {/* Top HUD Status Bar */}
      <div className="h-10 px-4 border-b border-border/80 bg-surface/80 backdrop-blur-md flex items-center justify-between z-10 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
            <Layers className="w-3 h-3" />
          </div>
          <span className="text-text-primary font-bold">ATTACK GRAPH CANVAS</span>
          <span className="text-border">·</span>
          <span className="text-text-muted text-[11px]">FalkorDB Subgraph Projection</span>
        </div>

        {isRemediatedClean ? (
          <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 rounded-md shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>THREAT VECTOR SEVERED · ZERO REACHABLE CROWN JEWELS</span>
          </div>
        ) : attackPaths.length > 0 ? (
          <div className="flex items-center gap-2 text-red-300 font-bold bg-red-500/15 border border-red-500/40 px-3 py-1 rounded-md shadow-[0_0_15px_rgba(239,68,68,0.25)]">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>{attackPaths.length} MULTI-HOP ATTACK PATH(S) TO TIER-0 ASSET</span>
          </div>
        ) : (
          <div className="text-text-muted text-[11px]">Select an incident to run graph traversal</div>
        )}
      </div>

      {/* Main Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-canvas/85 backdrop-blur-md">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full border-2 border-brand/20 border-t-brand animate-spin" />
              <Database className="w-5 h-5 text-brand absolute" />
            </div>
            <p className="text-sm font-mono font-bold text-text-primary">Executing FalkorDB Cypher Traversal...</p>
            <p className="text-xs font-mono text-text-muted mt-1">Multi-hop graph reachability calculation</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none">
            <div className="w-14 h-14 rounded-2xl border border-border bg-surface-elevated/80 flex items-center justify-center text-brand mb-4 shadow-card">
              <Info className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-sm font-bold text-text-primary font-mono mb-1">
              Select a Security Alert to Trace Multi-Hop Path
            </h3>
            <p className="text-xs text-text-muted max-w-md leading-relaxed">
              BlastGuard queries FalkorDB relationships to uncover transitive escalation routes from compute pods to sensitive databases.
            </p>
          </div>
        ) : null}

        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.22 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#161C28" gap={22} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            nodeColor={(node) => {
              if (node.data?.nodeType === "Resource") return "#F59E0B";
              if (node.data?.nodeType === "Workload") return "#8B5CF6";
              if (node.data?.nodeType === "Identity") return "#F59E0B";
              return "#06B6D4";
            }}
            maskColor="rgba(6, 7, 9, 0.8)"
            className="!bg-surface !border !border-border !rounded-lg !shadow-card"
          />
        </ReactFlow>

        {/* Floating High-Tech Legend Bar */}
        <div className="absolute bottom-4 left-44 z-10 hidden md:flex items-center gap-4 bg-surface/90 backdrop-blur-md border border-border/80 px-3.5 py-1.5 rounded-lg text-[10px] font-mono shadow-card select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
            <span className="text-text-secondary font-medium">Workload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
            <span className="text-text-secondary font-medium">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
            <span className="text-text-secondary font-medium">Policy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-amber-300 font-bold">Crown Jewel (Tier-0)</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,59,48,0.8)]" />
            <span className="text-red-400 font-bold">Attack Traversal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-cyan-400 border-dashed" />
            <span className="text-cyan-300 font-medium">Modeled Legitimate Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
