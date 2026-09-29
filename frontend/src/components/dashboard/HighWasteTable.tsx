"use client";

import React, { useState } from "react";
import { CampaignRecord } from "@/types";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { PotentialBadge } from "@/components/ui/PotentialBadge";
import { AlertOctagon, ChevronRight, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface HighWasteTableProps {
  campaigns: CampaignRecord[];
}

export const HighWasteTable: React.FC<HighWasteTableProps> = ({ campaigns }) => {
  const [selectedRecord, setSelectedRecord] = useState<CampaignRecord | null>(null);

  // Filter or prioritize High and Medium Risk campaigns
  const highRiskItems = campaigns.filter(
    (c) => c.waste_risk === "High Risk" || c.waste_risk === "Medium Risk"
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">
              High Waste Risk Campaigns
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
              {highRiskItems.length} flagged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked by waste risk score & spend leakage (top 20 analyzed)
          </p>
        </div>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <span>View All in Campaigns</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {highRiskItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No high waste risk campaigns flagged in this analysis.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="pb-2.5 font-semibold">Ad ID</th>
                <th className="pb-2.5 font-semibold">Risk Level</th>
                <th className="pb-2.5 font-semibold">Primary Waste Evidence</th>
                <th className="pb-2.5 font-semibold text-right">Spend</th>
                <th className="pb-2.5 font-semibold text-right">Clicks</th>
                <th className="pb-2.5 font-semibold text-right">CPA</th>
                <th className="pb-2.5 font-semibold text-right">Potential</th>
                <th className="pb-2.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {highRiskItems.slice(0, 8).map((campaign) => (
                <tr
                  key={campaign.ad_id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 font-mono font-bold text-slate-900">
                    #{campaign.ad_id}
                  </td>
                  <td className="py-2.5">
                    <RiskBadge risk={campaign.waste_risk} size="sm" />
                  </td>
                  <td className="py-2.5 max-w-xs truncate text-slate-600">
                    {campaign.waste_evidence}
                  </td>
                  <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                    ${campaign.Spent.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-600">
                    {campaign.Clicks}
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                    ${campaign.CPA.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right">
                    <PotentialBadge
                      potential={campaign.conversion_potential}
                      probability={campaign.conversion_probability}
                      size="sm"
                    />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setSelectedRecord(campaign)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campaign Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  Campaign Ad #{selectedRecord.ad_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Waste Classification
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <RiskBadge risk={selectedRecord.waste_risk} />
                    <span className="text-slate-500 font-mono text-[11px]">
                      Risk Score: {selectedRecord.waste_risk_score}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                    Evidence Strength
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRecord.evidence_strength}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 text-red-900">
                <span className="font-semibold block mb-1">
                  Detected Leakage Factors:
                </span>
                <p className="leading-relaxed">{selectedRecord.waste_evidence}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Spent</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ${selectedRecord.Spent.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Clicks</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedRecord.Clicks.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Conversions</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {selectedRecord.Approved_Conversion}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">CPA</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    ${selectedRecord.CPA.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-slate-600">
                  <strong>Demographics:</strong> Age {selectedRecord.age || "N/A"}, Gender {selectedRecord.gender || "N/A"}, Interest ID {selectedRecord.interest || "N/A"}
                </p>
                <p className="text-slate-600">
                  <strong>CPC:</strong> ${selectedRecord.CPC.toFixed(2)} • <strong>CTR:</strong> {selectedRecord.CTR.toFixed(3)}% • <strong>CVR:</strong> {selectedRecord.CVR.toFixed(2)}%
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-500">Predicted Conversion Potential:</span>
                  <PotentialBadge
                    potential={selectedRecord.conversion_potential}
                    probability={selectedRecord.conversion_probability}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
