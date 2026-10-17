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
  Sparkles,
  Radio,
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
  const isTier0 = tier === "TIER_0_CRITICAL";

  // Visual appearance by category
  const getTypeConfig = () => {
    switch (nodeType) {
      case "Workload":
        return {
          icon: <Server className="w-3.5 h-3.5 text-violet-400" />,
          accentColor: "#8B5CF6",
          badge: env ? `${env.toUpperCase()}` : "WORKLOAD",
          badgeClass: env === "production" ? "bg-red-500/15 text-red-300 border-red-500/30" : "bg-violet-500/15 text-violet-300 border-violet-500/30",
          border: status === "compromised" ? "border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]" : "border-violet-500/30 hover:border-violet-400/60",
          bg: "bg-surface-card",
        };
      case "Identity":
        return {
          icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
          accentColor: "#F59E0B",
          badge: properties.type ? properties.type.replace("_", " ").toUpperCase() : "IDENTITY",
          badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          border: isOnAttackPath ? "border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "border-amber-500/30 hover:border-amber-400/60",
          bg: "bg-surface-card",
        };
      case "PermissionPolicy":
        return {
          icon: <Lock className="w-3.5 h-3.5 text-rose-400" />,
          accentColor: "#F43F5E",
          badge: risk ? `${risk} POLICY` : "POLICY",
          badgeClass: risk === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-700/40 text-slate-300 border-slate-600",
          border: risk === "CRITICAL" ? "border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "border-border hover:border-slate-500",
          bg: "bg-surface-card",
        };
      case "Resource":
        return {
          icon: isTier0 ? <Database className="w-3.5 h-3.5 text-amber-300" /> : <HardDrive className="w-3.5 h-3.5 text-cyan-400" />,
          accentColor: isTier0 ? "#F59E0B" : "#06B6D4",
          badge: isTier0 ? "TIER-0 CROWN JEWEL" : "RESOURCE",
          badgeClass: isTier0 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
          border: isTier0 ? "border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/40" : "border-cyan-500/30 hover:border-cyan-400/60",
          bg: isTier0 ? "bg-surface-elevated" : "bg-surface-card",
        };
      case "Secret":
        return {
          icon: <Key className="w-3.5 h-3.5 text-amber-400" />,
          accentColor: "#F59E0B",
          badge: "SECRET TOKEN",
          badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          border: "border-amber-500/40 hover:border-amber-400",
          bg: "bg-surface-card",
        };
      default:
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-slate-400" />,
          accentColor: "#94A3B8",
          badge: "NODE",
          badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
          border: "border-border",
          bg: "bg-surface-card",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className={`relative min-w-[220px] max-w-[270px] rounded-lg border p-3 backdrop-blur-md transition-all duration-200 ${config.bg} ${config.border} ${
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-canvas shadow-glow" : ""
      }`}
    >
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-2 right-2 h-[2px] rounded-full opacity-80"
        style={{
          background: isOnAttackPath
            ? "linear-gradient(90deg, #FF3B30, #F43F5E)"
            : isTier0
            ? "linear-gradient(90deg, #F59E0B, #EF4444)"
            : `linear-gradient(90deg, ${config.accentColor}, transparent)`,
        }}
      />

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-brand !border-2 !border-canvas transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-brand !border-2 !border-canvas transition-transform hover:scale-125"
      />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-border/50">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded bg-canvas/80 border border-border/60">
            {config.icon}
          </div>
          <span className="text-[10px] font-mono font-medium text-text-muted uppercase tracking-wider truncate">
            {nodeType}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border leading-none tracking-wide ${config.badgeClass}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Title & Type */}
      <div className="pt-2 pb-1.5">
        <p
          className="text-xs font-mono font-bold text-text-primary truncate tracking-tight"
          title={name}
        >
          {name}
        </p>
        {properties.type && properties.type !== nodeType && (
          <p className="text-[10px] font-mono text-text-muted truncate mt-0.5">
            type: <span className="text-text-secondary">{properties.type}</span>
          </p>
        )}
      </div>

      {/* Threat Status Badge or Attribute Pill */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-[10px] font-mono">
        {status === "compromised" ? (
          <span className="flex items-center gap-1 text-red-400 font-semibold animate-pulse">
            <Radio className="w-3 h-3 text-red-500" /> COMPROMISED
          </span>
        ) : isRemediated ? (
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> VERIFIED SAFE
          </span>
        ) : isOnAttackPath ? (
          <span className="flex items-center gap-1 text-red-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            ATTACK VECTOR
          </span>
        ) : isTier0 ? (
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <Sparkles className="w-3 h-3" /> PII / FINANCIAL
          </span>
        ) : (
          <span className="text-text-muted truncate max-w-[130px]">
            {properties.sensitivity || properties.owner || "Standard"}
          </span>
        )}

        {properties.public_ip ? (
          <span className="text-[9px] text-text-dim px-1 rounded bg-canvas border border-border/60">
            {properties.public_ip}
          </span>
        ) : properties.cluster ? (
          <span className="text-[9px] text-text-dim truncate max-w-[80px]">
            k8s
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default memo(CustomSecurityNode);
