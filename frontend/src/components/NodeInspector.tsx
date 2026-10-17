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
    <div className="fixed right-0 top-14 bottom-0 w-84 bg-white/98 backdrop-blur-md border-l border-slate-200 shadow-2xl z-40 flex flex-col select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 truncate">
            Node Attributes
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Copy properties JSON"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
            Querying FalkorDB entity properties...
          </div>
        ) : data ? (
          <>
            {/* Entity Badge and Title */}
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
                {data.labels?.[0] || "Entity"}
              </span>
              <h4 className="text-xs font-mono font-bold text-slate-900 break-all pt-1">
                {data.properties?.name || data.id}
              </h4>
              <p className="text-[10px] font-mono text-slate-500 break-all">
                ID: {data.id}
              </p>
            </div>

            {/* Properties Key-Value List */}
            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-indigo-600" />
                <span>Entity Properties</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs font-mono">
                {Object.entries(data.properties || {}).map(([key, val]) => (
                  <div key={key} className="px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-400">{key}:</span>
                    <span className="text-slate-900 font-semibold break-all text-[11px]">
                      {typeof val === "boolean" ? val.toString() : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inbound & Outbound Relationships */}
            {data.outbound_relationships && data.outbound_relationships.length > 0 && (
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-indigo-600" />
                  <span>Outbound Traversal ({data.outbound_relationships.length})</span>
                </div>
                <div className="divide-y divide-slate-100 text-[11px] font-mono p-1">
                  {data.outbound_relationships.map((rel: any, idx: number) => (
                    <div key={idx} className="p-2 space-y-0.5">
                      <div className="text-indigo-600 font-bold">
                        [:{rel.type}]
                      </div>
                      <div className="text-slate-700 truncate">
                        ➔ {rel.target_name || rel.target_id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.inbound_relationships && data.inbound_relationships.length > 0 && (
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowLeft className="w-3 h-3 text-indigo-600" />
                  <span>Inbound Traversal ({data.inbound_relationships.length})</span>
                </div>
                <div className="divide-y divide-slate-100 text-[11px] font-mono p-1">
                  {data.inbound_relationships.map((rel: any, idx: number) => (
                    <div key={idx} className="p-2 space-y-0.5">
                      <div className="text-purple-600 font-bold">
                        [:{rel.type}]
                      </div>
                      <div className="text-slate-700 truncate">
                        ⮜ {rel.source_name || rel.source_id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
