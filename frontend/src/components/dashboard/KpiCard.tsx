import React from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  variant?: "default" | "positive" | "warning" | "critical" | "brand";
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  icon,
  variant = "default",
}) => {
  const borderVariants = {
    default: "border-slate-200 hover:border-slate-300",
    positive: "border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/20",
    warning: "border-amber-200/80 bg-gradient-to-b from-white to-amber-50/20",
    critical: "border-red-200/80 bg-gradient-to-b from-white to-red-50/20",
    brand: "border-indigo-200/80 bg-gradient-to-b from-white to-indigo-50/20",
  }[variant];

  const iconBg = {
    default: "text-slate-600 bg-slate-100",
    positive: "text-emerald-700 bg-emerald-50",
    warning: "text-amber-700 bg-amber-50",
    critical: "text-red-700 bg-red-50",
    brand: "text-indigo-700 bg-indigo-50",
  }[variant];

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${borderVariants}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-md ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
      </div>
      {subtext && (
        <p className="mt-1 text-[11px] text-slate-500 leading-tight">
          {subtext}
        </p>
      )}
    </div>
  );
};
