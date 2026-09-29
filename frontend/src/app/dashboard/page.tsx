"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysis } from "@/context/AnalysisContext";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { ConversionChart } from "@/components/dashboard/ConversionChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { AnomalyOverview } from "@/components/dashboard/AnomalyOverview";
import { HighWasteTable } from "@/components/dashboard/HighWasteTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { PotentialBadge } from "@/components/ui/PotentialBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { uploadAndAnalyzeCsv } from "@/lib/api";
import {
  Layers,
  DollarSign,
  Eye,
  MousePointer,
  CheckCircle,
  Tag,
  Target,
  Sparkles,
  ArrowRight,
  History,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { currentAnalysis, analysesHistory, saveAnalysis, selectAnalysis } = useAnalysis();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  // Quick 1-click benchmark dataset loader
  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    setDemoError(null);
    try {
      const res = await fetch("/sample-data.csv");
      if (!res.ok) throw new Error("Could not fetch sample dataset");
      const blob = await res.blob();
      const file = new File([blob], "KAG_conversion_data.csv", { type: "text/csv" });
      const result = await uploadAndAnalyzeCsv(file);
      await saveAnalysis(result);
    } catch (err: unknown) {
      setDemoError(err instanceof Error ? err.message : "Failed to load sample dataset");
    } finally {
      setLoadingDemo(false);
    }
  };

  const summary = currentAnalysis?.summary;
  const topWaste = currentAnalysis?.top_waste_risk || [];
  const topAnomalies = currentAnalysis?.top_anomalies || [];
  const conversionSummary = currentAnalysis?.conversion_summary;

  // High potential campaigns (conversion_potential === "High Potential")
  const highPotentialList = topWaste.filter(
    (c) => c.conversion_potential === "High Potential" || (c.conversion_probability || 0) >= 70
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Top Header & Context Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Executive Overview
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Campaign Intelligence Dashboard
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentAnalysis
                ? `Active Dataset: ${currentAnalysis.filename} • Analyzed on ${new Date(
                    currentAnalysis.created_at || Date.now()
                  ).toLocaleDateString()}`
                : "Comprehensive multi-signal advertising analysis and optimization"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!currentAnalysis && (
              <button
                onClick={handleLoadDemo}
                disabled={loadingDemo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 shadow-sm transition-colors"
              >
                {loadingDemo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing 1,143 records...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Load 1,143 Benchmark Ads</span>
                  </>
                )}
              </button>
            )}
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Upload New CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {demoError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{demoError}</span>
          </div>
        )}

        {/* Empty State when no analysis exists */}
        {!currentAnalysis ? (
          <div className="space-y-6">
            <EmptyState
              title="No Campaign Dataset Loaded"
              description="Upload your advertising performance CSV or load the pre-trained benchmark dataset (1,143 records) to populate KPI metrics, waste risk curves, Isolation Forest anomalies, and RAG diagnostics."
              actionText="Upload Campaign CSV"
              actionHref="/analyze"
            />
          </div>
        ) : (
          <>
            {/* Top 7 KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <KpiCard
                label="Campaigns"
                value={summary?.total_campaigns.toLocaleString() || "0"}
                subtext="Total records"
                icon={<Layers className="w-3.5 h-3.5" />}
                variant="default"
              />
              <KpiCard
                label="Total Spend"
                value={`$${summary ? Math.round(summary.total_spend).toLocaleString() : "0"}`}
                subtext="Total budget deployed"
                icon={<DollarSign className="w-3.5 h-3.5" />}
                variant="brand"
              />
              <KpiCard
                label="Impressions"
                value={summary ? (summary.total_impressions / 1000).toFixed(1) + "k" : "0"}
                subtext="Ad views generated"
                icon={<Eye className="w-3.5 h-3.5" />}
                variant="default"
              />
              <KpiCard
                label="Clicks"
                value={summary?.total_clicks.toLocaleString() || "0"}
                subtext={`${summary?.total_impressions ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(2) : "0"}% CTR`}
                icon={<MousePointer className="w-3.5 h-3.5" />}
                variant="default"
              />
              <KpiCard
                label="Conversions"
                value={summary?.total_conversions.toLocaleString() || "0"}
                subtext="Approved conversions"
                icon={<CheckCircle className="w-3.5 h-3.5" />}
                variant="positive"
              />
              <KpiCard
                label="Average CPC"
                value={`$${summary?.average_cpc.toFixed(2) || "0.00"}`}
                subtext="Cost per click"
                icon={<Tag className="w-3.5 h-3.5" />}
                variant="default"
              />
              <KpiCard
                label="Average CPA"
                value={`$${summary?.average_cpa.toFixed(2) || "0.00"}`}
                subtext="Cost per acquisition"
                icon={<Target className="w-3.5 h-3.5" />}
                variant={summary && summary.average_cpa > 40 ? "warning" : "positive"}
              />
            </div>

            {/* Core Analytics Charts Grid (2 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waste Risk Distribution */}
              <RiskDistributionChart
                distribution={summary?.risk_distribution || {}}
              />

              {/* Conversion Potential Distribution */}
              <ConversionChart conversionSummary={conversionSummary} />

              {/* Campaign Performance Dispersion */}
              <div className="lg:col-span-2">
                <PerformanceChart campaigns={topWaste} />
              </div>
            </div>

            {/* High Waste Risk Section */}
            <HighWasteTable campaigns={topWaste} />

            {/* Detected Anomalies Section */}
            <AnomalyOverview anomalies={topAnomalies} />

            {/* Bottom 2-Col: High Potential Conversions & Recent Analyses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* High Potential Conversions */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      High Potential Conversions
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ads flagged with high predictive conversion probability
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {highPotentialList.length} candidates
                  </span>
                </div>

                {highPotentialList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No high potential conversions identified in the top 20 sample.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {highPotentialList.slice(0, 5).map((ad) => (
                      <div
                        key={ad.ad_id}
                        className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">
                              Ad #{ad.ad_id}
                            </span>
                            <PotentialBadge
                              potential={ad.conversion_potential}
                              probability={ad.conversion_probability}
                              size="sm"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Age {ad.age || "N/A"} • Gender {ad.gender || "N/A"} • CVR {ad.CVR.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-slate-900 block">
                            ${ad.Spent.toFixed(2)} spent
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            CPA: ${ad.CPA.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Analyses History */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      Recent Analyses History
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Switch between previously uploaded datasets
                    </p>
                  </div>
                  <Link
                    href="/history"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    View All
                  </Link>
                </div>

                {analysesHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    No previous analyses saved yet.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {analysesHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.id && selectAnalysis(item.id)}
                        className={`py-2.5 px-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                          item.id === currentAnalysis?.id
                            ? "bg-indigo-50/70 border border-indigo-100"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileSpreadsheet className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {item.filename}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(item.created_at || Date.now()).toLocaleDateString()} • {item.summary.total_campaigns} campaigns
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold text-slate-900 block">
                            ${Math.round(item.summary.total_spend).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-red-600 font-medium">
                            {item.summary.risk_distribution["High Risk"] || 0} high risk
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
