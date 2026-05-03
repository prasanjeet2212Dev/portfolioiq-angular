-- =========================================
-- PORTFOLIOIQ ACTIVE SCHEMA
-- Only tables currently used by the app
-- =========================================
-- 
-- This schema represents the 3 tables actively used
-- by the PortfolioIQ Angular application.
--
-- Run this on a fresh database or use database-cleanup.sql
-- to remove unused tables from existing schema.
--
-- =========================================

-- 1. INSTITUTIONS (Multi-tenancy & Authentication)
CREATE TABLE public.institutions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  city text,
  passcode text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  contact_email text,
  contact_phone text,
  logo_url text,
  website text,
  description text,
  is_active boolean DEFAULT true,
  subscription_tier text DEFAULT 'free'::text 
    CHECK (subscription_tier = ANY (ARRAY['free'::text, 'basic'::text, 'pro'::text, 'enterprise'::text])),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. STARTUPS (Core application data)
CREATE TABLE public.startups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  institution_id bigint REFERENCES public.institutions(id),
  data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text 
    CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text, 'graduated'::text])),
  tags text[],
  last_scored_at timestamp with time zone,
  view_count integer DEFAULT 0
);

-- 3. INSIGHTS (AI-generated analysis)
CREATE TABLE public.insights (
  startup_id bigint PRIMARY KEY,
  institution_id bigint REFERENCES public.institutions(id),
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  insight_type text 
    CHECK (insight_type = ANY (ARRAY['scoring'::text, 'market_intel'::text, 'action_plan'::text, 'valuation'::text, 'schemes'::text])),
  ai_model text,
  confidence_score numeric,
  created_at timestamp with time zone DEFAULT now()
);

-- NOTE: Chat and analytics tables removed
-- Chatbot works in-memory only (database saves fail silently)
-- If you want to add these features, see DATABASE-SYNC-ANALYSIS.md

-- =========================================
-- INDEXES (for performance)
-- =========================================

-- Institutions
CREATE INDEX idx_institutions_slug ON public.institutions(slug);

-- Startups
CREATE INDEX idx_startups_institution_id ON public.startups(institution_id);
CREATE INDEX idx_startups_updated_at ON public.startups(updated_at DESC);
CREATE INDEX idx_startups_status ON public.startups(status);

-- Insights  
CREATE INDEX idx_insights_institution_id ON public.insights(institution_id);
CREATE INDEX idx_insights_updated_at ON public.insights(updated_at DESC);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for public access (unauthenticated users)
-- Note: These tables are open because app uses session-based auth, not Supabase auth

-- Allow public read/write on institutions (for login)
CREATE POLICY "Allow public read access on institutions" ON public.institutions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on institutions" ON public.institutions
  FOR INSERT WITH CHECK (true);

-- Policies for public access (unauthenticated users)
-- Note: These tables are open because app uses session-based auth, not Supabase auth

-- Allow public read/write on institutions (for login/registration)
CREATE POLICY "Allow public read access on institutions" ON public.institutions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on institutions" ON public.institutions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on institutions" ON public.institutions
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on institutions" ON public.institutions
  FOR DELETE USING (true);

-- Allow public access on startups (institution-based filtering done in app)
CREATE POLICY "Allow public access on startups" ON public.startups
  FOR ALL USING (true);

-- Allow public access on insights
CREATE POLICY "Allow public access on insights" ON public.insights
  FOR ALL USING
-- =========================================
-- VERIFICATION
-- =========================================

-- Count tables
-- SELECT COUNT(*) as table_count FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: 6 tables

-- List all tables
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
3 tables

-- List all tables
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- Expected output:
-- insights
-- institutions
-- startups