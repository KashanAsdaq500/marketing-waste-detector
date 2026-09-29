"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AnalysisResult } from "@/types";
import { getUserAnalyses, saveUserAnalysis, deleteUserAnalysis } from "@/lib/storage";
import { useAuth } from "./AuthContext";

interface AnalysisContextType {
  currentAnalysis: AnalysisResult | null;
  analysesHistory: AnalysisResult[];
  loading: boolean;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  saveAnalysis: (analysis: AnalysisResult) => Promise<AnalysisResult>;
  selectAnalysis: (id: string) => void;
  deleteAnalysisItem: (id: string) => void;
  refreshHistory: () => Promise<void>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysesHistory, setAnalysesHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshHistory = useCallback(async () => {
    if (!user) {
      setAnalysesHistory([]);
      return;
    }
    setLoading(true);
    try {
      const history = await getUserAnalyses(user.id);
      setAnalysesHistory(history);
      if (history.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(history[0]);
      }
    } catch (err) {
      console.error("Error refreshing analysis history:", err);
    } finally {
      setLoading(false);
    }
  }, [user, currentAnalysis]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const saveAnalysis = async (analysis: AnalysisResult): Promise<AnalysisResult> => {
    if (!user) throw new Error("Must be logged in to save analysis");
    const saved = await saveUserAnalysis(user.id, analysis);
    setCurrentAnalysis(saved);
    await refreshHistory();
    return saved;
  };

  const selectAnalysis = (id: string) => {
    const found = analysesHistory.find((a) => a.id === id);
    if (found) {
      setCurrentAnalysis(found);
    }
  };

  const deleteAnalysisItem = (id: string) => {
    if (!user) return;
    deleteUserAnalysis(user.id, id);
    setAnalysesHistory((prev) => prev.filter((a) => a.id !== id));
    if (currentAnalysis?.id === id) {
      const remaining = analysesHistory.filter((a) => a.id !== id);
      setCurrentAnalysis(remaining.length > 0 ? remaining[0] : null);
    }
  };

  return (
    <AnalysisContext.Provider
      value={{
        currentAnalysis,
        analysesHistory,
        loading,
        setCurrentAnalysis,
        saveAnalysis,
        selectAnalysis,
        deleteAnalysisItem,
        refreshHistory,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
