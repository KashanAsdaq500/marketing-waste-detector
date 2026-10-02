import { AnalysisResult, RAGKnowledgeSource } from "@/types";

export interface KnowledgeItem {
  id: string;
  topic: string;
  keywords: string[];
  benchmark: string;
  definition: string;
  diagnosticQuestions: string[];
  recommendedActions: string[];
  evidenceInterpretation: string;
  sourceName?: string;
  sourceUrl?: string;
}

export const MARKETING_KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: "ctr",
    topic: "Click-Through Rate (CTR)",
    keywords: ["ctr", "click through", "impressions", "clicks", "creative", "hook", "relevance"],
    benchmark: "There is no single universal CTR benchmark; CTR is clicks divided by impressions, and a good CTR depends on what is being advertised and where the ad appears.",
    definition: "CTR = (Clicks / Impressions) * 100. Measures creative appeal and how well the ad hook resonates with the target audience.",
    diagnosticQuestions: [
      "Are audiences seeing the ad without clicking? (Low CTR with high impressions)",
      "Is the ad image/copy failing to stand out in the feed?",
      "Is the targeting too broad, displaying to irrelevant demographics?"
    ],
    recommendedActions: [
      "Refresh ad creatives (new thumbnail, headline, opening 3 seconds of video).",
      "Narrow down interest targeting to more affinity-aligned audience segments.",
      "A/B test different call-to-actions (e.g., 'Learn More' vs 'Shop Now')."
    ],
    evidenceInterpretation: "When an ad exhibits low CTR alongside substantial impressions, spend is burning on audience discovery without generating intent.",
    sourceName: "Google Ads Help — Clickthrough rate (CTR): Definition",
    sourceUrl: "https://support.google.com/google-ads/answer/2615875?hl=en"
  },
  {
    id: "cpc",
    topic: "Cost Per Click (CPC)",
    keywords: ["cpc", "cost per click", "expensive clicks", "bid", "auction", "competition"],
    benchmark: "Typical social advertising CPC ranges between $0.40 and $1.80 depending on industry vertical and audience competitiveness.",
    definition: "CPC = Total Spend / Clicks. Reflects the price paid for each prospective visitor entering your marketing funnel.",
    diagnosticQuestions: [
      "Is the campaign bidding in an overheated auction segment?",
      "Does the ad have low quality/relevance score resulting in auction bid penalties?",
      "Is frequency too high, driving up repeat impression costs?"
    ],
    recommendedActions: [
      "Test lookalike or alternative interest segments with lower bid competition.",
      "Improve ad relevance score to lower platform auction penalties.",
      "Implement automated bid caps or cost controls to avoid overpaying during peak auction spikes."
    ],
    evidenceInterpretation: "High CPC drives down downstream ROI even if conversion rates are healthy, making unit economics unsustainable."
  },
  {
    id: "cpa",
    topic: "Cost Per Acquisition / Cost Per Action (CPA)",
    keywords: ["cpa", "cost per acquisition", "cost per conversion", "approved conversion", "expensive conversions"],
    benchmark: "Target CPA depends on customer lifetime value (LTV) and gross margins. In this campaign dataset, CPA over $35.00 represents the 75th percentile and over $60.00 is in the top 10% critical range.",
    definition: "CPA = Total Spend / Approved Conversions. The definitive metric of marketing unit profitability.",
    diagnosticQuestions: [
      "Is high CPA caused by top-of-funnel friction (high CPC) or bottom-of-funnel dropoff (low CVR)?",
      "Are visitors clicking through but abandoning at checkout/lead submission?",
      "Is there a mismatch between ad messaging and landing page offer?"
    ],
    recommendedActions: [
      "Deconstruct CPA into CPC / CVR: if CPC is reasonable but CPA is extreme, prioritize landing page optimization.",
      "Pause or throttle campaigns where CPA exceeds allowable gross margin threshold.",
      "Refocus budget toward demographic cohorts (e.g. specific age/gender tiers) displaying sub-$25 CPA."
    ],
    evidenceInterpretation: "Very high CPA signals capital leakage where ad spend fails to translate into valuable business transactions."
  },
  {
    id: "cvr",
    topic: "Conversion Rate (CVR)",
    keywords: ["cvr", "conversion rate", "approved conversion", "total conversion", "landing page", "dropoff"],
    benchmark: "Average landing page conversion rate sits between 2.0% and 5.0%. Below 1.0% warrants immediate funnel audit.",
    definition: "CVR = (Approved Conversions / Clicks) * 100. Measures the post-click effectiveness of the landing page or offer.",
    diagnosticQuestions: [
      "Does the page load fast (<2.5s) on mobile devices?",
      "Is there price shock or hidden friction in the conversion flow?",
      "Are checkout forms overly cumbersome?"
    ],
    recommendedActions: [
      "Audit mobile checkout friction and streamline input fields.",
      "Reinforce trust signals (guarantees, reviews, secure badges) above the fold.",
      "Ensure message match between the ad hook and the landing page headline."
    ],
    evidenceInterpretation: "Low CVR indicates traffic is being captured, but the value proposition or user experience fails to close the customer."
  },
  {
    id: "campaign_waste",
    topic: "Campaign Waste Identification & Mitigation",
    keywords: ["waste", "high risk", "waste risk", "bleeding spend", "zero conversion", "clicks without conversion", "spend without clicks"],
    benchmark: "Healthy ad accounts maintain under 15% spend in high-risk categories. Over 30% indicates severe budget misallocation.",
    definition: "Campaign waste occurs when capital is deployed against ad configurations that consistently generate zero conversions or exceed 90th percentile CPA.",
    diagnosticQuestions: [
      "Are there ads with 10+ clicks and 0 conversions? (Clear zero-conversion leakage)",
      "Are there ads logging spend without recorded clicks? (Technical tracking failure or high CPM ghost impressions)",
      "Is budget being spread too thin across hundreds of micro-ads?"
    ],
    recommendedActions: [
      "Immediately pause the top high-risk ads identified by the waste detection engine.",
      "Establish strict automated rules: pause any ad hitting $30 spend with 0 approved conversions.",
      "Reallocate freed budget to campaigns showing Strong evidence and High Conversion Potential."
    ],
    evidenceInterpretation: "High Risk classification by the engine is triggered by compounding signals: low CTR + elevated CPC + zero conversions after significant spend."
  },
  {
    id: "anomalies",
    topic: "Machine Learning Anomaly Detection (Isolation Forest)",
    keywords: ["anomaly", "anomalies", "outlier", "isolation forest", "unusual", "deviant", "anomaly score"],
    benchmark: "In statistical ad modeling, anomalies represent multidimensional outliers (typically top 2-5% unusual metric combinations).",
    definition: "An anomaly is an unusual performance signature detected by Isolation Forest. Crucially, anomalies are NOT always bad; they can be unusually inefficient OR unexpectedly high performers.",
    diagnosticQuestions: [
      "Is this an anomaly of inefficiency (extreme spend with poor returns)?",
      "Is this an anomaly of outperformance (unusually low CPA or spike in conversions)?",
      "Is this caused by a tracking discrepancy or seasonal event?"
    ],
    recommendedActions: [
      "Inspect the specific anomaly score and reason (e.g. 'unusually high spend' or 'clicks without approved conversions').",
      "If the anomaly has high conversion potential and low CPA, scale it cautiously as a potential breakout winner.",
      "If the anomaly has high waste risk and negative efficiency, isolate and pause immediately."
    ],
    evidenceInterpretation: "The model flags multidimensional feature outliers that deviate from the cohort distribution across spend, impressions, clicks, and conversions."
  },
  {
    id: "conversion_optimization",
    topic: "Conversion Optimization & Predictive Modeling",
    keywords: ["conversion optimization", "prediction", "predictive", "conversion potential", "gbm", "logistic regression", "high potential"],
    benchmark: "Supervised conversion models score the probability of an ad generating profitable conversions based on historical demographic and engagement patterns.",
    definition: "Conversion potential categorizes ads into High (>=70% probability), Medium (40-69%), and Low (<40%) based on multivariate predictive scoring.",
    diagnosticQuestions: [
      "Which audience demographics (age/gender/interest) show high conversion propensity?",
      "Are high-potential campaigns receiving adequate budget allocation?",
      "Are low-potential campaigns cannibalizing available ad spend?"
    ],
    recommendedActions: [
      "Consolidate spend toward campaigns tagged as 'High Potential' and 'Low Risk'.",
      "For 'Medium Potential' ads, test refined ad copy before scaling budget.",
      "Prune 'Low Potential' ads that also exhibit high waste risk scores."
    ],
    evidenceInterpretation: "Conversion potential is distinct from waste risk: an ad might have high potential but require bid adjustment, or be inherently low potential."
  },
  {
    id: "ad_fatigue",
    topic: "Ad Creative Fatigue & Audience Saturation",
    keywords: ["ad fatigue", "fatigue", "frequency", "decay", "saturation", "declining ctr"],
    benchmark: "When ad frequency rises above 3.5 - 4.0 in a 7-day window, CTR typically decays by 25-40% while CPC rises.",
    definition: "Ad fatigue occurs when the target audience has seen the exact same creative repeatedly, leading to blindness and lower engagement.",
    diagnosticQuestions: [
      "Has CTR steadily declined over recent spend windows?",
      "Has frequency climbed while new unique reach flattened?",
      "Is CPC trending upwards on previously stable campaigns?"
    ],
    recommendedActions: [
      "Rotate in 2 to 3 fresh creative angles (UGC, static infographics, comparison charts).",
      "Expand audience size or introduce fresh lookalike tiers.",
      "Set frequency capping rules on retargeting campaigns."
    ],
    evidenceInterpretation: "Fatigued ads show degrading CTR and inflating CPA despite having historically strong conversion counts."
  },
  {
    id: "audience_targeting",
    topic: "Audience Segmentation & Demographic Optimization",
    keywords: ["audience", "targeting", "demographics", "age", "gender", "interest", "xyz_campaign", "cohort"],
    benchmark: "Audience efficiency varies drastically by demographic. Analyzing age and gender splits reveals conversion sweet spots.",
    definition: "Audience targeting aligns campaign creatives with specific age brackets, genders, and interest clusters to maximize relevance.",
    diagnosticQuestions: [
      "Which age group delivers the lowest CPA in your dataset? (e.g. 30-34 vs 45-49)",
      "Is budget leaking into demographic cohorts that click frequently but never convert?",
      "Do interest clusters correlate with conversion volume?"
    ],
    recommendedActions: [
      "Segment campaigns by top-performing age brackets rather than broad all-ages targeting.",
      "Exclude demographic tiers demonstrating statistical non-conversion in historical analysis.",
      "Tailor visual styling and messaging specifically to the highest converting age cohort."
    ],
    evidenceInterpretation: "Data shows older cohorts (40-49) may have higher CPC but different conversion volume, while 30-34 may offer cheaper clicks with variable conversion rates."
  },
  {
id: "budget_allocation",

topic: "Strategic Budget Allocation & 70-20-10 Framework",

keywords: [
  "budget",
  "budget allocation",
  "70-20-10",
  "70/20/10",
  "70 20 10",
  "framework",
  "marketing budget",
  "marketing budgets",
  "marketing budget allocation",
  "budget framework",
  "budget planning",
  "70 20 10 framework",
  "70-20-10 framework",
  "source",
],

  benchmark:
    "Industry 70/20/10 framework: approximately 70% for proven activity, 20% for promising opportunities, and 10% for experiments. This is a planning framework, not a universal performance benchmark.",

  definition:
    "Budget allocation is the systematic distribution of marketing capital toward highest-expected-return segments while capping exposure to unproven assets.",

  diagnosticQuestions: [
    "What percentage of current spend is allocated to High Risk campaigns?",
    "Are top-converting campaigns constrained by insufficient budget limits?",
    "Could reallocating 20% of wasted spend yield incremental profitable conversions?"
  ],

    recommendedActions: [
      "Enforce minimum budget thresholds only for validated High Potential campaigns.",
      "Cut spend on bottom quartile ads and immediately funnel into the top 5 CPA performers.",
      "Make budget and bid changes deliberately and allow the advertising platform time to recalibrate before judging the result."
    ],
    evidenceInterpretation: "This project uses budget allocation as a decision framework; actual reallocation should be based on campaign-level evidence rather than a fixed percentage.",
    sourceName: "eTroPo — The 70/20/10 Rule for Marketing Budgets",
    sourceUrl: "https://www.etropo.com/marketing-budget-planning-guide/70-20-10-rule"
  },
  {
    id: "conversion_improvement",
    topic: "Conversion Funnel Improvement & CRO",
    keywords: ["conversion improvement", "improve conversion", "cro", "funnel", "bounce", "checkout"],
    benchmark: "A 20% relative improvement in conversion rate yields a 16.7% reduction in CPA without changing ad spend or bids.",
    definition: "Conversion Rate Optimization (CRO) improves the percentage of visitors who complete the desired goal after clicking an advertisement.",
    diagnosticQuestions: [
      "Is page speed dragging down mobile conversion rates?",
      "Are form fields creating unnecessary friction on mobile screens?",
      "Is the offer compelling compared to competitive market alternatives?"
    ],
    recommendedActions: [
      "Install 1-click checkout options (Apple Pay, Google Pay) to reduce mobile form dropoff.",
      "Add explicit guarantees and risk-reversals near conversion buttons.",
      "Conduct A/B testing on pricing presentation and promotional discounting."
    ],
    evidenceInterpretation: "Boosting conversion rate directly offsets rising ad auction costs across all advertising channels."
  },
  {
    id: "campaignpulse_methodology",
    topic: "CampaignPulse Project Methodology",
    keywords: [
      "campaignpulse",
      "campaign pulse",
      "project methodology",
      "campaign methodology",
      "project architecture",
      "how the project works",
      "methodology",
      "marketing intelligence project"
    ],
    benchmark:
      "CampaignPulse is a project-specific marketing intelligence system that combines campaign analytics, machine learning, and retrieval-augmented knowledge to identify marketing waste and support campaign decisions.",
    definition:
      "CampaignPulse analyzes campaign data from conversion.csv through a Next.js frontend and FastAPI backend. It calculates core marketing metrics, applies machine learning models for waste risk, anomaly detection, and conversion potential, and uses a RAG knowledge base to provide grounded marketing explanations and recommendations.",
    diagnosticQuestions: [
      "How does CampaignPulse analyze campaign performance?",
      "Which machine learning models are used in CampaignPulse?",
      "How does the RAG layer support the marketing assistant?",
      "How are campaign waste risk, anomalies, and conversion potential identified?"
    ],
    recommendedActions: [
      "Upload or analyze campaign data and review the calculated KPIs such as spend, CPC, CPA, clicks, impressions, and conversions.",
      "Use the waste-risk model to identify campaigns with inefficient spending.",
      "Review anomaly detection results for unusual campaign behavior.",
      "Use conversion prediction results to identify campaigns with stronger conversion potential.",
      "Use the RAG-powered assistant to interpret marketing metrics and provide grounded recommendations."
    ],
    evidenceInterpretation:
      "CampaignPulse combines deterministic campaign metrics, machine learning predictions, anomaly detection, and RAG-based marketing knowledge. The system is designed to support evidence-based campaign analysis rather than relying on a single metric.",
  },  {
    id: "performance_interpretation",
    topic: "Holistic Campaign Performance Interpretation",
    keywords: ["performance interpretation", "analysis", "metrics", "dashboard", "kpi", "interpretation", "evaluate"],
    benchmark: "Evaluate marketing performance holistically across the entire funnel: Reach -> Engagement (CTR) -> Acquisition (CPC) -> Outcome (CPA, CVR).",
    definition: "Rigorous performance analysis synthesizes top-line KPIs with campaign-level distributions, isolating structural trends from random volatility.",
    diagnosticQuestions: [
      "Is total spend generating profitable volume at the macro level?",
      "Are aggregate metrics being skewed by a few extreme outlier campaigns?",
      "Is evidence strength sufficient before taking decisive campaign termination actions?"
    ],
    recommendedActions: [
      "Cross-examine aggregate KPIs against the risk distribution and anomaly list.",
      "Check evidence strength: ensure campaigns have at least 30-50 clicks before judging conversion viability.",
      "Maintain a changelog of campaign adjustments to monitor impact over 7-14 day attribution windows."
    ],
    evidenceInterpretation: "High spend alone is not bad if accompanied by strong conversions and controlled CPA; always evaluate spend in context of generated return."
  }
];

// ------------------------------------------------------------
// RAG RETRIEVAL & SYNTHESIS
// ------------------------------------------------------------

export function retrieveRelevantKnowledge(query: string, limit = 3): KnowledgeItem[] {
  const cleanQuery = query.toLowerCase().trim();

  const queryTokens = cleanQuery
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9-]/g, ""))
    .filter((token) => token.length > 1);

  // Short marketing metrics need exact matching.
  // This prevents CPA, CTR, CPC, etc. from being confused with
  // other topics because of generic word overlap.
  const metricAliases: Record<string, string[]> = {
    cpa: ["cpa", "cost per acquisition", "cost per action"],
    cpc: ["cpc", "cost per click"],
    ctr: ["ctr", "click-through rate", "click through rate"],
    roas: ["roas", "return on ad spend"],
    roi: ["roi", "return on investment"],
    conversion: ["conversion", "conversions", "conversion rate"],
    impressions: ["impression", "impressions"],
    clicks: ["click", "clicks"],
    spend: ["spend", "ad spend", "advertising spend"],
    waste: ["waste", "wasted spend", "waste risk"],
  };

  const detectedMetrics = Object.entries(metricAliases)
    .filter(([, aliases]) =>
      aliases.some((alias) => cleanQuery.includes(alias))
    )
    .map(([metric]) => metric);

  // CampaignPulse methodology questions should only retrieve
  // project-specific methodology content.
  const asksForCampaignPulse =
    cleanQuery.includes("campaignpulse") ||
    cleanQuery.includes("campaign pulse") ||
    cleanQuery.includes("project methodology") ||
    cleanQuery.includes("campaign methodology");

  // General campaign-performance questions should retrieve
  // holistic performance interpretation instead of a single metric.
  const asksForPerformanceInterpretation =
    cleanQuery.includes("campaign performance") ||
    cleanQuery.includes("overall performance") ||
    cleanQuery.includes("performance interpretation") ||
    cleanQuery.includes("interpret my performance") ||
    cleanQuery.includes("interpret campaign") ||
    cleanQuery.includes("evaluate campaign performance");


  const scored = MARKETING_KNOWLEDGE_BASE.map((item) => {
    let score = 0;
    let directMatch = false;

    // Do not mix external industry sources into an explicit
    // CampaignPulse methodology question.
    if (asksForCampaignPulse && item.sourceName) {
      return { item, score: -1 };
    }

    // General campaign-performance questions should prioritize
    // the holistic performance interpretation knowledge item.
    if (
      asksForPerformanceInterpretation &&
      item.id === "performance_interpretation"
    ) {
      return { item, score: 100 };
    }

    if (
      asksForPerformanceInterpretation &&
      item.id !== "performance_interpretation"
    ) {
      return { item, score: -1 };
    }

    const topic = item.topic.toLowerCase();

    // Exact topic match.
    if (cleanQuery.includes(topic)) {
      score += 20;
      directMatch = true;
    }

    const itemKeywords = item.keywords.map((kw) => kw.toLowerCase().trim());

    // Exact keyword / phrase match.
    for (const keyword of itemKeywords) {
      if (keyword.length > 2 && cleanQuery.includes(keyword)) {
        score += 10;
        directMatch = true;
      }
    }

    // Strong metric-specific matching.
    for (const metric of detectedMetrics) {
      const aliases = metricAliases[metric];

      const itemContainsMetric = aliases.some(
        (alias) =>
          topic.includes(alias) ||
          itemKeywords.some((keyword) => keyword.includes(alias))
      );

      if (itemContainsMetric) {
        score += 50;
        directMatch = true;
      } else {
        // If the user explicitly asks about one metric,
        // unrelated metric knowledge should be heavily penalized.
        score -= 20;
      }
    }

    // Only perform broader token matching after a direct match.
    if (directMatch) {
      for (const keyword of itemKeywords) {
        for (const token of queryTokens) {
          if (token.length > 3 && keyword.includes(token)) {
            score += 1;
          }
        }
      }

      const definition = item.definition.toLowerCase();
      const benchmark = item.benchmark.toLowerCase();

      for (const token of queryTokens) {
        if (token.length > 3 && definition.includes(token)) {
          score += 1;
        }

        if (token.length > 3 && benchmark.includes(token)) {
          score += 1;
        }
      }
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Only return genuinely relevant sources.
  const results = scored
    .filter((entry) => entry.score >= 5)
    .slice(0, limit)
    .map((entry) => entry.item);

  return results;
}
export function generateAssistantResponse(
  userQuery: string,
  analysisData?: AnalysisResult | null
): {
  content: string;
  ragSources: RAGKnowledgeSource[];
  campaignMetricsReferenced?: {
    totalSpend?: number;
    avgCPC?: number;
    avgCPA?: number;
    highRiskCount?: number;
    anomalyCount?: number;
  };
} {
  const retrievedItems = retrieveRelevantKnowledge(userQuery, 3);
  const ragSources: RAGKnowledgeSource[] = retrievedItems.map((item) => ({
    title: item.topic,
    category: item.sourceName ? "External / Industry Source" : "CampaignPulse Project Methodology",
    keyRule: item.definition,
    benchmark: item.benchmark,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
  }));

  const hasAnalysis = Boolean(analysisData && analysisData.summary);
  const summary = analysisData?.summary;
  const topWaste = analysisData?.top_waste_risk || [];
  const topAnomalies = analysisData?.top_anomalies || [];
  const conversionSummary = analysisData?.conversion_summary;

  const campaignMetricsReferenced = summary
    ? {
        totalSpend: summary.total_spend,
        avgCPC: summary.average_cpc,
        avgCPA: summary.average_cpa,
        highRiskCount: summary.risk_distribution["High Risk"] || 0,
        anomalyCount: summary.anomalies_detected,
      }
    : undefined;

  const queryLower = userQuery.toLowerCase();

  // ------------------------------------------------------------
  // INTENT-SPECIFIC GROUNDED RESPONSES
  // ------------------------------------------------------------

  let responseBody = "";

  // 1. "Why are some campaigns high risk?"
  if (queryLower.includes("why") && (queryLower.includes("high risk") || queryLower.includes("waste"))) {
    responseBody = `### Diagnostic Analysis: High Waste Risk Causes

High risk classification in the detector is triggered by a combination of statistical performance flags rather than an arbitrary threshold:

1. **Spend Without Conversions:** Campaigns accumulating significant spend (and 10+ clicks) with **0 approved conversions**.
2. **Elevated Acquisition Costs (CPA):** Campaigns where CPA exceeds the dataset 75th percentile ($${summary ? (summary.average_cpa * 1.5).toFixed(2) : "35.00"}+) or 90th percentile.
3. **Auction Inefficiency (Elevated CPC):** Campaigns paying above the 75th percentile CPC with substandard click-to-lead throughput.
4. **Weak Hook / Resonance (Low CTR):** High impressions but bottom-quartile click-through rates.

${
  hasAnalysis
    ? `#### Your Actual Campaign Measurements:
* **High Risk Campaigns Detected:** ${summary?.risk_distribution["High Risk"] ?? 0} out of ${summary?.total_campaigns} campaigns.
* **Medium Risk Campaigns:** ${summary?.risk_distribution["Medium Risk"] ?? 0}.
* **Top Waste Culprit:** Ad ID \`${topWaste[0]?.ad_id ?? "N/A"}\` with spend of **$${topWaste[0]?.Spent?.toFixed(2) ?? "0.00"}** and CPA of **$${topWaste[0]?.CPA?.toFixed(2) ?? "0.00"}** (Reason: *${topWaste[0]?.waste_evidence ?? "Compounding cost signals"}*).`
    : `*(Upload or select a campaign dataset in the Analyze tab to inspect your specific high-risk records.)*`
}

#### Recommended Action Plan:
- **Immediate Pause:** Terminate or pause the top high-risk ads displaying strong evidence (>50 clicks with zero conversions).
- **Audit Offer Match:** For medium-risk ads with high CPC, check if landing page messaging matches the ad creative.
- **Budget Reallocation:** Divert capital to validated low-risk campaigns showing High Conversion Potential.`;
  }

  // 2. "What could explain my high CPA?"
  else if (queryLower.includes("cpa") && (queryLower.includes("high") || queryLower.includes("explain") || queryLower.includes("why"))) {
    responseBody = `### Deconstruction: Why CPA is High

Cost Per Acquisition (CPA) is calculated mathematically as:
$$\\text{CPA} = \\frac{\\text{Total Spend}}{\\text{Approved Conversions}} = \\frac{\\text{CPC}}{\\text{Conversion Rate (CVR)}}$$

An elevated CPA is almost always driven by one of two root causes:

1. **Auction Cost Driver (High CPC):** You are paying too much per visitor into your funnel due to fierce audience competition, high bid floors, or low ad relevance scores.
2. **Funnel Friction Driver (Low CVR):** Visitors are arriving at your destination, but failing to convert due to slow page load, confusing checkout steps, lack of trust signals, or pricing mismatch.

${
  hasAnalysis
    ? `#### Your Actual Campaign Measurements:
* **Account Average CPA:** **$${summary?.average_cpa?.toFixed(2)}** across **${summary?.total_conversions?.toLocaleString()}** approved conversions.
* **Account Average CPC:** **$${summary?.average_cpc?.toFixed(2)}**.
* **High CPA Outliers:** In your dataset, several campaigns reached CPAs exceeding **$${topWaste.length > 0 ? Math.max(...topWaste.map((c) => c.CPA)).toFixed(2) : "100.00"}** primarily due to clicks failing to produce approved sales.`
    : `*(Upload a campaign dataset to see your specific CPA distribution and percentile benchmarks.)*`
}

#### Actionable Recommendations:
- **Isolate the Bottleneck:** If CPC is under $1.50 but CPA is over $50, your issue is 100% landing page conversion rate (CRO), not ad bidding.
- **Prune Demographic Leakage:** Review campaign demographics; certain age brackets or interest tiers often yield 3x higher CPAs.
- **Set CPA Target Caps:** Configure platform bidding to target a maximum allowable CPA aligned with your gross profit margins.`;
  }

  // 3. "Which campaigns should I investigate first?"
  else if (queryLower.includes("which campaign") || queryLower.includes("investigate first") || queryLower.includes("where to start")) {
    responseBody = `### Priority Investigation Triage

To maximize return on advertising spend (ROAS), apply this 3-tier triage order:

1. **Tier 1 (Critical Priority - Stop the Bleeding):** High Risk campaigns with **Strong Evidence Strength** (>50 clicks) and substantial spend that generated 0 or near-0 conversions.
2. **Tier 2 (High Priority - High Anomaly Score):** Records flagged by the Isolation Forest model with severe deviation scores. Look for anomalies labeled "unusually high spend" or "very high CPA".
3. **Tier 3 (Growth Opportunity - High Potential):** Campaigns identified by the predictive model with **High Conversion Potential** (>70% probability) that are currently under-budgeted.

${
  hasAnalysis && topWaste.length > 0
    ? `#### Your Top 3 Campaigns to Investigate Immediately:
1. **Ad ID \`${topWaste[0]?.ad_id}\`:** Spend: **$${topWaste[0]?.Spent?.toFixed(2)}** | Waste Risk: **${topWaste[0]?.waste_risk}** | Evidence: *${topWaste[0]?.waste_evidence}*
2. **Ad ID \`${topWaste[1]?.ad_id}\`:** Spend: **$${topWaste[1]?.Spent?.toFixed(2)}** | Waste Risk: **${topWaste[1]?.waste_risk}** | Evidence: *${topWaste[1]?.waste_evidence}*
3. **Ad ID \`${topWaste[2]?.ad_id}\`:** Spend: **$${topWaste[2]?.Spent?.toFixed(2)}** | Waste Risk: **${topWaste[2]?.waste_risk}** | Evidence: *${topWaste[2]?.waste_evidence}*`
    : `*(No active dataset loaded. Upload your CSV in the Analyze view to populate instant priority investigation queues.)*`
}

#### Recommended Action:
- Open the **Campaigns** tab, filter by **"High Risk"**, and review individual ad metrics before pausing or adjusting bids.`;
  }

  // 4. "What does this anomaly mean?" / Anomaly explanation
  else if (queryLower.includes("anomaly") || queryLower.includes("anomalies")) {
    responseBody = `### Machine Learning Anomaly Interpretation

In this platform, an **Anomaly** is identified using an **Isolation Forest** machine learning model.

> **Important Concept:** An "Anomaly" simply means an **unusual multi-dimensional pattern** in the campaign data. It is **NOT automatically bad**!

#### Types of Anomalies in Advertising Data:
1. **Inefficient Anomalies (Action: Investigate/Pause):** Campaigns with extreme spend, runaway bids, or zero conversions despite massive impression volume.
2. **Breakout Winner Anomalies (Action: Scale):** Campaigns exhibiting unusually low acquisition costs or viral click-through rates that significantly outperform the cohort mean.
3. **Data Quality Anomalies (Action: Fix Tracking):** Technical tracking glitches, such as recorded conversions with 0 clicks or abnormal impression ratios.

${
  hasAnalysis
    ? `#### Your Actual Anomaly Statistics:
* **Total Anomalies Detected:** **${summary?.anomalies_detected}** records.
* **Top Anomaly in Analysis:** Ad ID \`${topAnomalies[0]?.ad_id ?? "N/A"}\` with anomaly score **${topAnomalies[0]?.anomaly_score?.toFixed(4) ?? "N/A"}**.
* **Reason Flagged:** *"${topAnomalies[0]?.anomaly_reason ?? "Unusual metric combination"}"*.`
    : `*(Upload a campaign CSV to view detected anomalies scored by the Isolation Forest model.)*`
}

#### How to Address Anomalies:
- Check the **Anomaly Reason** column in the Anomaly table.
- Verify whether conversion tracking pixels and UTM parameters are firing cleanly.
- If an anomaly is high spend with low return, restrict budget immediately.`;
  }

  // 5. "How can I improve conversion performance?"
  else if (queryLower.includes("improve conversion") || queryLower.includes("conversion performance") || queryLower.includes("conversion optimization")) {
    responseBody = `### Framework: Improving Campaign Conversion Performance

Boosting conversions requires optimizing across three connected layers:

1. **Targeting & Audience Alignment:**
   - Focus budget on high-propensity cohorts. In standard retail datasets, audiences aged 30-34 and 45-49 often show divergent conversion behaviors.
   - Use lookalike modeling and interest narrowing to reach buyers rather than casual browsers.

2. **Creative & Hook Optimization:**
   - Test problem-first video hooks in the first 3 seconds to pre-qualify intent before the user clicks.
   - Align the ad promise directly with the page headline to prevent bounce.

3. **Landing Page & Conversion Rate Optimization (CRO):**
   - Eliminate non-essential checkout fields on mobile devices.
   - Display customer validation, security guarantees, and clear shipping timelines prominently.

${
  hasAnalysis
    ? `#### Your Dataset Conversion Snapshot:
* **Total Conversions Recorded:** **${summary?.total_conversions?.toLocaleString()}**
* **Average CPA:** **$${summary?.average_cpa?.toFixed(2)}**
* **Predictive Conversion Potential:** ${
        conversionSummary?.available
          ? `**${conversionSummary.high_potential}** High Potential, **${conversionSummary.medium_potential}** Medium, and **${conversionSummary.low_potential}** Low Potential records.`
          : "Supervised conversion model active."
      }`
    : `*(Upload your campaign CSV to calculate predictive conversion probabilities across all ads.)*`
}

#### Strategic Recommendation:
- Filter campaigns by **"High Potential"** in the Campaigns tab and ensure these top-performing units are not budget-capped.`;
  }

  // 6. "How should I interpret my campaign performance?"
  else if (
    queryLower.includes("campaign performance") ||
    queryLower.includes("overall performance") ||
    queryLower.includes("interpret my performance") ||
    queryLower.includes("interpret campaign") ||
    queryLower.includes("evaluate campaign performance") ||
    queryLower.includes("performance interpretation")
  ) {
    responseBody = `### Holistic Campaign Performance Interpretation

Campaign performance should be interpreted across the full marketing funnel rather than through a single metric:

**Reach → Engagement (CTR) → Acquisition (CPC) → Outcome (CPA, CVR)**

#### How to Read Your Campaign Performance

1. **Reach — Impressions**
   - Impressions show how much exposure your campaigns are receiving.
   - High impressions with very few clicks can indicate weak engagement or audience/creative mismatch.

2. **Engagement — CTR**
   - CTR shows how often people click after seeing an ad.
   - A low CTR can point to issues with the creative, message, offer, placement, or audience targeting.

3. **Acquisition — CPC**
   - CPC shows how much you are paying for each click.
   - A high CPC can reduce efficiency even when CTR is healthy.

4. **Outcome — CPA and Conversion Rate**
   - CPA connects advertising spend with approved conversions.
   - A campaign can have strong CTR and CPC but still perform poorly if visitors do not convert.
   - Conversion Rate (CVR) helps identify this post-click funnel problem.

${
  hasAnalysis
    ? `#### Your Current Campaign Snapshot:
* **Total Campaigns:** **${summary?.total_campaigns}
* **Total Spend:** **$${summary?.total_spend?.toFixed(2)}
* **Total Impressions:** **${summary?.total_impressions?.toLocaleString()}
* **Total Clicks:** **${summary?.total_clicks?.toLocaleString()}
* **Average CPC:** **$${summary?.average_cpc?.toFixed(2)}
* **Average CPA:** **$${summary?.average_cpa?.toFixed(2)}
* **High Risk Campaigns:** **${summary?.risk_distribution["High Risk"] ?? 0}
* **Detected Anomalies:** **${summary?.anomalies_detected ?? 0}`
    : `*(Upload or analyze a campaign CSV to view your actual campaign performance measurements.)*`
}

#### What to Investigate

- If **impressions are high but CTR is low**, investigate creative quality and audience relevance.
- If **CTR is healthy but CPC is high**, investigate bidding and audience competition.
- If **CPC is reasonable but CPA is high**, investigate the conversion funnel and landing-page experience.
- If a campaign has unusual metrics, review the **anomaly detection** results before making changes.
- Compare **waste risk and conversion potential** together so that high-spend campaigns are not evaluated using only one metric.

#### CampaignPulse Methodology

CampaignPulse combines calculated campaign KPIs, machine-learning waste-risk detection, anomaly detection, conversion-potential prediction, and RAG-based marketing knowledge to provide a broader view of campaign performance.`;
  }

  // 7. "What does CTR mean?" / Metric definitions
  else if (queryLower.includes("ctr") && (queryLower.includes("mean") || queryLower.includes("what is") || queryLower.includes("definition"))) {
    responseBody = `### Definition: Click-Through Rate (CTR)

**CTR (Click-Through Rate)** measures the percentage of impressions that resulted in a user click:

$$\\text{CTR} = \\left( \\frac{\\text{Total Clicks}}{\\text{Total Impressions}} \\right) \\times 100\\%$$

#### Industry Benchmarks:

There is no single universal CTR benchmark. CTR should be interpreted in the context of the advertising platform, campaign objective, placement, audience, and the account's historical performance.
${
  hasAnalysis
    ? `#### Your Account Measurements:
* **Total Impressions:** **${summary?.total_impressions?.toLocaleString()}**
* **Total Clicks:** **${summary?.total_clicks?.toLocaleString()}**
* **Overall Account CTR:** **${summary?.total_impressions ? ((summary.total_clicks / summary.total_impressions) * 100).toFixed(3) : "0.000"}%**`
    : ""
}

#### How to Improve Low CTR:
1. **Test High-Contrast Creatives:** Use dynamic visual thumbnails and bold opening text overlays.
2. **Refine Demographic Targeting:** Avoid targeting too broad of an audience where relevance drops off.
3. **Address Creative Fatigue:** When an ad's CTR drops consistently over 14 days, rotate in fresh variations.`;
  }

  // General fallback query using retrieved RAG topics
  else {
    const primaryTopic = retrievedItems[0] || MARKETING_KNOWLEDGE_BASE[0];
    responseBody = `### Marketing Intelligence Response

Regarding **${primaryTopic.topic}**:

${primaryTopic.definition}

* **Reference / Benchmark:** ${primaryTopic.benchmark}
* **Diagnostic Focus:** ${primaryTopic.diagnosticQuestions.join(" ")}

${
  hasAnalysis
    ? `#### Grounded Campaign Performance Context:
* **Analyzed Dataset:** \`${analysisData?.filename ?? "Current Analysis"}\`
* **Total Campaigns:** ${summary?.total_campaigns}
* **Total Spend:** $${summary?.total_spend?.toFixed(2)}
* **Average CPC:** $${summary?.average_cpc?.toFixed(2)} | **Average CPA:** $${summary?.average_cpa?.toFixed(2)}
* **Risk Breakdown:** ${summary?.risk_distribution["Low Risk"] ?? 0} Low Risk, ${summary?.risk_distribution["Medium Risk"] ?? 0} Medium Risk, ${summary?.risk_distribution["High Risk"] ?? 0} High Risk.`
    : `*(Upload a campaign CSV to view tailored evaluations with your actual numbers.)*`
}

#### Key Recommendations for this Area:
${primaryTopic.recommendedActions.map((action) => `- ${action}`).join("\n")}

${primaryTopic.evidenceInterpretation}`;
  }

  return {
    content: responseBody,
    ragSources,
    campaignMetricsReferenced,
  };
}






