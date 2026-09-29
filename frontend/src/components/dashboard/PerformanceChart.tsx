"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CampaignRecord } from "@/types";

interface PerformanceChartProps {
  campaigns: CampaignRecord[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ campaigns }) => {
  const [metricMode, setMetricMode] = useState<"spend_vs_conversions" | "cpc_vs_cpa">(
    "spend_vs_conversions"
  );

  const data = campaigns.map((c) => ({
    ad_id: c.ad_id,
    spend: Number(c.Spent.toFixed(2)),
    conversions: c.Approved_Conversion,
    cpc: Number(c.CPC.toFixed(2)),
    cpa: Number(c.CPA.toFixed(2)),
    ctr: Number(c.CTR.toFixed(2)),
    clicks: c.Clicks,
    risk: c.waste_risk,
    color:
      c.waste_risk === "High Risk"
        ? "#EF4444"
        : c.waste_risk === "Medium Risk"
        ? "#F59E0B"
        : "#10B981",
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Campaign Performance Dispersion
          </h4>
          <p className="text-xs text-slate-500">
            {metricMode === "spend_vs_conversions"
              ? "Spend vs. Approved Conversions (Hover points to inspect individual ads)"
              : "CPC vs. CPA Efficiency Matrix"}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
          <button
            onClick={() => setMetricMode("spend_vs_conversions")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metricMode === "spend_vs_conversions"
                ? "bg-white text-indigo-700 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Spend vs Conversions
          </button>
          <button
            onClick={() => setMetricMode("cpc_vs_cpa")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              metricMode === "cpc_vs_cpa"
                ? "bg-white text-indigo-700 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            CPC vs CPA
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            {metricMode === "spend_vs_conversions" ? (
              <>
                <XAxis
                  type="number"
                  dataKey="spend"
                  name="Spend"
                  unit="$"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "Total Spend ($)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  type="number"
                  dataKey="conversions"
                  name="Conversions"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "Conversions", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }}
                />
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  dataKey="cpc"
                  name="CPC"
                  unit="$"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "CPC ($)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748B" }}
                />
                <YAxis
                  type="number"
                  dataKey="cpa"
                  name="CPA"
                  unit="$"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  label={{ value: "CPA ($)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748B" }}
                />
              </>
            )}
            <ZAxis range={[60, 60]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-1">
                      <p className="font-bold text-slate-900 font-mono">
                        Ad #{d.ad_id} ({d.risk})
                      </p>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-1 text-slate-600">
                        <span>Spend:</span>
                        <span className="font-mono font-semibold text-slate-900">${d.spend}</span>
                        <span>Conversions:</span>
                        <span className="font-mono font-semibold text-slate-900">{d.conversions}</span>
                        <span>CPC:</span>
                        <span className="font-mono font-semibold text-slate-900">${d.cpc}</span>
                        <span>CPA:</span>
                        <span className="font-mono font-semibold text-slate-900">${d.cpa}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={data} fill="#4F46E5" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Low Risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          Medium Risk
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          High Risk
        </span>
      </div>
    </div>
  );
};
