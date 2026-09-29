import React from "react";
import { WasteRiskLevel } from "@/types";

interface RiskBadgeProps {
  risk: WasteRiskLevel | string;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  size = "md",
  showDot = true,
}) => {
  const normalized = (risk || "Low Risk").toLowerCase();

  let styles = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let dotColor = "bg-emerald-500";
  let label = "Low Risk";

  if (normalized.includes("high")) {
    styles = "bg-red-50 text-red-700 border-red-200";
    dotColor = "bg-red-500";
    label = "High Risk";
  } else if (normalized.includes("med")) {
    styles = "bg-amber-50 text-amber-800 border-amber-200";
    dotColor = "bg-amber-500";
    label = "Medium Risk";
  }

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-semibold",
    lg: "text-sm px-3 py-1.5 font-semibold",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${sizeClasses} ${styles}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
            normalized.includes("high") ? "animate-pulse" : ""
          }`}
        />
      )}
      {label}
    </span>
  );
};
