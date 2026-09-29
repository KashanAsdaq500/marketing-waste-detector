import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

async function ensureProfile(userId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unable to load Clerk user");
  }

  const email =
    clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.local`;

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    email.split("@")[0];

  await sql.query(
    `INSERT INTO profiles (id, email, full_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (id)
     DO UPDATE SET
       email = EXCLUDED.email,
       full_name = EXCLUDED.full_name,
       updated_at = NOW()`,
    [userId, email, fullName]
  );
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await ensureProfile(userId);

    const rows = await sql.query(
      `SELECT
        a.id,
        a.filename,
        a.total_campaigns,
        a.total_spend,
        a.total_impressions,
        a.total_clicks,
        a.total_conversions,
        a.average_cpc,
        a.average_cpa,
        a.risk_distribution,
        a.anomalies_detected,
        a.models_available,
        a.conversion_summary,
        a.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'ad_id', c.ad_id,
              'xyz_campaign_id', c.xyz_campaign_id,
              'fb_campaign_id', c.fb_campaign_id,
              'age', c.age,
              'gender', c.gender,
              'interest', c.interest,
              'Impressions', c.impressions,
              'Clicks', c.clicks,
              'Spent', c.spent,
              'Approved_Conversion', c.approved_conversion,
              'CTR', c.ctr,
              'CPC', c.cpc,
              'CVR', c.cvr,
              'CPA', c.cpa,
              'waste_risk', c.waste_risk,
              'waste_risk_score', c.waste_risk_score,
              'waste_evidence', c.waste_evidence,
              'evidence_strength', c.evidence_strength,
              'anomaly_label', c.anomaly_label,
              'anomaly_score', c.anomaly_score,
              'anomaly_reason', c.anomaly_reason,
              'conversion_probability', c.conversion_probability,
              'predicted_conversion', c.predicted_conversion,
              'conversion_potential', c.conversion_potential
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'::json
        ) AS campaign_records
      FROM analyses a
      LEFT JOIN campaign_records c ON c.analysis_id = a.id
      WHERE a.user_id = $1
      GROUP BY a.id
      ORDER BY a.created_at DESC`,
      [userId]
    );

    const analyses = rows.map((row: any) => {
      const campaigns = row.campaign_records || [];

      const mapCampaign = (c: any) => ({
        ad_id: c.ad_id,
        xyz_campaign_id: c.xyz_campaign_id,
        fb_campaign_id: c.fb_campaign_id,
        age: c.age,
        gender: c.gender,
        interest: c.interest,
        Impressions: Number(c.Impressions || 0),
        Clicks: Number(c.Clicks || 0),
        Spent: Number(c.Spent || 0),
        Approved_Conversion: Number(c.Approved_Conversion || 0),
        CTR: Number(c.CTR || 0),
        CPC: Number(c.CPC || 0),
        CVR: Number(c.CVR || 0),
        CPA: Number(c.CPA || 0),
        waste_risk: c.waste_risk,
        waste_risk_score: c.waste_risk_score,
        waste_evidence: c.waste_evidence,
        evidence_strength: c.evidence_strength,
        anomaly_label: c.anomaly_label,
        anomaly_score:
          c.anomaly_score !== null && c.anomaly_score !== undefined
            ? Number(c.anomaly_score)
            : null,
        anomaly_reason: c.anomaly_reason,
        conversion_probability:
          c.conversion_probability !== null &&
          c.conversion_probability !== undefined
            ? Number(c.conversion_probability)
            : null,
        predicted_conversion: c.predicted_conversion,
        conversion_potential: c.conversion_potential,
      });

      return {
        id: row.id,
        filename: row.filename,
        created_at: row.created_at,
        user_id: userId,
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
        top_waste_risk: campaigns
          .map(mapCampaign)
          .slice(0, 20),
        top_anomalies: campaigns
          .filter((c: any) => c.anomaly_label === "Anomaly")
          .map(mapCampaign)
          .slice(0, 20),
        records_returned: {
          top_waste_risk: 20,
          top_anomalies: 20,
        },
      };
    });

    return Response.json({ analyses });
  } catch (error) {
    console.error("Failed to fetch analyses:", error);

    return Response.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const analysis = await request.json();

    await ensureProfile(userId);

    const analysisId =
      analysis.id ||
      (typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `analysis_${Date.now()}`);

    const createdAt =
      analysis.created_at || new Date().toISOString();

    await sql.query(
      `INSERT INTO analyses (
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
        created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11::jsonb, $12, $13::jsonb, $14::jsonb, $15
      )`,
      [
        analysisId,
        userId,
        analysis.filename,
        analysis.summary.total_campaigns,
        analysis.summary.total_spend,
        analysis.summary.total_impressions,
        analysis.summary.total_clicks,
        analysis.summary.total_conversions,
        analysis.summary.average_cpc,
        analysis.summary.average_cpa,
        JSON.stringify(analysis.summary.risk_distribution || {}),
        analysis.summary.anomalies_detected || 0,
        JSON.stringify(analysis.models || {}),
        JSON.stringify(analysis.conversion_summary || {}),
        createdAt,
      ]
    );

    const campaigns = [
      ...(analysis.top_waste_risk || []),
    ];

    for (const c of campaigns) {
      await sql.query(
        `INSERT INTO campaign_records (
          analysis_id,
          ad_id,
          xyz_campaign_id,
          fb_campaign_id,
          age,
          gender,
          interest,
          impressions,
          clicks,
          spent,
          approved_conversion,
          ctr,
          cpc,
          cvr,
          cpa,
          waste_risk,
          waste_risk_score,
          waste_evidence,
          evidence_strength,
          anomaly_label,
          anomaly_score,
          anomaly_reason,
          conversion_probability,
          predicted_conversion,
          conversion_potential
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25
        )`,
        [
          analysisId,
          c.ad_id,
          c.xyz_campaign_id,
          c.fb_campaign_id,
          c.age,
          c.gender,
          c.interest,
          c.Impressions,
          c.Clicks,
          c.Spent,
          c.Approved_Conversion,
          c.CTR,
          c.CPC,
          c.CVR,
          c.CPA,
          c.waste_risk,
          c.waste_risk_score,
          c.waste_evidence,
          c.evidence_strength,
          c.anomaly_label,
          c.anomaly_score,
          c.anomaly_reason,
          c.conversion_probability,
          c.predicted_conversion,
          c.conversion_potential,
        ]
      );
    }

    return Response.json({
      success: true,
      analysis: {
        ...analysis,
        id: analysisId,
        created_at: createdAt,
        user_id: userId,
      },
    });
  } catch (error) {
    console.error("Failed to save analysis:", error);

    return Response.json(
      { error: "Failed to save analysis" },
      { status: 500 }
    );
  }
}