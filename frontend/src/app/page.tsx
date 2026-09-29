"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingDown,
  Sparkles,
  ShieldAlert,
  Binary,
  Bot,
  ArrowRight,
  Database,
  BarChart3,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user, signInDemo } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight">
                CampaignPulse
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                AI Waste Detector
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-slate-200 transition-colors">
              Platform Features
            </a>
            <a href="#models" className="hover:text-slate-200 transition-colors">
              ML Engine
            </a>
            <a href="#rag" className="hover:text-slate-200 transition-colors">
              RAG Intelligence
            </a>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Methodology
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <button
                  onClick={() => {
                    signInDemo();
                    window.location.href = "/dashboard";
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            FastAPI ML Backend + Supabase Auth + RAG Marketing Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop Burning Ad Spend on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-500">
              High-Risk & Underperforming Ads
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your campaign CSV to instantly calculate multi-signal waste risk, isolate statistical outliers using Isolation Forest, and forecast conversion potential with a grounded AI Marketing Assistant.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Analyze Campaign CSV</span>
            </Link>
            <button
              onClick={() => {
                signInDemo();
                window.location.href = "/dashboard";
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Explore 1,143 Record Demo</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur-sm max-w-4xl mx-auto text-left">
            <div className="p-3">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">
                Average Waste Unlocked
              </span>
              <span className="text-2xl font-bold text-white font-mono mt-0.5 block">
                18% – 32%
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Spend reallocated to winners
              </span>
            </div>
            <div className="p-3 border-t sm:border-t-0 sm:border-l border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">
                Anomaly Model
              </span>
              <span className="text-2xl font-bold text-cyan-400 font-mono mt-0.5 block">
                Isolation Forest
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Multi-dimensional outliers
              </span>
            </div>
            <div className="p-3 border-t sm:border-t-0 sm:border-l border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">
                Conversion Classifier
              </span>
              <span className="text-2xl font-bold text-indigo-400 font-mono mt-0.5 block">
                Gradient Boosting
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Demographic propensity
              </span>
            </div>
            <div className="p-3 border-t sm:border-t-0 sm:border-l border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">
                RAG Knowledge Base
              </span>
              <span className="text-2xl font-bold text-amber-400 font-mono mt-0.5 block">
                12 Domains
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Zero hallucinated facts
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Comprehensive Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Built for Performance Marketers & Growth Analysts
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Four specialized analytical engines working in unison to turn raw campaign exports into high-conviction optimization decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Multi-Signal Waste Risk
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Flags campaigns suffering from low CTR, excessive CPC, 10+ clicks without conversion, and spend without recorded clicks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-4">
                <Binary className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Isolation Forest Anomalies
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Detects multi-dimensional performance outliers without bias. Uncovers both runaway expenditure and unexpected breakout winners.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                Conversion Potential
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Predicts conversion probability across demographic and interest clusters, separating conversion upside from cost waste signals.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">
                RAG Marketing Assistant
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Answers complex diagnostic questions by synthesizing verified marketing domain benchmarks directly with your actual campaign numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Database Architecture */}
      <section id="models" className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Architecture Overview
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Enterprise-Grade Analytics Architecture
                </h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                PostgreSQL + Row-Level Security (RLS)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-xs">
              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  FastAPI Backend Server
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Preserves the existing ML pipelines for <code>POST /api/v1/analyze</code>, streaming analysis of large CSVs in milliseconds with low memory overhead.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Supabase Auth & Database
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Strict user data isolation with PostgreSQL foreign keys and Row Level Security. Each user only sees their own uploaded analyses and historical chats.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Next.js App Router UI
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Crafted with deliberate color psychology (Navy, Cyan, Emerald, Amber, Red), responsive desktop sidebar navigation, and Recharts analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6 text-center text-xs text-slate-500">
        <p>CampaignPulse Intelligence Platform • Built with Next.js, FastAPI, PostgreSQL & Supabase Auth</p>
      </footer>
    </div>
  );
}
