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

interface RiskDistributionChartProps {
  distribution: {
    "Low Risk"?: number;
    "Medium Risk"?: number;
    "High Risk"?: number;
    [key: string]: number | undefined;
  };
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  distribution,
}) => {
  const low = distribution["Low Risk"] || 0;
  const medium = distribution["Medium Risk"] || 0;
  const high = distribution["High Risk"] || 0;
  const total = low + medium + high || 1;

  const data = [
    {
      name: "Low Risk",
      count: low,
      percent: ((low / total) * 100).toFixed(1),
      color: "#10B981", // emerald
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      name: "Medium Risk",
      count: medium,
      percent: ((medium / total) * 100).toFixed(1),
      color: "#F59E0B", // amber
      bg: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      name: "High Risk",
      count: high,
      percent: ((high / total) * 100).toFixed(1),
      color: "#EF4444", // red
      bg: "bg-red-50 text-red-800 border-red-200",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Waste Risk Distribution
          </h4>
          <p className="text-xs text-slate-500">
            Rule-based multi-signal evaluation across all campaigns
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-400">
          {total} total
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
              width={90}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                      <p className="font-semibold text-slate-900">{d.name}</p>
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
            <span className="text-[10px] font-semibold uppercase text-slate-500 block">
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
