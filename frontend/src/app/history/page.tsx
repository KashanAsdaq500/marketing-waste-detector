"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysis } from "@/context/AnalysisContext";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  ArrowRight,
  TrendingDown,
  Layers,
  DollarSign,
  AlertTriangle,
  Bot,
} from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { analysesHistory, currentAnalysis, selectAnalysis, deleteAnalysisItem } =
    useAnalysis();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Audit Logs & Records
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Previous Analysis History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              View and switch between previously uploaded campaign audits saved in your user account.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Upload New Dataset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analysesHistory.length === 0 ? (
          <EmptyState
            title="No Saved Analyses Yet"
            description="Whenever you upload a CSV campaign file, the analysis is automatically processed by the ML engine and stored securely in your private history."
            actionText="Upload First CSV"
            actionHref="/analyze"
          />
        ) : (
          <div className="space-y-4">
            {analysesHistory.map((item) => {
              const isActive = item.id === currentAnalysis?.id;
              const summary = item.summary;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all ${
                    isActive
                      ? "border-indigo-400 ring-2 ring-indigo-500/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left File Header */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900">
                          {item.filename}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Active in Dashboard
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Processed on {new Date(item.created_at || Date.now()).toLocaleDateString()} at{" "}
                        {new Date(item.created_at || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Middle Metrics Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                          Total Spend
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ${Math.round(summary.total_spend).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                          Campaigns
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {summary.total_campaigns.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                          Average CPA
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ${summary.average_cpa.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 text-red-800">
                        <span className="text-[10px] uppercase text-red-600 font-semibold block">
                          High Waste Risk
                        </span>
                        <span className="font-mono font-bold">
                          {summary.risk_distribution["High Risk"] || 0} ads
                        </span>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {!isActive ? (
                        <button
                          onClick={() => item.id && selectAnalysis(item.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          Make Active
                        </button>
                      ) : (
                        <Link
                          href="/dashboard"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          View Dashboard
                        </Link>
                      )}

                      <Link
                        href="/assistant"
                        onClick={() => item.id && selectAnalysis(item.id)}
                        title="Analyze with AI Assistant"
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      >
                        <Bot className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => {
                          if (item.id && confirm("Delete this analysis from history?")) {
                            deleteAnalysisItem(item.id);
                          }
                        }}
                        title="Delete record"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
