-- ============================================================
-- MARKETING WASTE DETECTOR - POSTGRESQL SCHEMA (SUPABASE)
-- ============================================================
-- This schema defines the database structure for users, analyses,
-- campaign records, anomalies, risk assessments, and RAG conversations.
-- It enforces Row Level Security (RLS) so each authenticated user
-- can only read and write their own data.
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    role TEXT DEFAULT 'Marketing Analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ------------------------------------------------------------
-- 2. ANALYSES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses"
    ON public.analyses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
    ON public.analyses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
    ON public.analyses FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. ANALYSIS SUMMARIES (Detailed KPI and aggregate metrics)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analysis_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_analysis_summaries_analysis_id ON public.analysis_summaries(analysis_id);

ALTER TABLE public.analysis_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access summaries of their analyses"
    ON public.analysis_summaries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = analysis_summaries.analysis_id
            AND a.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 4. CAMPAIGN RECORDS (Individual campaign/ad performance items)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_campaigns_analysis_id ON public.campaign_records(analysis_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_waste_risk ON public.campaign_records(waste_risk);
CREATE INDEX IF NOT EXISTS idx_campaigns_anomaly_label ON public.campaign_records(anomaly_label);

ALTER TABLE public.campaign_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access campaigns of their analyses"
    ON public.campaign_records FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = campaign_records.analysis_id
            AND a.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 5. DETECTED ANOMALIES (Specialized table for fast querying)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL,
    anomaly_score NUMERIC(10, 6) NOT NULL,
    anomaly_reason TEXT NOT NULL,
    metrics_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_reviewed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anomalies_analysis_id ON public.anomalies(analysis_id);

ALTER TABLE public.anomalies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access anomalies of their analyses"
    ON public.anomalies FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = anomalies.analysis_id
            AND a.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 6. RISK RESULTS (Waste risk evaluations)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.risk_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    ad_id BIGINT NOT NULL,
    risk_level TEXT NOT NULL, -- 'Low Risk', 'Medium Risk', 'High Risk'
    risk_score INTEGER NOT NULL,
    evidence TEXT NOT NULL,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_results_analysis_id ON public.risk_results(analysis_id);

ALTER TABLE public.risk_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access risk results of their analyses"
    ON public.risk_results FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            WHERE a.id = risk_results.analysis_id
            AND a.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 7. CONVERSATIONS & MESSAGES (RAG Assistant History)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Campaign Intelligence Chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own conversations"
    ON public.conversations FOR ALL
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    rag_sources JSONB DEFAULT '[]'::jsonb,
    campaign_metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.conversation_messages(conversation_id);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access messages of their conversations"
    ON public.conversation_messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_messages.conversation_id
            AND c.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------
-- 8. TRIGGER: Auto-create Profile on Signup
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
