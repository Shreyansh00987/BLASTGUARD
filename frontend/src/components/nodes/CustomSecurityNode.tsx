"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Server,
  Shield,
  Key,
  Database,
  Lock,
  HardDrive,
  Cpu,
  CheckCircle2,
  Sparkles,
  Radio,
  ExternalLink,
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
  const isTier0 = tier === "TIER_0_CRITICAL" || properties.sensitivity === "PII / Financial Records";
  const isCompromised = status === "compromised";

  // Visual appearance by category (Crisp, High-Legibility Enterprise Light Theme)
  const getTypeConfig = () => {
    switch (nodeType) {
      case "Workload":
        return {
          icon: <Server className="w-4 h-4 text-indigo-700" />,
          accentColor: "#4F46E5",
          borderLeft: isCompromised ? "border-l-red-600" : "border-l-indigo-600",
          badge: env ? env.toUpperCase() : "WORKLOAD",
          badgeClass:
            env === "production"
              ? "bg-red-100 text-red-800 border-red-300 font-bold"
              : "bg-indigo-100 text-indigo-800 border-indigo-200 font-semibold",
          border: isCompromised
            ? "border-red-300 ring-2 ring-red-400/30 shadow-md"
            : "border-slate-300 hover:border-indigo-400 shadow-sm",
          bg: isCompromised
            ? "bg-gradient-to-b from-red-50/80 via-white to-white"
            : "bg-white",
        };
      case "Identity":
        return {
          icon: <Shield className="w-4 h-4 text-purple-700" />,
          accentColor: "#7C3AED",
          borderLeft: isOnAttackPath ? "border-l-amber-500" : "border-l-purple-600",
          badge: properties.type ? properties.type.replace("_", " ").toUpperCase() : "IDENTITY",
          badgeClass: "bg-purple-100 text-purple-800 border-purple-200 font-semibold",
          border: isOnAttackPath
            ? "border-amber-300 ring-2 ring-amber-400/25 shadow-md"
            : "border-slate-300 hover:border-purple-400 shadow-sm",
          bg: isOnAttackPath
            ? "bg-gradient-to-b from-amber-50/60 via-white to-white"
            : "bg-white",
        };
      case "PermissionPolicy":
        return {
          icon: <Lock className="w-4 h-4 text-rose-700" />,
          accentColor: "#E11D48",
          borderLeft: "border-l-rose-600",
          badge: risk ? `${risk} POLICY` : "POLICY",
          badgeClass:
            risk === "CRITICAL"
              ? "bg-rose-100 text-rose-800 border-rose-300 font-bold"
              : "bg-slate-100 text-slate-800 border-slate-300 font-semibold",
          border:
            risk === "CRITICAL"
              ? "border-rose-300 ring-2 ring-rose-400/20 shadow-md"
              : "border-slate-300 hover:border-slate-400 shadow-sm",
          bg: "bg-white",
        };
      case "Resource":
        return {
          icon: isTier0 ? (
            <Database className="w-4 h-4 text-amber-700" />
          ) : (
            <HardDrive className="w-4 h-4 text-sky-700" />
          ),
          accentColor: isTier0 ? "#D97706" : "#0284C7",
          borderLeft: isTier0 ? "border-l-amber-500" : "border-l-sky-600",
          badge: isTier0 ? "TIER-0 CROWN JEWEL" : "RESOURCE",
          badgeClass: isTier0
            ? "bg-amber-100 text-amber-900 border-amber-300 font-bold tracking-wide"
            : "bg-sky-100 text-sky-800 border-sky-200 font-semibold",
          border: isTier0
            ? "border-amber-400 ring-2 ring-amber-400/30 shadow-md"
            : "border-slate-300 hover:border-sky-400 shadow-sm",
          bg: isTier0
            ? "bg-gradient-to-b from-amber-50/80 via-white to-white"
            : "bg-white",
        };
      case "Secret":
        return {
          icon: <Key className="w-4 h-4 text-amber-700" />,
          accentColor: "#D97706",
          borderLeft: "border-l-amber-500",
          badge: "EXPOSED TOKEN",
          badgeClass: "bg-amber-100 text-amber-800 border-amber-300 font-bold",
          border: "border-amber-300 ring-2 ring-amber-400/20 shadow-md",
          bg: "bg-white",
        };
      default:
        return {
          icon: <Cpu className="w-4 h-4 text-slate-600" />,
          accentColor: "#64748B",
          borderLeft: "border-l-slate-400",
          badge: "NODE",
          badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
          border: "border-slate-300 shadow-sm",
          bg: "bg-white",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div
      className={`relative w-[230px] rounded-xl border border-l-4 p-3 shadow-md transition-all duration-150 select-none ${config.bg} ${config.border} ${config.borderLeft} ${
        selected ? "ring-2 ring-indigo-600 ring-offset-2 ring-offset-white shadow-lg scale-[1.03]" : ""
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className="absolute top-0 left-2 right-2 h-[2.5px] rounded-b-full opacity-90"
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

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-indigo-600 !border-2 !border-white shadow transition-transform hover:scale-125"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-indigo-600 !border-2 !border-white shadow transition-transform hover:scale-125"
      />

      {/* Header Row: Category Icon & Badge */}
      <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-slate-100 border border-slate-200">
            {config.icon}
          </div>
          <span className="text-[11px] font-sans font-bold text-slate-800 uppercase tracking-tight truncate">
            {nodeType}
          </span>
        </div>
        <span
          className={`text-[9.5px] font-sans px-2 py-0.5 rounded-full border leading-none ${config.badgeClass}`}
        >
          {config.badge}
        </span>
      </div>

      {/* Node Name & Type (Large, Readable Typography) */}
      <div className="py-2">
        <h4
          className="text-[13px] font-sans font-bold text-slate-900 leading-snug break-words"
          title={name}
        >
          {name}
        </h4>
        {properties.type && (
          <p className="text-[11px] font-mono text-slate-600 mt-0.5 truncate">
            type: <span className="text-slate-800 font-semibold">{properties.type}</span>
          </p>
        )}
      </div>

      {/* Threat Status Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-sans">
        {isCompromised ? (
          <span className="flex items-center gap-1 text-red-700 font-bold">
            <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" /> COMPROMISED
          </span>
        ) : isRemediated ? (
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED SAFE
          </span>
        ) : isOnAttackPath ? (
          <span className="flex items-center gap-1 text-red-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            ATTACK VECTOR
          </span>
        ) : isTier0 ? (
          <span className="flex items-center gap-1 text-amber-800 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> CROWN JEWEL
          </span>
        ) : (
          <span className="text-slate-600 font-medium truncate max-w-[120px]">
            {properties.sensitivity || properties.owner || "Operational"}
          </span>
        )}

        {properties.public_ip ? (
          <span className="text-[10px] font-mono font-semibold text-slate-700 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
            {properties.public_ip}
          </span>
        ) : properties.cluster ? (
          <span className="text-[10px] font-mono font-semibold text-slate-600 px-1.5 py-0.5 rounded bg-slate-100">
            k8s
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default memo(CustomSecurityNode);
