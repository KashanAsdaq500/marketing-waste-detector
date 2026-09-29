-- ============================================================
-- MARKETING WASTE DETECTOR - NEON + CLERK POSTGRESQL SCHEMA
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES
-- Clerk user ID is stored as TEXT.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'Marketing Analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. ANALYSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    total_campaigns INTEGER NOT NULL DEFAULT 0,
    total_spend NUMERIC(14, 2) NOT NULL DEFAULT 0,
    total_impressions BIGINT NOT NULL DEFAULT 0,
    total_clicks BIGINT NOT NULL DEFAULT 0,
    total_conversions BIGINT NOT NULL DEFAULT 0,
    average_cpc NUMERIC(10, 4) NOT NULL DEFAULT 0,
    average_cpa NUMERIC(10, 4) NOT NULL DEFAULT 0,
    risk_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    anomalies_detected INTEGER NOT NULL DEFAULT 0,
    models_available JSONB NOT NULL DEFAULT '{"waste_risk": true, "anomaly_detection": true, "conversion_prediction": true}'::jsonb,
    conversion_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id
    ON public.analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at
    ON public.analyses(created_at DESC);

-- ------------------------------------------------------------
-- 3. ANALYSIS SUMMARIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analysis_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    low_risk_count INTEGER DEFAULT 0,
    medium_risk_count INTEGER DEFAULT 0,
    high_risk_count INTEGER DEFAULT 0,
    high_potential_count INTEGER DEFAULT 0,
    medium_potential_count INTEGER DEFAULT 0,
    low_potential_count INTEGER DEFAULT 0,
    wasted_spend_estimate NUMERIC(14, 2) DEFAULT 0,
    executive_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analysis_summaries_analysis_id
    ON public.analysis_summaries(analysis_id);

-- ------------------------------------------------------------
-- 4. CAMPAIGN RECORDS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL,
    xyz_campaign_id BIGINT,
    fb_campaign_id BIGINT,
    age TEXT,
    gender TEXT,
    interest INTEGER,
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    spent NUMERIC(12, 4) DEFAULT 0,
    approved_conversion INTEGER DEFAULT 0,
    total_conversion INTEGER DEFAULT 0,
    ctr NUMERIC(10, 4) DEFAULT 0,
    cpc NUMERIC(10, 4) DEFAULT 0,
    cvr NUMERIC(10, 4) DEFAULT 0,
    cpa NUMERIC(10, 4) DEFAULT 0,
    waste_risk TEXT NOT NULL,
    waste_risk_score INTEGER NOT NULL DEFAULT 0,
    waste_evidence TEXT,
    evidence_strength TEXT,
    anomaly_label TEXT,
    anomaly_score NUMERIC(10, 6),
    anomaly_reason TEXT,
    conversion_probability NUMERIC(6, 2),
    predicted_conversion INTEGER,
    conversion_potential TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_analysis_id
    ON public.campaign_records(analysis_id);

CREATE INDEX IF NOT EXISTS idx_campaigns_waste_risk
    ON public.campaign_records(waste_risk);

CREATE INDEX IF NOT EXISTS idx_campaigns_anomaly_label
    ON public.campaign_records(anomaly_label);

-- ------------------------------------------------------------
-- 5. DETECTED ANOMALIES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomalies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL,
    anomaly_score NUMERIC(10, 6) NOT NULL,
    anomaly_reason TEXT NOT NULL,
    metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomalies_analysis_id
    ON public.anomalies(analysis_id);

-- ------------------------------------------------------------
-- 6. RISK RESULTS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL,
    risk_level TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    evidence TEXT NOT NULL,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_results_analysis_id
    ON public.risk_results(analysis_id);

-- ------------------------------------------------------------
-- 7. CONVERSATIONS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Campaign Intelligence Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id
    ON public.conversations(user_id);

-- ------------------------------------------------------------
-- 8. CONVERSATION MESSAGES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    rag_sources JSONB DEFAULT '[]'::jsonb,
    campaign_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id
    ON public.conversation_messages(conversation_id);

-- ------------------------------------------------------------
-- DONE
-- ------------------------------------------------------------