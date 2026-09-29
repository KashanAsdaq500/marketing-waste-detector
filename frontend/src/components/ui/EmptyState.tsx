import React from "react";
import Link from "next/link";
import { UploadCloud, FileSpreadsheet, ArrowRight } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Campaign Analyses Found",
  description = "Upload your advertising CSV dataset to evaluate waste risk, detect isolation anomalies, and forecast conversion potential.",
  actionText = "Upload Campaign CSV",
  actionHref = "/analyze",
  onActionClick,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white">
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
        {icon || <FileSpreadsheet className="w-6 h-6 text-indigo-600" />}
      </div>
      <h3 className="text-base font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-500 max-w-md leading-relaxed">
        {description}
      </p>
      {actionHref ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : onActionClick ? (
        <button
          onClick={onActionClick}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      ) : null}
    </div>
  );
};
