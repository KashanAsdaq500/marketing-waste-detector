export type WasteRiskLevel = "Low Risk" | "Medium Risk" | "High Risk";

export type ConversionPotentialLevel =
  | "High Potential"
  | "Medium Potential"
  | "Low Potential";

export type EvidenceStrength =
  | "Strong"
  | "Moderate"
  | "Weak"
  | "Insufficient Data";

export interface CampaignRecord {
  ad_id: number;
  xyz_campaign_id?: number | null;
  fb_campaign_id?: number | null;
  age?: string | null;
  gender?: string | null;
  interest?: number | null;
  Impressions: number;
  Clicks: number;
  Spent: number;
  Total_Conversion?: number;
  Approved_Conversion: number;
  CTR: number;
  CPC: number;
  CVR: number;
  CPA: number;
  waste_risk: WasteRiskLevel;
  waste_risk_score: number;
  waste_evidence: string;
  evidence_strength: EvidenceStrength;
  anomaly_label?: string | null;
  anomaly_score?: number | null;
  anomaly_reason?: string | null;
  conversion_probability?: number | null;
  predicted_conversion?: number | null;
  conversion_potential?: ConversionPotentialLevel | null;
  data_quality_flag?: string;
  has_spend?: boolean;
  has_clicks?: boolean;
  has_conversions?: boolean;
  low_ctr_signal?: boolean;
  high_cpc_signal?: boolean;
  very_high_cpc_signal?: boolean;
  high_cpa_signal?: boolean;
  very_high_cpa_signal?: boolean;
}

export interface AnalysisSummary {
  total_campaigns: number;
  total_spend: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  average_cpc: number;
  average_cpa: number;
  risk_distribution: {
    "Low Risk"?: number;
    "Medium Risk"?: number;
    "High Risk"?: number;
    [key: string]: number | undefined;
  };
  anomalies_detected: number;
}

export interface ConversionSummary {
  available: boolean;
  high_potential?: number;
  medium_potential?: number;
  low_potential?: number;
}

export interface ModelsStatus {
  waste_risk: boolean;
  anomaly_detection: boolean;
  conversion_prediction: boolean;
}

export interface AnalysisResult {
  id?: string;
  filename: string;
  created_at?: string;
  summary: AnalysisSummary;
  models: ModelsStatus;
  conversion_summary: ConversionSummary;
  top_waste_risk: CampaignRecord[];
  top_anomalies: CampaignRecord[];
  records_returned: {
    top_waste_risk: number;
    top_anomalies: number;
  };
  note?: string;
  user_id?: string;
}

export interface RAGKnowledgeSource {
  title: string;
  category: string;
  keyRule: string;
  benchmark?: string;
  sourceName?: string;
  sourceUrl?: string;
}

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  ragSources?: RAGKnowledgeSource[];
  campaignMetricsReferenced?: {
    totalSpend?: number;
    avgCPC?: number;
    avgCPA?: number;
    highRiskCount?: number;
    anomalyCount?: number;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
}