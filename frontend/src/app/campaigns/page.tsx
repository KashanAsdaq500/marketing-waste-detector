"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAnalysis } from "@/context/AnalysisContext";
import { CampaignRecord } from "@/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { AnomalyBadge } from "@/components/ui/AnomalyBadge";
import { PotentialBadge } from "@/components/ui/PotentialBadge";
import { fetchCampaigns } from "@/lib/api";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  X,
  Layers,
  AlertTriangle,
  Info,
  DollarSign,
  MousePointer,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function CampaignsPage() {
  const { currentAnalysis } = useAnalysis();
  const [apiCampaigns, setApiCampaigns] = useState<CampaignRecord[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  // If no analysis is in context, we can load from the backend's /api/v1/campaigns
  useEffect(() => {
    if (!currentAnalysis) {
      setLoadingApi(true);
      fetchCampaigns("all", 100)
        .then((res) => setApiCampaigns(res.campaigns || []))
        .catch((err) => console.warn("Could not fetch API campaigns:", err))
        .finally(() => setLoadingApi(false));
    }
  }, [currentAnalysis]);

  const rawList: CampaignRecord[] = useMemo(() => {
    if (currentAnalysis && currentAnalysis.top_waste_risk.length > 0) {
      return currentAnalysis.top_waste_risk;
    }
    return apiCampaigns;
  }, [currentAnalysis, apiCampaigns]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [anomalyFilter, setAnomalyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"spend" | "cpa" | "cpc" | "clicks" | "risk_score">("spend");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selected Campaign for Detail Drawer
  const [selectedAd, setSelectedAd] = useState<CampaignRecord | null>(null);

  const filteredCampaigns = useMemo(() => {
    return rawList
      .filter((c) => {
        // Search
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchId = String(c.ad_id).includes(term);
          const matchFb = c.fb_campaign_id ? String(c.fb_campaign_id).includes(term) : false;
          const matchAge = c.age ? c.age.toLowerCase().includes(term) : false;
          const matchGender = c.gender ? c.gender.toLowerCase().includes(term) : false;
          const matchEvidence = c.waste_evidence ? c.waste_evidence.toLowerCase().includes(term) : false;
          if (!matchId && !matchFb && !matchAge && !matchGender && !matchEvidence) {
            return false;
          }
        }

        // Risk
        if (riskFilter !== "all" && c.waste_risk.toLowerCase() !== riskFilter.toLowerCase()) {
          return false;
        }

        // Anomaly
        if (anomalyFilter === "anomaly" && c.anomaly_label !== "Anomaly") {
          return false;
        }
        if (anomalyFilter === "normal" && c.anomaly_label === "Anomaly") {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        switch (sortBy) {
          case "spend":
            valA = a.Spent;
            valB = b.Spent;
            break;
          case "cpa":
            valA = a.CPA;
            valB = b.CPA;
            break;
          case "cpc":
            valA = a.CPC;
            valB = b.CPC;
            break;
          case "clicks":
            valA = a.Clicks;
            valB = b.Clicks;
            break;
          case "risk_score":
            valA = a.waste_risk_score;
            valB = b.waste_risk_score;
            break;
        }

        return sortOrder === "desc" ? valB - valA : valA - valB;
      });
  }, [rawList, searchTerm, riskFilter, anomalyFilter, sortBy, sortOrder]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Granular Breakdown
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Campaign-Level Performance Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter, sort, and inspect individual ad metrics, risk triggers, and anomaly rationale.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Ad ID, Campaign ID, Demographic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Risk:</span>
              </div>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Risk Levels</option>
                <option value="High Risk">High Risk Only</option>
                <option value="Medium Risk">Medium Risk Only</option>
                <option value="Low Risk">Low Risk Only</option>
              </select>

              <select
                value={anomalyFilter}
                onChange={(e) => setAnomalyFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All Anomaly Status</option>
                <option value="anomaly">Anomalies Only</option>
                <option value="normal">Normal Only</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="spend">Total Spend</option>
                <option value="cpa">CPA ($)</option>
                <option value="cpc">CPC ($)</option>
                <option value="clicks">Clicks</option>
                <option value="risk_score">Risk Score</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100"
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredCampaigns.length}</strong> of {rawList.length} campaign records
            </span>
            <span className="text-[11px] font-mono">
              Backend returns top records per query
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Ad ID</th>
                  <th className="py-3 px-3">Demographics</th>
                  <th className="py-3 px-3">Waste Risk</th>
                  <th className="py-3 px-3">Anomaly</th>
                  <th className="py-3 px-3">Potential</th>
                  <th className="py-3 px-3 text-right">Spend</th>
                  <th className="py-3 px-3 text-right">Clicks</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">CPC</th>
                  <th className="py-3 px-3 text-right">Conversions</th>
                  <th className="py-3 px-3 text-right">CPA</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCampaigns.map((c) => (
                  <tr
                    key={c.ad_id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{c.ad_id}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {c.age || "N/A"} • {c.gender || "N/A"}
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge risk={c.waste_risk} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      <AnomalyBadge
                        isAnomaly={c.anomaly_label === "Anomaly"}
                        score={c.anomaly_score}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <PotentialBadge
                        potential={c.conversion_potential}
                        probability={c.conversion_probability}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      ${c.Spent.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {c.Clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {c.CTR.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ${c.CPC.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {c.Approved_Conversion}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${c.CPA.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedAd(c)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Inspection Drawer */}
        {selectedAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-md h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Campaign Inspection
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 font-mono">
                    Ad #{selectedAd.ad_id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAd(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <RiskBadge risk={selectedAd.waste_risk} />
                <AnomalyBadge
                  isAnomaly={selectedAd.anomaly_label === "Anomaly"}
                  score={selectedAd.anomaly_score}
                />
                <PotentialBadge
                  potential={selectedAd.conversion_potential}
                  probability={selectedAd.conversion_probability}
                />
              </div>

              {/* Diagnostic Evidence */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <h4 className="font-semibold text-slate-900">Waste Risk Evidence</h4>
                <p className="text-slate-600 leading-relaxed">
                  {selectedAd.waste_evidence}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500">
                  <span>Risk Score: {selectedAd.waste_risk_score}</span>
                  <span>Strength: {selectedAd.evidence_strength}</span>
                </div>
              </div>

              {/* Anomaly Details if present */}
              {selectedAd.anomaly_label === "Anomaly" && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-4 space-y-2 text-xs">
                  <h4 className="font-semibold text-cyan-950">Anomaly Rationale</h4>
                  <p className="text-cyan-900 leading-relaxed">
                    {selectedAd.anomaly_reason || "Isolation Forest multi-dimensional outlier."}
                  </p>
                  <p className="text-cyan-800 font-mono text-[11px]">
                    Anomaly Distance Score: {selectedAd.anomaly_score?.toFixed(5)}
                  </p>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Total Spent</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    ${selectedAd.Spent.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Approved Conversions</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    {selectedAd.Approved_Conversion}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Cost Per Click (CPC)</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    ${selectedAd.CPC.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Cost Per Acquisition (CPA)</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    ${selectedAd.CPA.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Impressions</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    {selectedAd.Impressions.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Click-Through Rate</span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-1 block">
                    {selectedAd.CTR.toFixed(3)}%
                  </span>
                </div>
              </div>

              {/* Demographics & IDs */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs text-slate-600">
                <p><strong>XYZ Campaign ID:</strong> {selectedAd.xyz_campaign_id || "N/A"}</p>
                <p><strong>FB Campaign ID:</strong> {selectedAd.fb_campaign_id || "N/A"}</p>
                <p><strong>Age Tier:</strong> {selectedAd.age || "N/A"}</p>
                <p><strong>Gender:</strong> {selectedAd.gender || "N/A"}</p>
                <p><strong>Interest Segment:</strong> {selectedAd.interest || "N/A"}</p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAd(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
