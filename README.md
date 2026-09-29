# CampaignPulse: AI-Powered Campaign Intelligence & Marketing Waste Detector

An enterprise-grade AI intelligence platform designed to eliminate advertising budget leakage, evaluate multi-signal campaign waste risk, detect statistical anomalies using machine learning, and forecast conversion propensity with a grounded RAG Marketing Intelligence Assistant.

---

## Key Highlights

- **Preserved FastAPI Backend**: The existing backend endpoints (`POST /api/v1/analyze`, `GET /api/v1/summary`, `GET /api/v1/campaigns`, `GET /api/v1/anomalies`, `POST /api/v1/predict-conversion`) remain 100% intact, fast, and operational.
- **RAG Marketing Intelligence Assistant**: Powered by a 12-domain performance marketing knowledge base (CTR, CPC, CPA, CVR, conversion optimization, ad fatigue, audience targeting, campaign waste, anomalies, budget allocation, conversion improvement, performance interpretation) that combines verified benchmarks with the user's actual uploaded campaign data.
- **Strict Fact Separation**: Actual campaign measurements are cleanly segregated from best-practice marketing recommendations with zero hallucinated benchmarks.
- **Full Database & Auth Architecture**: PostgreSQL database schema (`schema.sql`) with Row Level Security (RLS) and Supabase Auth (email/password, session caching, and 1-click demo login).
- **Modern Next.js 14 Frontend**: App Router, TypeScript, Tailwind CSS, Recharts, and custom design system (Deep Navy `#0F172A`, Electric Cyan `#06B6D4`, Emerald, Amber, and Red accents).

---

## Application Routes

| Route | Description |
|---|---|
| `/` | Landing page highlighting platform architecture and ML capabilities |
| `/login` | Supabase email/password authentication + 1-click instant demo login |
| `/signup` | User registration with input validation |
| `/dashboard` | Main analytics dashboard with 7 KPI cards, charts, and priority queues |
| `/analyze` | CSV upload flow with live processing states & sample dataset loader |
| `/campaigns` | Campaign-level analysis with filters (risk, anomaly, potential) & search |
| `/history` | Previous analyses audit trail with dataset switching and deletion |
| `/assistant` | RAG Campaign Intelligence Assistant with citations & suggested prompts |
| `/settings` | User profile, database migration notices, and API configuration |
| `/about` | Project information, ML model descriptions, and methodologies |

---

## Core ML & Analytical Engines

### 1. Multi-Signal Waste Risk Engine
- Dynamically calculates dataset percentiles (25th, 75th, 90th) across CTR, CPC, and CPA.
- Flags compounding negative signals: low CTR + elevated CPC + 10+ clicks with zero conversions + spend without clicks.
- Classifies ads into **Low Risk**, **Medium Risk**, and **High Risk** with human-readable evidence explanations.

### 2. Machine Learning Anomaly Detection
- Utilizes Scikit-learn's **Isolation Forest** model to detect multi-dimensional feature outliers without human bias.
- Anomalies are clearly explained as *unusual patterns in the data* rather than inherently bad—surfacing both runaway leakage and breakout winners.

### 3. Conversion Potential Forecasting
- Employs supervised ML pipelines trained on demographic (age, gender, interest) and interaction features.
- Quantifies probability and assigns **High Potential** (≥70%), **Medium Potential** (40-69%), or **Low Potential** (<40%), kept strictly separate from waste risk.

### 4. RAG Marketing Intelligence Assistant
- 12 comprehensive knowledge domains covering CTR, CPC, CPA, CVR, ad fatigue, audience segmentation, budget reallocation, and CRO.
- Evaluates the user's specific dataset context to answer diagnostic questions like:
  - *"Why are some campaigns high risk?"*
  - *"What could explain my high CPA?"*
  - *"Which campaigns should I investigate first?"*
  - *"What does this anomaly mean?"*
  - *"How can I improve conversion performance?"*
  - *"What does CTR mean?"*

---

## Setup & Running Locally

### 1. FastAPI Backend (Port 8000)

```powershell
cd backend
venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend health at: `http://127.0.0.1:8000/api/v1/health`

### 2. Next.js Frontend (Port 3000)

```powershell
cd frontend
npm install
npm run build
npm start
```

For development mode:
```powershell
npm run dev
```

Visit the application at: `http://localhost:3000`

### 3. Database & Supabase Configuration

1. Copy `frontend/.env.example` to `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
2. Execute `schema.sql` inside your Supabase project SQL Editor to instantiate all tables, indices, and Row Level Security policies.
3. *Note:* If Supabase keys are omitted, the application runs seamlessly in **Local Preview Mode** with client-side user data isolation and 1-click demo login out of the box!
