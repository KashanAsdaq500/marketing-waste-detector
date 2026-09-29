import { AnalysisResult } from "@/types";

const LOCAL_STORAGE_PREFIX = "mwd_analyses_";

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function saveUserAnalysis(
  userId: string,
  analysis: AnalysisResult
): Promise<AnalysisResult> {
  const analysisWithMeta: AnalysisResult = {
    ...analysis,
    id:
      analysis.id ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `analysis_${Date.now()}`),
    created_at: analysis.created_at || new Date().toISOString(),
    user_id: userId,
  };

  // Demo users continue using browser localStorage.
  if (userId.startsWith("demo_")) {
    if (typeof window !== "undefined") {
      try {
        const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
        const existingRaw = localStorage.getItem(storageKey);
        const existing: AnalysisResult[] = existingRaw
          ? JSON.parse(existingRaw)
          : [];

        const updated = [
          analysisWithMeta,
          ...existing.filter((item) => item.id !== analysisWithMeta.id),
        ];

        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (err) {
        console.error("LocalStorage save error:", err);
      }
    }

    return analysisWithMeta;
  }

  try {
    const result = await apiRequest<{
      success: boolean;
      analysis: AnalysisResult;
    }>("/api/analyses", {
      method: "POST",
      body: JSON.stringify(analysisWithMeta),
    });

    return result.analysis;
  } catch (err) {
    console.warn(
      "Could not save analysis to Neon, saving to local store:",
      err
    );

    if (typeof window !== "undefined") {
      try {
        const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
        const existingRaw = localStorage.getItem(storageKey);
        const existing: AnalysisResult[] = existingRaw
          ? JSON.parse(existingRaw)
          : [];

        const updated = [
          analysisWithMeta,
          ...existing.filter((item) => item.id !== analysisWithMeta.id),
        ];

        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (localError) {
        console.error("LocalStorage save error:", localError);
      }
    }

    return analysisWithMeta;
  }
}

export async function getUserAnalyses(
  userId: string
): Promise<AnalysisResult[]> {
  // Demo users continue using browser localStorage.
  if (userId.startsWith("demo_")) {
    if (typeof window !== "undefined") {
      try {
        const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
        const raw = localStorage.getItem(storageKey);

        if (raw) {
          return JSON.parse(raw);
        }
      } catch (err) {
        console.error("LocalStorage read error:", err);
      }
    }

    return [];
  }

  try {
    const result = await apiRequest<{
      analyses: AnalysisResult[];
    }>("/api/analyses");

    return result.analyses || [];
  } catch (err) {
    console.warn(
      "Could not fetch analyses from Neon, falling back to local store:",
      err
    );
  }

  if (typeof window !== "undefined") {
    try {
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const raw = localStorage.getItem(storageKey);

      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("LocalStorage read error:", err);
    }
  }

  return [];
}

export async function deleteUserAnalysis(
  userId: string,
  analysisId: string
): Promise<void> {
  // Demo users continue using browser localStorage.
  if (userId.startsWith("demo_")) {
    if (typeof window !== "undefined") {
      try {
        const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
        const existingRaw = localStorage.getItem(storageKey);

        if (existingRaw) {
          const existing: AnalysisResult[] = JSON.parse(existingRaw);
          const filtered = existing.filter(
            (item) => item.id !== analysisId
          );

          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      } catch (err) {
        console.error("LocalStorage delete error:", err);
      }
    }

    return;
  }

  try {
    await apiRequest(`/api/analyses/${analysisId}`, {
      method: "DELETE",
    });
  } catch (err) {
    console.warn(
      "Could not delete analysis from Neon, deleting from local store:",
      err
    );

    if (typeof window !== "undefined") {
      try {
        const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
        const existingRaw = localStorage.getItem(storageKey);

        if (existingRaw) {
          const existing: AnalysisResult[] = JSON.parse(existingRaw);
          const filtered = existing.filter(
            (item) => item.id !== analysisId
          );

          localStorage.setItem(storageKey, JSON.stringify(filtered));
        }
      } catch (localError) {
        console.error("LocalStorage delete error:", localError);
      }
    }
  }
}