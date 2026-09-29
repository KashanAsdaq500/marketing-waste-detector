import { AnalysisResult } from "@/types";
import { isSupabaseConfigured, supabase } from "./supabase";

const LOCAL_STORAGE_PREFIX = "mwd_analyses_";

export async function saveUserAnalysis(
  userId: string,
  analysis: AnalysisResult
): Promise<AnalysisResult> {
  const analysisWithMeta: AnalysisResult = {
    ...analysis,
    id: analysis.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `analysis_${Date.now()}`),
    created_at: analysis.created_at || new Date().toISOString(),
    user_id: userId,
  };

  // If Supabase is configured and user is signed in with a real UUID
  if (isSupabaseConfigured && supabase && userId && !userId.startsWith("demo_")) {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .insert({
          id: analysisWithMeta.id,
          user_id: userId,
          filename: analysisWithMeta.filename,
          total_campaigns: analysisWithMeta.summary.total_campaigns,
          total_spend: analysisWithMeta.summary.total_spend,
          total_impressions: analysisWithMeta.summary.total_impressions,
          total_clicks: analysisWithMeta.summary.total_clicks,
          total_conversions: analysisWithMeta.summary.total_conversions,
          average_cpc: analysisWithMeta.summary.average_cpc,
          average_cpa: analysisWithMeta.summary.average_cpa,
          risk_distribution: analysisWithMeta.summary.risk_distribution,
          anomalies_detected: analysisWithMeta.summary.anomalies_detected,
          models_available: analysisWithMeta.models,
          conversion_summary: analysisWithMeta.conversion_summary,
        })
        .select()
        .single();

      if (!error && data) {
        // Also save campaign records batch if table exists
        const campaignRows = [
          ...analysisWithMeta.top_waste_risk.map((c) => ({
            analysis_id: analysisWithMeta.id,
            ad_id: c.ad_id,
            xyz_campaign_id: c.xyz_campaign_id,
            fb_campaign_id: c.fb_campaign_id,
            age: c.age,
            gender: c.gender,
            interest: c.interest,
            impressions: c.Impressions,
            clicks: c.Clicks,
            spent: c.Spent,
            approved_conversion: c.Approved_Conversion,
            ctr: c.CTR,
            cpc: c.CPC,
            cvr: c.CVR,
            cpa: c.CPA,
            waste_risk: c.waste_risk,
            waste_risk_score: c.waste_risk_score,
            waste_evidence: c.waste_evidence,
            evidence_strength: c.evidence_strength,
            anomaly_label: c.anomaly_label,
            anomaly_score: c.anomaly_score,
            anomaly_reason: c.anomaly_reason,
            conversion_probability: c.conversion_probability,
            predicted_conversion: c.predicted_conversion,
            conversion_potential: c.conversion_potential,
          })),
        ];

        if (campaignRows.length > 0) {
          await supabase.from("campaign_records").insert(campaignRows);
        }
      }
    } catch (err) {
      console.warn("Could not save to Supabase directly, saving to local store:", err);
    }
  }

  // Always keep user-scoped local storage for fast instant switching and offline resilience
  if (typeof window !== "undefined") {
    try {
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existing: AnalysisResult[] = existingRaw ? JSON.parse(existingRaw) : [];
      // Prepend the new one, dedup by ID
      const filtered = existing.filter((item) => item.id !== analysisWithMeta.id);
      filtered.unshift(analysisWithMeta);
      localStorage.setItem(storageKey, JSON.stringify(filtered.slice(0, 30)));
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }
  }

  return analysisWithMeta;
}

export async function getUserAnalyses(userId: string): Promise<AnalysisResult[]> {
  if (!userId) return [];

  // Try Supabase first if configured
  if (isSupabaseConfigured && supabase && !userId.startsWith("demo_")) {
    try {
      const { data, error } = await supabase
        .from("analyses")
        .select(`
          id,
          user_id,
          filename,
          total_campaigns,
          total_spend,
          total_impressions,
          total_clicks,
          total_conversions,
          average_cpc,
          average_cpa,
          risk_distribution,
          anomalies_detected,
          models_available,
          conversion_summary,
          created_at,
          campaign_records (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          filename: row.filename,
          created_at: row.created_at,
          user_id: row.user_id,
          summary: {
            total_campaigns: row.total_campaigns,
            total_spend: Number(row.total_spend),
            total_impressions: Number(row.total_impressions),
            total_clicks: Number(row.total_clicks),
            total_conversions: Number(row.total_conversions),
            average_cpc: Number(row.average_cpc),
            average_cpa: Number(row.average_cpa),
            risk_distribution: row.risk_distribution || {},
            anomalies_detected: row.anomalies_detected || 0,
          },
          models: row.models_available || {
            waste_risk: true,
            anomaly_detection: true,
            conversion_prediction: true,
          },
          conversion_summary: row.conversion_summary || { available: true },
          top_waste_risk: (row.campaign_records || [])
            .map((c: any) => ({
              ad_id: c.ad_id,
              xyz_campaign_id: c.xyz_campaign_id,
              fb_campaign_id: c.fb_campaign_id,
              age: c.age,
              gender: c.gender,
              interest: c.interest,
              Impressions: Number(c.impressions),
              Clicks: Number(c.clicks),
              Spent: Number(c.spent),
              Approved_Conversion: Number(c.approved_conversion),
              CTR: Number(c.ctr),
              CPC: Number(c.cpc),
              CVR: Number(c.cvr),
              CPA: Number(c.cpa),
              waste_risk: c.waste_risk,
              waste_risk_score: c.waste_risk_score,
              waste_evidence: c.waste_evidence,
              evidence_strength: c.evidence_strength,
              anomaly_label: c.anomaly_label,
              anomaly_score: c.anomaly_score ? Number(c.anomaly_score) : null,
              anomaly_reason: c.anomaly_reason,
              conversion_probability: c.conversion_probability ? Number(c.conversion_probability) : null,
              predicted_conversion: c.predicted_conversion,
              conversion_potential: c.conversion_potential,
            }))
            .slice(0, 20),
          top_anomalies: (row.campaign_records || [])
            .filter((c: any) => c.anomaly_label === "Anomaly")
            .map((c: any) => ({
              ad_id: c.ad_id,
              xyz_campaign_id: c.xyz_campaign_id,
              fb_campaign_id: c.fb_campaign_id,
              age: c.age,
              gender: c.gender,
              interest: c.interest,
              Impressions: Number(c.impressions),
              Clicks: Number(c.clicks),
              Spent: Number(c.spent),
              Approved_Conversion: Number(c.approved_conversion),
              CTR: Number(c.ctr),
              CPC: Number(c.cpc),
              CVR: Number(c.cvr),
              CPA: Number(c.cpa),
              waste_risk: c.waste_risk,
              waste_risk_score: c.waste_risk_score,
              waste_evidence: c.waste_evidence,
              evidence_strength: c.evidence_strength,
              anomaly_label: c.anomaly_label,
              anomaly_score: c.anomaly_score ? Number(c.anomaly_score) : null,
              anomaly_reason: c.anomaly_reason,
              conversion_probability: c.conversion_probability ? Number(c.conversion_probability) : null,
              predicted_conversion: c.predicted_conversion,
              conversion_potential: c.conversion_potential,
            }))
            .slice(0, 20),
          records_returned: {
            top_waste_risk: 20,
            top_anomalies: 20,
          },
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local store:", err);
    }
  }

  // Fallback to local storage (user-isolated)
  if (typeof window !== "undefined") {
    try {
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.error("LocalStorage read error:", err);
    }
  }

  return [];
}

export function deleteUserAnalysis(userId: string, analysisId: string): void {
  if (typeof window !== "undefined") {
    try {
      const storageKey = `${LOCAL_STORAGE_PREFIX}${userId}`;
      const existingRaw = localStorage.getItem(storageKey);
      if (existingRaw) {
        const existing: AnalysisResult[] = JSON.parse(existingRaw);
        const filtered = existing.filter((item) => item.id !== analysisId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
      }
    } catch (err) {
      console.error("LocalStorage delete error:", err);
    }
  }
}
