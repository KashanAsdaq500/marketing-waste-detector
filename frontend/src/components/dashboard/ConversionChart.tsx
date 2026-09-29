"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ConversionSummary } from "@/types";

interface ConversionChartProps {
  conversionSummary?: ConversionSummary;
}

export const ConversionChart: React.FC<ConversionChartProps> = ({
  conversionSummary,
}) => {
  if (!conversionSummary || !conversionSummary.available) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center min-h-[260px] text-center">
        <p className="text-sm font-semibold text-slate-700">Conversion Prediction</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Conversion prediction requires demographic & campaign ID features.
        </p>
      </div>
    );
  }

  const high = conversionSummary.high_potential || 0;
  const medium = conversionSummary.medium_potential || 0;
  const low = conversionSummary.low_potential || 0;
  const total = high + medium + low || 1;

  const data = [
    {
      name: "High Potential",
      sublabel: "≥70% prob",
      count: high,
      percent: ((high / total) * 100).toFixed(1),
      color: "#4F46E5", // indigo-600
    },
    {
      name: "Medium Potential",
      sublabel: "40-69% prob",
      count: medium,
      percent: ((medium / total) * 100).toFixed(1),
      color: "#0284C7", // sky-600
    },
    {
      name: "Low Potential",
      sublabel: "<40% prob",
      count: low,
      percent: ((low / total) * 100).toFixed(1),
      color: "#94A3B8", // slate-400
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Conversion Potential Distribution
          </h4>
          <p className="text-xs text-slate-500">
            Supervised ML model scoring conversion propensity
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400">
          Separate from Waste Risk
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
              width={110}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                      <p className="font-semibold text-slate-900">{d.name} ({d.sublabel})</p>
                      <p className="text-slate-600 mt-0.5">
                        {d.count.toLocaleString()} campaigns ({d.percent}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
        {data.map((item) => (
          <div key={item.name} className="px-2 py-1.5 rounded-lg bg-slate-50">
            <span className="text-[10px] font-semibold uppercase text-slate-500 block truncate">
              {item.name}
            </span>
            <span className="text-sm font-bold font-mono text-slate-900">
              {item.count.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {item.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
