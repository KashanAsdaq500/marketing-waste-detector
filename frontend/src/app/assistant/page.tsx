"use client";

import React from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AssistantChat } from "@/components/assistant/AssistantChat";
import { useAnalysis } from "@/context/AnalysisContext";
import { Sparkles, Info, BookOpen, Layers, Target, ShieldAlert } from "lucide-react";

export default function AssistantPage() {
  const { currentAnalysis } = useAnalysis();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                AI Advisory
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                RAG Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              Campaign Intelligence Assistant
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Grounded marketing recommendations synthesized from 12 performance disciplines and your active campaign metrics.
            </p>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] text-xs text-slate-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Grounding & Fact Separation Policy
              </p>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                The assistant strictly separates <strong>actual campaign measurements</strong> (from your uploaded CSV) from <strong>best-practice marketing guidance</strong> (from our verified RAG domain library). No facts are hallucinated.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              Waste Risk
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              Conversion CRO
            </span>
          </div>
        </div>

        {/* Main Chat Interface */}
        <AssistantChat />
      </div>
    </AppLayout>
  );
}
