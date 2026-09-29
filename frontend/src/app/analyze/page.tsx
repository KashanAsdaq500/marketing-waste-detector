"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CsvUploader } from "@/components/analyze/CsvUploader";
import { useAnalysis } from "@/context/AnalysisContext";
import { AnalysisResult } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { HighWasteTable } from "@/components/dashboard/HighWasteTable";
import { AnomalyOverview } from "@/components/dashboard/AnomalyOverview";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import {
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  Layers,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

export default function AnalyzePage() {
  const { currentAnalysis } = useAnalysis();
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);

  const activeResult = latestAnalysis || currentAnalysis;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Performance Ingestion
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Analyze Campaign Dataset
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload CSV campaign files to run Isolation Forest anomaly detection, multi-signal waste scoring, and conversion predictions.
          </p>
        </div>

        {/* Uploader Card */}
        <CsvUploader onAnalysisSuccess={(result) => setLatestAnalysis(result)} />

        {/* Display Immediate Results if available */}
        {activeResult && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Analysis Results: {activeResult.filename}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved to your private analysis history. Showing top 20 waste risk & top 20 anomalies.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/assistant"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Ask AI Assistant</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Go to Full Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <KpiCard
                label="Campaigns"
                value={activeResult.summary.total_campaigns}
                subtext="Total rows"
              />
              <KpiCard
                label="Total Spend"
                value={`$${Math.round(activeResult.summary.total_spend).toLocaleString()}`}
                subtext="Capital deployed"
                variant="brand"
              />
              <KpiCard
                label="Clicks"
                value={activeResult.summary.total_clicks.toLocaleString()}
                subtext="Engagements"
              />
              <KpiCard
                label="Conversions"
                value={activeResult.summary.total_conversions}
                subtext="Approved sales/leads"
                variant="positive"
              />
              <KpiCard
                label="Average CPC"
                value={`$${activeResult.summary.average_cpc.toFixed(2)}`}
                subtext="Cost per click"
              />
              <KpiCard
                label="Average CPA"
                value={`$${activeResult.summary.average_cpa.toFixed(2)}`}
                subtext="Cost per acquisition"
                variant={activeResult.summary.average_cpa > 40 ? "warning" : "default"}
              />
            </div>

            {/* Charts & Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <RiskDistributionChart
                  distribution={activeResult.summary.risk_distribution}
                />
              </div>
              <div className="lg:col-span-2">
                <AnomalyOverview anomalies={activeResult.top_anomalies} />
              </div>
            </div>

            {/* High Waste Campaigns */}
            <HighWasteTable campaigns={activeResult.top_waste_risk} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
