"use client";

import React, { useEffect, useState } from "react";
import { inspectNode } from "@/lib/api";
import {
  X,
  Server,
  Shield,
  Lock,
  Database,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Tag,
  Layers,
} from "lucide-react";

interface NodeInspectorProps {
  nodeId: string | null;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ nodeId, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!nodeId) {
      setData(null);
      return;
    }
    setLoading(true);
    inspectNode(nodeId)
      .then((res) => setData(res))
      .catch((err) => console.error("Inspect node error:", err))
      .finally(() => setLoading(false));
  }, [nodeId]);

  if (!nodeId) return null;

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed right-0 top-14 bottom-0 w-84 bg-surface/98 backdrop-blur-md border-l border-border shadow-2xl z-40 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-surface-elevated/80">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-4 h-4 text-brand shrink-0" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary truncate">
            Node Attributes
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
            title="Copy properties JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-primary rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-text-muted animate-pulse">
            Querying FalkorDB entity properties...
          </div>
        ) : data ? (
          <>
            {/* Entity Badge and Title */}
            <div className="p-3 rounded-lg border border-border bg-canvas space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-brand/20 border border-brand/40 text-brand">
                {data.labels?.[0] || "Entity"}
              </span>
              <h4 className="text-xs font-mono font-bold text-white break-all pt-1">
                {data.properties?.name || data.id}
              </h4>
              <p className="text-[10px] font-mono text-text-muted break-all">
                ID: {data.id}
              </p>
            </div>

            {/* Properties Key-Value List */}
            <div className="border border-border rounded-lg bg-canvas overflow-hidden">
              <div className="px-3 py-2 border-b border-border bg-surface-elevated text-[10px] font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-brand" />
                <span>Entity Properties</span>
              </div>
              <div className="divide-y divide-border/40 text-[11px] font-mono">
                {Object.entries(data.properties || {}).map(([key, val]) => (
                  <div key={key} className="px-3 py-2 flex items-start justify-between gap-2 hover:bg-surface/50">
                    <span className="text-text-muted shrink-0">{key}:</span>
                    <span className="text-text-secondary text-right break-all font-medium">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Outbound Relationships */}
            {data.outbound_relationships?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <ArrowRight className="w-3 h-3 text-brand" /> Outbound Traversal ({data.outbound_relationships.length})
                </span>
                <div className="space-y-1">
                  {data.outbound_relationships.map((rel: any) => (
                    <div
                      key={rel.rel_id}
                      className="p-2.5 rounded-lg border border-border bg-canvas text-[10px] font-mono flex flex-col gap-0.5"
                    >
                      <span className="text-brand font-bold">[:{rel.type}]</span>
                      <span className="text-text-secondary truncate font-medium">→ {rel.target_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inbound Relationships */}
            {data.inbound_relationships?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider flex items-center gap-1 font-semibold">
                  <ArrowLeft className="w-3 h-3 text-cyan-400" /> Inbound Relationships ({data.inbound_relationships.length})
                </span>
                <div className="space-y-1">
                  {data.inbound_relationships.map((rel: any) => (
                    <div
                      key={rel.rel_id}
                      className="p-2.5 rounded-lg border border-border bg-canvas text-[10px] font-mono flex flex-col gap-0.5"
                    >
                      <span className="text-cyan-400 font-bold">[:{rel.type}]</span>
                      <span className="text-text-secondary truncate font-medium">← {rel.source_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-xs text-text-muted font-mono">Node not found.</div>
        )}
      </div>
    </div>
  );
};
