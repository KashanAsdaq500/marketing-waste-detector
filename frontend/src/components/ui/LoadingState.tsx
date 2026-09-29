import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  step?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Processing campaign intelligence...",
  step,
  subtext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-900 tracking-tight">
        {step || message}
      </h3>
      {subtext && (
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          {subtext}
        </p>
      )}
    </div>
  );
};
