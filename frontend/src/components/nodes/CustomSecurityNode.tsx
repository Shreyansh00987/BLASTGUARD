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
  const isCompromised = status === "compromised";

  // Visual appearance by category in Light Theme
  const getTypeConfig = () => {
    switch (nodeType) {
      case "Workload":
        return {
          icon: <Server className="w-3.5 h-3.5 text-indigo-600" />,
          accentColor: "#4F46E5",
          badge: env ? env.toUpperCase() : "WORKLOAD",
          badgeClass:
            env === "production"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200",
          border: isCompromised
            ? "border-red-400 ring-2 ring-red-400/20 shadow-md"
            : "border-slate-200 hover:border-indigo-300",
          bg: isCompromised
            ? "bg-gradient-to-b from-red-50/60 to-white"
            : "bg-white",
        };
      case "Identity":
        return {
          icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
          accentColor: "#7C3AED",
          badge: properties.type ? properties.type.replace("_", " ").toUpperCase() : "IDENTITY",
          badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
          border: isOnAttackPath
            ? "border-amber-400 ring-1 ring-amber-400/30 shadow-sm"
            : "border-slate-200 hover:border-purple-300",
          bg: isOnAttackPath
            ? "bg-gradient-to-b from-amber-50/40 to-white"
            : "bg-white",
        };
      case "PermissionPolicy":
        return {
          icon: <Lock className="w-3.5 h-3.5 text-rose-600" />,
          accentColor: "#E11D48",
          badge: risk ? `${risk} POLICY` : "POLICY",
          badgeClass:
            risk === "CRITICAL"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-slate-100 text-slate-700 border-slate-200",
          border:
            risk === "CRITICAL"
              ? "border-rose-300 ring-1 ring-rose-400/20 shadow-sm"
              : "border-slate-200 hover:border-slate-300",
          bg: "bg-white",
        };
      case "Resource":
        return {
          icon: isTier0 ? (
            <Database className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <HardDrive className="w-3.5 h-3.5 text-sky-600" />
          ),
          accentColor: isTier0 ? "#D97706" : "#0284C7",
          badge: isTier0 ? "TIER-0 CROWN JEWEL" : "RESOURCE",
          badgeClass: isTier0
            ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
            : "bg-sky-50 text-sky-700 border-sky-200",
          border: isTier0
            ? "border-amber-400 ring-2 ring-amber-400/25 shadow-md"
            : "border-slate-200 hover:border-sky-300",
          bg: isTier0
            ? "bg-gradient-to-b from-amber-50/70 to-white"
            : "bg-white",
        };
      case "Secret":
        return {
          icon: <Key className="w-3.5 h-3.5 text-amber-600" />,
          accentColor: "#D97706",
          badge: "SECRET TOKEN",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
          border: "border-amber-300 hover:border-amber-400",
          bg: "bg-white",
        };
      default:
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-slate-500" />,
          accentColor: "#64748B",
          badge: "NODE",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          border: "border-slate-200 hover:border-slate-300",
          bg: "bg-white",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className={`relative min-w-[240px] max-w-[280px] rounded-xl border p-3.5 shadow-card transition-all duration-200 ${config.bg} ${config.border} ${
        selected ? "ring-2 ring-brand ring-offset-2 ring-offset-white shadow-float scale-[1.02]" : ""
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-3 right-3 h-[3px] rounded-b-full opacity-90"
        style={{
          background: isCompromised
            ? "linear-gradient(90deg, #DC2626, #EF4444)"
            : isOnAttackPath
            ? "linear-gradient(90deg, #DC2626, #F59E0B)"
            : isTier0
            ? "linear-gradient(90deg, #D97706, #EF4444)"
            : `linear-gradient(90deg, ${config.accentColor}, #CBD5E1)`,
        }}
      />

      {/* React Flow Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 !bg-brand !border-2 !border-white transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 !bg-brand !border-2 !border-white transition-transform hover:scale-125"
      />

      {/* Header Row: Category & Badges */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-slate-50 border border-slate-200/80">
            {config.icon}
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider truncate">
            {nodeType}
          </span>
        </div>
        <span
          className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border leading-none tracking-wide ${config.badgeClass}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Title & Entity Type */}
      <div className="pt-2 pb-2">
        <p
          className="text-xs font-mono font-bold text-slate-900 truncate tracking-tight"
          title={name}
        >
          {name}
        </p>
        {properties.type && properties.type !== nodeType && (
          <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
            type: <span className="text-slate-700 font-semibold">{properties.type}</span>
          </p>
        )}
      </div>

      {/* Threat Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-mono">
        {isCompromised ? (
          <span className="flex items-center gap-1 text-red-600 font-bold animate-pulse">
            <Radio className="w-3 h-3 text-red-600" /> COMPROMISED
          </span>
        ) : isRemediated ? (
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED SAFE
          </span>
        ) : isOnAttackPath ? (
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            ATTACK VECTOR
          </span>
        ) : isTier0 ? (
          <span className="flex items-center gap-1 text-amber-700 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> CROWN JEWEL
          </span>
        ) : (
          <span className="text-slate-500 font-medium truncate max-w-[130px]">
            {properties.sensitivity || properties.owner || "Standard"}
          </span>
        )}

        {properties.public_ip ? (
          <span className="text-[9px] text-slate-600 font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            {properties.public_ip}
          </span>
        ) : properties.cluster ? (
          <span className="text-[9px] text-slate-500 font-mono px-1.5 py-0.5 rounded bg-slate-100">
            k8s
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default memo(CustomSecurityNode);
