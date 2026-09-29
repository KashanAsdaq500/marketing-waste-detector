"use client";

import React, { useState } from "react";
import { CampaignRecord } from "@/types";
import { AnomalyBadge } from "@/components/ui/AnomalyBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Info, ChevronRight, X } from "lucide-react";

interface AnomalyOverviewProps {
  anomalies: CampaignRecord[];
}

export const AnomalyOverview: React.FC<AnomalyOverviewProps> = ({ anomalies }) => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<CampaignRecord | null>(null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">
              Detected Anomalies
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
              {anomalies.length} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical outliers identified by Isolation Forest
          </p>
        </div>
      </div>

      {/* Explanatory banner */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-800">What is an anomaly?</strong> An anomaly represents an unusual multi-dimensional combination in the data. It is <em>not automatically bad</em>—it highlights atypical spend, runaway bids, or unexpected breakout performance that deserves closer inspection.
        </p>
      </div>

      {anomalies.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center italic">
          No statistical anomalies flagged in this dataset.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="pb-2.5 font-semibold">Ad ID</th>
                <th className="pb-2.5 font-semibold">Anomaly Reason</th>
                <th className="pb-2.5 font-semibold">Anomaly Score</th>
                <th className="pb-2.5 font-semibold text-right">Spend</th>
                <th className="pb-2.5 font-semibold text-right">Clicks</th>
                <th className="pb-2.5 font-semibold text-right">Conversions</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {anomalies.slice(0, 7).map((item) => (
                <tr key={item.ad_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-mono font-semibold text-slate-900">
                    #{item.ad_id}
                  </td>
                  <td className="py-2.5 max-w-xs truncate text-slate-600">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {item.anomaly_reason || "Unusual performance signature"}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <AnomalyBadge
                      isAnomaly={true}
                      score={item.anomaly_score}
                      size="sm"
                    />
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                    ${item.Spent.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-600">
                    {item.Clicks.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                    {item.Approved_Conversion}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setSelectedAnomaly(item)}
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
      )}

      {/* Inspect Anomaly Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Anomaly Deep Dive
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-mono">
                  Campaign Ad #{selectedAnomaly.ad_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-lg bg-cyan-50/70 border border-cyan-200 p-3">
                <span className="font-semibold text-cyan-950 block mb-1">
                  Why was this flagged?
                </span>
                <p className="text-cyan-900 leading-relaxed">
                  {selectedAnomaly.anomaly_reason || "Isolation Forest detected high residual isolation distance across spend and conversion ratios."}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-[11px] text-cyan-800 font-mono">
                    Anomaly Score: <strong>{selectedAnomaly.anomaly_score?.toFixed(6) ?? "N/A"}</strong>
                  </span>
                  <RiskBadge risk={selectedAnomaly.waste_risk} size="sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Spend</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ${selectedAnomaly.Spent.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Clicks</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedAnomaly.Clicks.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">CTR</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedAnomaly.CTR.toFixed(3)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">CPA</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ${selectedAnomaly.CPA.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-slate-500">
                  <strong>Audience Demographics:</strong> Age {selectedAnomaly.age || "N/A"} • Gender {selectedAnomaly.gender || "N/A"} • Interest #{selectedAnomaly.interest || "N/A"}
                </p>
                <p className="text-slate-500">
                  <strong>Evidence Strength:</strong> {selectedAnomaly.evidence_strength}
                </p>
                <p className="text-slate-500">
                  <strong>Waste Risk Evidence:</strong> {selectedAnomaly.waste_evidence}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedAnomaly(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
