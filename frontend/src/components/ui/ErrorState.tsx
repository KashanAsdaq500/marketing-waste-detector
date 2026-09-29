import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Analysis Error",
  message,
  onRetry,
}) => {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/70 p-6 my-4 text-left">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100 text-red-700 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          <p className="mt-1 text-xs text-red-700 leading-relaxed font-mono whitespace-pre-wrap">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Operation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
