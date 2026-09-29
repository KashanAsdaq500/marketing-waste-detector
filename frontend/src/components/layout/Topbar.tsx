"use client";

import React, { useEffect, useState } from "react";
import { useAnalysis } from "@/context/AnalysisContext";
import { checkBackendHealth } from "@/lib/api";
import { FileSpreadsheet, Server, Menu, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu }) => {
  const { currentAnalysis, analysesHistory, selectAnalysis } = useAnalysis();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Current Active Analysis Selector */}
        {currentAnalysis ? (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Dataset:
            </span>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold truncate max-w-[180px]">
                  {currentAnalysis.filename}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({currentAnalysis.summary.total_campaigns} rows)
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* History quick switch dropdown */}
              {analysesHistory.length > 1 && (
                <div className="absolute left-0 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-1 shadow-lg hidden group-hover:block z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Analysis
                  </div>
                  {analysesHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => item.id && selectAnalysis(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                        item.id === currentAnalysis.id
                          ? "bg-indigo-50 text-indigo-900 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate">{item.filename}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.summary.total_campaigns} ads
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            <span>No analysis loaded.</span>
            <Link
              href="/analyze"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Upload CSV
            </Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* API Backend status badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
            backendOnline === true
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : backendOnline === false
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-slate-50 text-slate-500 border-slate-200"
          }`}
          title={
            backendOnline
              ? "FastAPI ML Server Connected (Port 8000)"
              : "Cannot reach FastAPI backend server"
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              backendOnline === true
                ? "bg-emerald-500"
                : backendOnline === false
                ? "bg-red-500"
                : "bg-slate-400"
            }`}
          />
          <Server className="w-3 h-3" />
          <span className="hidden sm:inline">
            {backendOnline ? "API Online" : backendOnline === false ? "API Disconnected" : "Checking API..."}
          </span>
        </div>

        {/* Quick Assistant CTA */}
        <Link
          href="/assistant"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Link>
      </div>
    </header>
  );
};
