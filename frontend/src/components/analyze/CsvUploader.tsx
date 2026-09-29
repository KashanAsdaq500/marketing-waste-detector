"use client";

import React, { useState, useRef } from "react";
import { uploadAndAnalyzeCsv } from "@/lib/api";
import { useAnalysis } from "@/context/AnalysisContext";
import { AnalysisResult } from "@/types";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Database,
} from "lucide-react";

interface CsvUploaderProps {
  onAnalysisSuccess?: (result: AnalysisResult) => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({ onAnalysisSuccess }) => {
  const { saveAnalysis } = useAnalysis();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<AnalysisResult | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setErrorMessage("Please select a valid CSV file (.csv format required).");
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    processFile(file);
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setSuccessResult(null);

    try {
      setProcessingStep("Uploading campaign data to FastAPI backend...");
      await new Promise((r) => setTimeout(r, 200));

      setProcessingStep("Executing ML pipeline (Metrics, Waste Risk, Isolation Forest & Conversions)...");
      const analysisData = await uploadAndAnalyzeCsv(file);

      const recordCount = analysisData.summary.total_campaigns;
      setProcessingStep(`Analyzed ${recordCount.toLocaleString()} campaign records successfully. Saving to database...`);

      const saved = await saveAnalysis(analysisData);

      setProcessingStep("Analysis complete.");
      await new Promise((r) => setTimeout(r, 300));
      setProcessingStep(null);
      setSuccessResult(saved);

      if (onAnalysisSuccess) {
        onAnalysisSuccess(saved);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setProcessingStep(null);
    }
  };

  // 1-Click sample loader
  const handleLoadSample = async () => {
    try {
      setProcessingStep("Fetching built-in benchmark dataset (KAG_conversion_data.csv)...");
      const response = await fetch("/api/backend/health");
      // Load sample CSV via a virtual File created from fetch or local content
      // We can fetch from public or backend or create a blob
      const csvResponse = await fetch("/sample-data.csv");
      let csvBlob: Blob;
      if (csvResponse.ok) {
        csvBlob = await csvResponse.blob();
      } else {
        // Fallback: fetch directly from backend analyze endpoint or sample mock
        const res = await fetch("/api/backend/campaigns?limit=500");
        if (!res.ok) throw new Error("Could not load sample data");
        // We will also place a copy in public folder
      }
    } catch {
      // In case /sample-data.csv is fetched
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-xl mx-auto text-center">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-8 md:p-10 cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-indigo-600 mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Drag & drop your Campaign CSV here
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
              Supports standard Facebook/Google advertising export headers:{" "}
              <code className="text-slate-700 font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">
                Impressions, Clicks, Spent, Approved_Conversion
              </code>
            </p>
            <button
              type="button"
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Processing State indicator */}
        {processingStep && (
          <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-left flex items-start gap-3 animate-in fade-in duration-200">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-indigo-950">
                {processingStep}
              </p>
              <div className="w-full bg-indigo-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-900">Analysis Failed</p>
              <p className="mt-0.5 text-xs text-red-700 leading-relaxed font-mono">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Success state */}
        {successResult && !processingStep && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-left flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-950">
                  Analysis Complete: {successResult.filename}
                </p>
                <p className="text-[11px] text-emerald-800">
                  {successResult.summary.total_campaigns.toLocaleString()} campaigns processed • ${successResult.summary.total_spend.toLocaleString()} spent • {successResult.summary.anomalies_detected} anomalies detected
                </p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Sample helper bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            <span>Need a dataset to test?</span>
          </div>
          <a
            href="/sample-data.csv"
            download="KAG_conversion_data.csv"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>Download Sample CSV (1,143 records)</span>
          </a>
        </div>
      </div>
    </div>
  );
};
