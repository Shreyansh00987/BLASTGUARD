"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Server,
  ChevronRight,
  ShieldAlert,
  Radio,
  Filter,
} from "lucide-react";
import { SecurityAlert } from "@/lib/types";

interface AlertQueueProps {
  alerts: SecurityAlert[];
  selectedAlertId: string | null;
  onSelectAlert: (alertId: string) => void;
  isLoading: boolean;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
  isLoading,
}) => {
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "RESOLVED">("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "CRITICAL") return a.severity === "CRITICAL";
    if (filter === "RESOLVED") return a.status === "RESOLVED";
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 shadow-sm">
            <Flame className="w-3 h-3 text-red-600" /> CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {severity}
          </span>
        );
    }
  };

  return (
    <aside className="w-80 border-r border-slate-200 bg-white flex flex-col h-full select-none shadow-sm">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-indigo-600" />
            <span className="absolute w-2 h-2 rounded-full bg-indigo-600 animate-ping opacity-60" />
          </div>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
            Threat Stream
          </h2>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
          {alerts.length} Incidents
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="p-2 border-b border-slate-200 bg-slate-50/40 flex items-center gap-1">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded-md transition-colors ${
            filter === "ALL"
              ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter("CRITICAL")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded-md transition-colors ${
            filter === "CRITICAL"
              ? "bg-red-50 text-red-700 border border-red-200 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          Critical ({alerts.filter((a) => a.severity === "CRITICAL").length})
        </button>
        <button
          onClick={() => setFilter("RESOLVED")}
          className={`flex-1 py-1 text-[10px] font-mono font-semibold rounded-md transition-colors ${
            filter === "RESOLVED"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm"
              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          Resolved ({alerts.filter((a) => a.status === "RESOLVED").length})
        </button>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-2 rounded-lg bg-slate-50">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
                <div className="h-2.5 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-mono">
            No matching incidents in stream.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isSelected = alert.id === selectedAlertId;
            const isResolved = alert.status === "RESOLVED";

            return (
              <button
                key={alert.id}
                onClick={() => onSelectAlert(alert.id)}
                className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 group relative border-l-4 ${
                  isSelected
                    ? "bg-indigo-50/50 border-l-indigo-600 shadow-sm"
                    : "border-l-transparent hover:bg-slate-50"
                }`}
              >
                {/* Top Row: Severity & Timestamp */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {getSeverityBadge(alert.severity)}
                    {isResolved && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-2.5 h-2.5" /> RESOLVED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{alert.timestamp ? alert.timestamp.split("T")[1]?.slice(0, 5) || "14m ago" : "14m ago"}</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3
                    className={`text-xs font-bold font-mono tracking-tight line-clamp-2 transition-colors ${
                      isSelected ? "text-indigo-950 font-extrabold" : "text-slate-800 group-hover:text-indigo-600"
                    }`}
                  >
                    {alert.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-600">
                    <Server className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{alert.affected_resource_name}</span>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>

                {/* Bottom Row Info */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-400">
                  <span className="truncate">Target: {alert.entry_node_id}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-300 group-hover:text-slate-500"
                    }`}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Sidebar Footer Status */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>FalkorDB Sync Active</span>
        </div>
        <span className="text-slate-400">Track 01</span>
      </div>
    </aside>
  );
};
