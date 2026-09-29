"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Database,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`-- Run schema.sql from the project root in your Supabase SQL Editor`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Account & System Config
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Platform Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your analyst profile, Supabase PostgreSQL authentication, and backend server endpoints.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{user?.fullName || "Analyst"}</h3>
              <p className="text-xs text-slate-500">{user?.email || "No email"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Role Title
              </label>
              <input
                type="text"
                readOnly
                value={user?.role || "Performance Growth Analyst"}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Account ID
              </label>
              <input
                type="text"
                readOnly
                value={user?.id || "local"}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Supabase & PostgreSQL Connection Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Supabase & PostgreSQL Database
              </h3>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isConfigured
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {isConfigured ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configured</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Local Preview Mode</span>
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The platform connects to Supabase Auth for identity and PostgreSQL tables (<code>analyses</code>, <code>campaign_records</code>, <code>anomalies</code>, <code>risk_results</code>) protected by Row-Level Security (RLS).
          </p>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Database Schema Migration</span>
              <button
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy SQL Script Notice"}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Apply <code>schema.sql</code> in the Supabase SQL editor to create all required tables and RLS policies.
            </p>
          </div>
        </div>

        {/* FastAPI ML Server Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Server className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              FastAPI Machine Learning Server
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Backend Endpoint
              </span>
              <input
                type="text"
                readOnly
                value="http://127.0.0.1:8000"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">
                Analysis Route
              </span>
              <input
                type="text"
                readOnly
                value="POST /api/v1/analyze"
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
