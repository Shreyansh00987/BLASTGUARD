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
import { ShieldCheck, AlertTriangle, Layers, Info } from "lucide-react";

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
  // Collect all node IDs and edge IDs that belong to discovered attack paths
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

    // Helper to calculate X column
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
      if (type === "Workload" && id.includes("prod")) return 2.5;
      return 1;
    };

    // Group nodes by column to stagger Y
    const colBuckets: Record<number, IGraphNode[]> = {};
    nodes.forEach((n) => {
      const col = getColumnIndex(n);
      colBuckets[col] = colBuckets[col] || [];
      colBuckets[col].push(n);
    });

    const result: Node[] = [];

    Object.entries(colBuckets).forEach(([colStr, colNodes]) => {
      const col = parseFloat(colStr);
      const x = 50 + col * 320;
      const totalInCol = colNodes.length;
      const startY = 120 - ((totalInCol - 1) * 140) / 2;

      colNodes.forEach((node, idx) => {
        const y = startY + idx * 160;
        result.push({
          id: node.id,
          type: "customSecurity",
          position: { x, y: Math.max(50, y) },
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

  // Format edges with styling for attack paths and legitimate routes
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
          fill: isAttack ? "#EF4444" : isLegit ? "#60A5FA" : "#94A3B8",
          fontFamily: "ui-monospace, monospace",
          fontSize: 9,
          fontWeight: isAttack ? 600 : 400,
        },
        labelBgStyle: {
          fill: "#12151C",
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isAttack ? "#EF4444" : isLegit ? "#3B82F6" : "#64748B",
          width: 16,
          height: 16,
        },
        style: {
          stroke: isAttack ? "#EF4444" : isLegit ? "#3B82F6" : "#4B5563",
          strokeWidth: isAttack ? 2.5 : isLegit ? 1.5 : 1.2,
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
      {/* Top Banner Status Bar */}
      <div className="h-9 px-4 border-b border-border/80 bg-surface/60 backdrop-blur-sm flex items-center justify-between z-10 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-brand" />
          <span className="text-text-secondary font-medium">Attack Path Subgraph</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted">FalkorDB Subgraph Projection</span>
        </div>

        {isRemediatedClean ? (
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Path Severed · Verified 0 Reachable Targets</span>
          </div>
        ) : attackPaths.length > 0 ? (
          <div className="flex items-center gap-1.5 text-red-400 font-medium bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 rounded">
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            <span>{attackPaths.length} Active Multi-Hop Escalation Path(s) Detected</span>
          </div>
        ) : (
          <div className="text-text-muted">Ready for investigation</div>
        )}
      </div>

      {/* Main Graph Canvas */}
      <div className="flex-1 w-full h-full relative">
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-canvas/80 backdrop-blur-sm">
            <div className="w-10 h-10 border-2 border-brand/30 border-t-brand rounded-full animate-spin mb-3" />
            <p className="text-xs font-mono text-text-primary">Traversing FalkorDB Graph Relationships...</p>
            <p className="text-[11px] font-mono text-text-muted mt-1">Executing parameterized variable-length Cypher query</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center text-text-muted mb-3">
              <Info className="w-5 h-5 text-brand" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary font-mono mb-1">
              Select an Alert to Begin Investigation
            </h3>
            <p className="text-xs text-text-muted max-w-sm">
              BlastGuard will query FalkorDB to discover transitive privilege escalation paths from the affected workload to sensitive crown jewels.
            </p>
          </div>
        ) : null}

        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <Background color="#1A1F2B" gap={20} size={1} />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            nodeColor={(node) => {
              if (node.data?.nodeType === "Resource") return "#EF4444";
              if (node.data?.nodeType === "Workload") return "#8B5CF6";
              if (node.data?.nodeType === "Identity") return "#F59E0B";
              return "#3B82F6";
            }}
            maskColor="rgba(10, 11, 14, 0.75)"
            className="!bg-surface !border !border-border !rounded"
          />
        </ReactFlow>

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-4 left-44 z-10 hidden md:flex items-center gap-4 bg-surface/90 backdrop-blur border border-border px-3 py-1.5 rounded text-[10px] font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500/80" />
            <span className="text-text-secondary">Workload</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" />
            <span className="text-text-secondary">Identity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80" />
            <span className="text-text-secondary">Policy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            <span className="text-text-primary font-bold">Crown Jewel (Tier-0)</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-red-500 border-dashed" />
            <span className="text-red-400 font-medium">Attack Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-500" />
            <span className="text-blue-400">Legitimate Traffic</span>
          </div>
        </div>
      </div>
    </div>
  );
};
