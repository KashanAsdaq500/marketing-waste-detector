import { AnalysisResult, CampaignRecord } from "@/types";

const API_BASE = "/api/backend";export async function checkBackendHealth(): Promise<{
  status: string;
  service: string;
  processed_data_loaded: boolean;
  anomaly_data_loaded: boolean;
  conversion_model_loaded: boolean;
  anomaly_model_loaded: boolean;
}> {
  try {
const res = await fetch(`${API_BASE}/health`,{
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot connect to Marketing Intelligence API (${API_BASE}): ${msg}`);
  }
}

export async function uploadAndAnalyzeCsv(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/backend/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errorDetail = `Analysis failed with status ${res.status}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) {
        if (typeof errorJson.detail === "string") {
          errorDetail = errorJson.detail;
        } else if (errorJson.detail.message) {
          errorDetail = `${errorJson.detail.message} Missing: ${(errorJson.detail.missing_columns || []).join(", ")}`;
        }
      }
    } catch {
      // Ignore JSON parse error on non-json error responses
    }
    throw new Error(errorDetail);
  }

  const data: AnalysisResult = await res.json();
  return data;
}

export async function fetchCampaigns(risk?: string, limit = 100): Promise<{
  count: number;
  campaigns: CampaignRecord[];
}> {
  const query = new URLSearchParams();
  if (risk && risk !== "all") query.append("risk", risk);
  query.append("limit", String(limit));

  const res = await fetch(`${API_BASE}/campaigns?${query.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load campaigns: ${res.status}`);
  return await res.json();
}

export async function fetchAnomalies(limit = 20): Promise<{
  count: number;
  anomalies: CampaignRecord[];
}> {
  const res = await fetch(`${API_BASE}/anomalies?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load anomalies: ${res.status}`);
  return await res.json();
}

export async function fetchCampaignDetail(adId: number): Promise<CampaignRecord> {
  const res = await fetch(`${API_BASE}/campaigns/${adId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Campaign ${adId} not found`);
  return await res.json();
}


