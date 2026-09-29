"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Info,
  ShieldAlert,
  Binary,
  Target,
  Bot,
  Database,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            System Documentation
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            About CampaignPulse Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Architectural principles, ML model specifications, and analytical methodologies.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
          <h3 className="text-base font-bold text-slate-900">
            Project Mission
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In modern performance marketing across Meta, Google, and TikTok, advertising budgets bleed silently through thousands of fragmented micro-campaigns and ad variations.
            CampaignPulse unites statistical heuristics with unsupervised anomaly detection and supervised propensity modeling to provide growth teams with instant, grounded diagnostic intelligence.
          </p>
        </div>

        {/* The 4 Analytical Engines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engine 1: Waste Risk */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-red-50 text-red-700">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  1. Waste Risk Engine
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Multi-Signal Heuristic Scoring
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes distribution percentiles (25th, 75th, 90th) across CTR, CPC, and CPA dynamically per dataset. Combines zero-conversion penalties (10+ clicks with zero conversions) with extreme cost triggers to categorize records into Low, Medium, and High Risk.
            </p>
          </div>

          {/* Engine 2: Isolation Forest */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                <Binary className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  2. ML Anomaly Detection
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Isolation Forest Algorithm
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects multi-dimensional feature outliers without preconceptions. Isolates unusual combinations of spend, impressions, clicks, and conversion rates. Crucially, anomalies are treated as points of interest—either runaway waste or unprecedented breakout efficiency.
            </p>
          </div>

          {/* Engine 3: Conversion Prediction */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  3. Conversion Propensity
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Supervised Classification Pipeline
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applies trained ML pipelines to demographic factors (Age, Gender, Interest cluster) and interaction volume to output calibrated conversion probabilities. Categorizes campaigns into High (≥70%), Medium (40-69%), and Low (&lt;40%) conversion potential.
            </p>
          </div>

          {/* Engine 4: RAG Assistant */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  4. RAG Intelligence
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  12 Marketing Knowledge Domains
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Retrieves verified marketing heuristics covering CTR, CPC, CPA, CVR, ad fatigue, and budget allocation, grounding recommendations directly in the user&apos;s actual uploaded numbers without hallucinating marketing benchmarks.
            </p>
          </div>
        </div>

        {/* Tech Stack Summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Technology Stack & Integration
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">FastAPI</span>
              <span className="text-slate-500 text-[11px]">Python ML Backend</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Next.js 14</span>
              <span className="text-slate-500 text-[11px]">App Router & React 18</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">PostgreSQL</span>
              <span className="text-slate-500 text-[11px]">Supabase Database & Auth</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-900 block">Scikit-Learn</span>
              <span className="text-slate-500 text-[11px]">Isolation Forest & Models</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
