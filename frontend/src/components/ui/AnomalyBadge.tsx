import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AnomalyBadgeProps {
  isAnomaly: boolean;
  score?: number | null;
  size?: "sm" | "md";
}

export const AnomalyBadge: React.FC<AnomalyBadgeProps> = ({
  isAnomaly,
  score,
  size = "md",
}) => {
  if (!isAnomaly) {
    return (
      <span
        className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${
          size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
        }`}
      >
        <CheckCircle2 className="w-3 h-3 text-slate-400" />
        Normal
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-cyan-50 text-cyan-900 border border-cyan-300 ${
        size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      }`}
      title={
        score !== null && score !== undefined
          ? `Isolation Forest Anomaly Score: ${score.toFixed(4)}`
          : "Unusual multi-dimensional metric pattern"
      }
    >
      <AlertCircle className="w-3 h-3 text-cyan-600" />
      <span>Anomaly</span>
      {score !== null && score !== undefined && (
        <span className="text-[10px] font-mono opacity-75">
          ({score > 0 ? `+${score.toFixed(3)}` : score.toFixed(3)})
        </span>
      )}
    </span>
  );
};
