import React from "react";
import { Sparkles, TrendingUp, Minus } from "lucide-react";
import { ConversionPotentialLevel } from "@/types";

interface PotentialBadgeProps {
  potential?: ConversionPotentialLevel | string | null;
  probability?: number | null;
  size?: "sm" | "md";
}

export const PotentialBadge: React.FC<PotentialBadgeProps> = ({
  potential,
  probability,
  size = "md",
}) => {
  const norm = (potential || "Low Potential").toLowerCase();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = <Minus className="w-3 h-3 text-slate-500" />;
  let label = "Low Potential";

  if (norm.includes("high")) {
    styles = "bg-indigo-50 text-indigo-800 border-indigo-200";
    icon = <Sparkles className="w-3 h-3 text-indigo-600" />;
    label = "High Potential";
  } else if (norm.includes("med")) {
    styles = "bg-sky-50 text-sky-800 border-sky-200";
    icon = <TrendingUp className="w-3 h-3 text-sky-600" />;
    label = "Med Potential";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${styles} ${
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
    >
      {icon}
      <span>{label}</span>
      {probability !== undefined && probability !== null && (
        <span className="font-mono text-[10px] font-semibold opacity-80">
          {Math.round(probability)}%
        </span>
      )}
    </span>
  );
};
