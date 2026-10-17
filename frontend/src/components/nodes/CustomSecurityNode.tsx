"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Server,
  Shield,
  Key,
  Database,
  Lock,
  AlertTriangle,
  HardDrive,
  Cpu,
  CheckCircle2,
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  nodeType: string;
  properties: Record<string, any>;
  isOnAttackPath?: boolean;
  isRemediated?: boolean;
}

const CustomSecurityNode = ({ data, selected }: { data: NodeData; selected: boolean }) => {
  const { label, nodeType, properties, isOnAttackPath, isRemediated } = data;
  const name = properties.name || label;
  const env = properties.environment;
  const tier = properties.tier;
  const status = properties.status;
  const risk = properties.risk_level;

  // Icon & color by node type
  const getTypeConfig = () => {
    switch (nodeType) {
      case "Workload":
        return {
          icon: <Server className="w-4 h-4 text-violet-400" />,
          border: status === "compromised" ? "border-red-500/70" : "border-violet-500/40",
          bg: "bg-surface",
          badge: env ? `${env.toUpperCase()}` : "WORKLOAD",
          badgeColor: env === "production" ? "bg-red-500/10 text-red-400 border-red-500/30" : "bg-violet-500/10 text-violet-300 border-violet-500/30",
        };
      case "Identity":
        return {
          icon: <Shield className="w-4 h-4 text-amber-400" />,
          border: isOnAttackPath ? "border-red-500/60" : "border-amber-500/30",
          bg: "bg-surface",
          badge: properties.type ? properties.type.replace("_", " ").toUpperCase() : "IDENTITY",
          badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        };
      case "PermissionPolicy":
        return {
          icon: <Lock className="w-4 h-4 text-rose-400" />,
          border: risk === "CRITICAL" ? "border-rose-500/70" : "border-slate-700",
          bg: "bg-surface",
          badge: risk ? `${risk} POLICY` : "POLICY",
          badgeColor: risk === "CRITICAL" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-slate-700/30 text-slate-400 border-slate-700",
        };
      case "Resource":
        const isTier0 = tier === "TIER_0_CRITICAL";
        return {
          icon: isTier0 ? <Database className="w-4 h-4 text-red-400" /> : <HardDrive className="w-4 h-4 text-emerald-400" />,
          border: isTier0 ? "border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.25)]" : "border-emerald-500/40",
          bg: "bg-surface",
          badge: isTier0 ? "TIER-0 CROWN JEWEL" : "RESOURCE",
          badgeColor: isTier0 ? "bg-red-500/20 text-red-300 border-red-500/40 animate-pulse" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        };
      case "Secret":
        return {
          icon: <Key className="w-4 h-4 text-amber-400" />,
          border: "border-amber-500/50",
          bg: "bg-surface",
          badge: "SECRET",
          badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
        };
      default:
        return {
          icon: <Cpu className="w-4 h-4 text-slate-400" />,
          border: "border-border",
          bg: "bg-surface",
          badge: "NODE",
          badgeColor: "bg-slate-800 text-slate-400 border-slate-700",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className={`min-w-[210px] max-w-[260px] rounded-md border p-2.5 transition-all duration-150 ${config.bg} ${config.border} ${
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-canvas shadow-lg" : ""
      } ${isOnAttackPath ? "shadow-[0_0_10px_rgba(239,68,68,0.15)]" : ""}`}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-violet-400" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-violet-400" />

      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 pb-1.5 border-b border-border/50">
        <div className="flex items-center gap-1.5 min-w-0">
          {config.icon}
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted truncate">
            {nodeType}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border leading-none ${config.badgeColor}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Node Title */}
      <div className="pt-2 pb-1">
        <p className="text-xs font-semibold text-text-primary truncate font-mono" title={name}>
          {name}
        </p>
        {properties.type && properties.type !== nodeType && (
          <p className="text-[10px] text-text-muted truncate mt-0.5 font-mono">
            type: {properties.type}
          </p>
        )}
      </div>

      {/* Status Bar / Attack Path Indicator */}
      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px] font-mono">
        {status === "compromised" ? (
          <span className="flex items-center gap-1 text-red-400 font-medium">
            <AlertTriangle className="w-3 h-3" /> Compromised
          </span>
        ) : isRemediated ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Remediated
          </span>
        ) : isOnAttackPath ? (
          <span className="text-red-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Threat Hop
          </span>
        ) : (
          <span className="text-text-muted">
            {properties.sensitivity || properties.owner || "Standard"}
          </span>
        )}

        {properties.public_ip && (
          <span className="text-text-muted text-[9px]">{properties.public_ip}</span>
        )}
      </div>
    </div>
  );
};

export default memo(CustomSecurityNode);
