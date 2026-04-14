-- =========================================
-- PORTFOLIO IQ - COMPLETE DATABASE SETUP
-- Supabase SQL Migration Script
-- Version: 1.0
-- Date: April 14, 2026
-- =========================================
-- 
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Open Supabase Dashboard → SQL Editor
-- 3. Paste and click RUN
-- 4. Verify success in Table Editor
--
-- WARNING: This script is safe to run multiple times (uses IF NOT EXISTS)
-- =========================================


-- =========================================
-- SECTION 1: UPDATE EXISTING TABLES
-- =========================================

-- Add new columns to institutions table
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise')),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing created_at if it doesn't exist
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add new columns to startups table
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'graduated')),
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add missing created_at if it doesn't exist  
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add new columns to insights table
ALTER TABLE public.insights
  ADD COLUMN IF NOT EXISTS insight_type TEXT CHECK (insight_type IN ('scoring', 'market_intel', 'action_plan', 'valuation', 'schemes')),
  ADD COLUMN IF NOT EXISTS ai_model TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes on existing tables for better performance
CREATE INDEX IF NOT EXISTS idx_startups_institution ON public.startups(institution_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups(status);
CREATE INDEX IF NOT EXISTS idx_startups_created ON public.startups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_startup ON public.insights(startup_id);
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON public.institutions(slug);


-- =========================================
-- SECTION 2: CREATE NEW TABLES
-- =========================================

-- 1. USERS TABLE - Proper user authentication
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  institution_id BIGINT REFERENCES public.institutions(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution ON public.users(institution_id);

COMMENT ON TABLE public.users IS 'User accounts with role-based access control';


-- 2. CHAT SESSIONS TABLE - Track chatbot conversations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_type TEXT NOT NULL CHECK (session_type IN ('guest', 'user', 'admin')),
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Guest user details
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  
  -- Session metadata
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  
  -- Analytics
  source_page TEXT,
  conversion_status TEXT DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'registered', 'dismissed')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_type ON public.chat_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_guest_email ON public.chat_sessions(guest_email) WHERE guest_email IS NOT NULL;

COMMENT ON TABLE public.chat_sessions IS 'Tracks AI chatbot conversation sessions';


-- 3. CHAT MESSAGES TABLE - Store conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT REFERENCES public.chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- AI metadata
  ai_model TEXT,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  
  -- Message metadata
  is_quick_question BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

COMMENT ON TABLE public.chat_messages IS 'Individual messages in chatbot conversations';


-- 4. LANDING PAGE ANALYTICS - Track visitor behavior
CREATE TABLE IF NOT EXISTS public.landing_analytics (
  id BIGSERIAL PRIMARY KEY,
  
  -- Visitor info
  visitor_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Actions
  action_type TEXT NOT NULL CHECK (action_type IN (
    'page_view', 
    'signup_click', 
    'feature_explore', 
    'search_used', 
    'chatbot_opened',
    'form_submitted',
    'cta_clicked'
  )),
  action_data JSONB,
  
  -- Device/Browser
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  os TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_landing_analytics_action ON public.landing_analytics(action_type);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_timestamp ON public.landing_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_landing_analytics_visitor ON public.landing_analytics(visitor_id);

COMMENT ON TABLE public.landing_analytics IS 'Tracks user interactions on landing page';


-- 5. GOVERNMENT SCHEMES TABLE - Dynamic scheme database
CREATE TABLE IF NOT EXISTS public.govt_schemes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Scheme details
  category TEXT CHECK (category IN ('funding', 'tax_benefit', 'infrastructure', 'mentorship', 'other')),
  funding_amount_min DECIMAL(15,2),
  funding_amount_max DECIMAL(15,2),
  
  -- Eligibility (stored as JSON for flexibility)
  eligibility_criteria JSONB,
  
  -- Links & Resources
  official_website TEXT,
  application_link TEXT,
  documents_required TEXT[],
  
  -- Metadata
  issuing_authority TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  launch_date DATE,
  deadline DATE,
  
  -- AI matching keywords
  keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_govt_schemes_category ON public.govt_schemes(category);
CREATE INDEX IF NOT EXISTS idx_govt_schemes_status ON public.govt_schemes(status);
CREATE INDEX IF NOT EXISTS idx_govt_schemes_keywords ON public.govt_schemes USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_govt_schemes_slug ON public.govt_schemes(slug);

COMMENT ON TABLE public.govt_schemes IS 'Database of government schemes and funding programs';


-- 6. STARTUP SCHEME MATCHES - AI-generated recommendations
CREATE TABLE IF NOT EXISTS public.startup_scheme_matches (
  id BIGSERIAL PRIMARY KEY,
  startup_id BIGINT REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  scheme_id BIGINT REFERENCES public.govt_schemes(id) ON DELETE CASCADE NOT NULL,
  
  -- Match metadata
  match_score DECIMAL(5,2),
  match_reason TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'reviewing', 'applied', 'approved', 'rejected', 'ignored')),
  applied_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(startup_id, scheme_id)
);

CREATE INDEX IF NOT EXISTS idx_startup_scheme_matches_startup ON public.startup_scheme_matches(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_scheme_matches_scheme ON public.startup_scheme_matches(scheme_id);
CREATE INDEX IF NOT EXISTS idx_startup_scheme_matches_status ON public.startup_scheme_matches(status);

COMMENT ON TABLE public.startup_scheme_matches IS 'AI-matched schemes for each startup';


-- 7. PORTFOLIO REPORTS - Track exported reports
CREATE TABLE IF NOT EXISTS public.portfolio_reports (
  id BIGSERIAL PRIMARY KEY,
  institution_id BIGINT REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  generated_by_user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN ('csv', 'detailed_pdf', 'summary_pdf', 'comparison')),
  report_name TEXT,
  
  -- Content
  startup_ids BIGINT[],
  file_url TEXT,
  file_size_bytes BIGINT,
  
  -- Metadata
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  downloaded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_portfolio_reports_institution ON public.portfolio_reports(institution_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_reports_generated ON public.portfolio_reports(generated_at DESC);

COMMENT ON TABLE public.portfolio_reports IS 'History of generated reports';


-- 8. STARTUP SHOWCASE - Public startup profiles
CREATE TABLE IF NOT EXISTS public.startup_showcase (
  id BIGSERIAL PRIMARY KEY,
  startup_id BIGINT REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL UNIQUE,
  institution_id BIGINT REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  
  -- Visibility
  is_public BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  
  -- Public data (sanitized version)
  public_data JSONB NOT NULL,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Sharing settings
  allow_contact BOOLEAN DEFAULT true,
  contact_email TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startup_showcase_slug ON public.startup_showcase(slug);
CREATE INDEX IF NOT EXISTS idx_startup_showcase_public ON public.startup_showcase(is_public);
CREATE INDEX IF NOT EXISTS idx_startup_showcase_institution ON public.startup_showcase(institution_id);

COMMENT ON TABLE public.startup_showcase IS 'Public-facing startup profiles for sharing';


-- 9. FEATURE USAGE TRACKING - Product analytics
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id BIGINT REFERENCES public.institutions(id) ON DELETE CASCADE,
  
  -- Feature details
  feature_name TEXT NOT NULL,
  action TEXT NOT NULL,
  
  -- Context
  context_data JSONB,
  
  -- Performance
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_usage_feature ON public.feature_usage(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user ON public.feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_institution ON public.feature_usage(institution_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_timestamp ON public.feature_usage(timestamp DESC);

COMMENT ON TABLE public.feature_usage IS 'Tracks usage of platform features for analytics';


-- 10. NOTIFICATIONS - User notification system
CREATE TABLE IF NOT EXISTS public.notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

COMMENT ON TABLE public.notifications IS 'User notifications and alerts';


-- =========================================
-- SECTION 3: UTILITY FUNCTIONS
-- =========================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DO $$ 
BEGIN
  -- Only create trigger if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_institutions_updated_at') THEN
    CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON public.institutions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_startups_updated_at') THEN
    CREATE TRIGGER update_startups_updated_at BEFORE UPDATE ON public.startups
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_chat_sessions_updated_at') THEN
    CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON public.chat_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_govt_schemes_updated_at') THEN
    CREATE TRIGGER update_govt_schemes_updated_at BEFORE UPDATE ON public.govt_schemes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_startup_scheme_matches_updated_at') THEN
    CREATE TRIGGER update_startup_scheme_matches_updated_at BEFORE UPDATE ON public.startup_scheme_matches
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_startup_showcase_updated_at') THEN
    CREATE TRIGGER update_startup_showcase_updated_at BEFORE UPDATE ON public.startup_showcase
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


-- =========================================
-- SECTION 4: ROW LEVEL SECURITY (RLS)
-- =========================================

-- Enable RLS on sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_showcase ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" 
  ON public.users FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Showcase table policies (public startups viewable by all)
DROP POLICY IF EXISTS "Public startups viewable by everyone" ON public.startup_showcase;
CREATE POLICY "Public startups viewable by everyone"
  ON public.startup_showcase FOR SELECT
  USING (is_public = true);


-- =========================================
-- SECTION 5: ANALYTICS VIEWS
-- =========================================

-- Startup analytics view
CREATE OR REPLACE VIEW startup_analytics AS
SELECT 
  s.id,
  s.institution_id,
  i.name as institution_name,
  s.data->>'name' as startup_name,
  s.created_at,
  s.status,
  s.view_count,
  COUNT(DISTINCT ins.startup_id) as insights_count,
  COUNT(DISTINCT ssm.startup_id) as scheme_matches_count,
  COALESCE(sc.is_public, false) as is_showcased
FROM public.startups s
LEFT JOIN public.institutions i ON s.institution_id = i.id
LEFT JOIN public.insights ins ON s.id = ins.startup_id
LEFT JOIN public.startup_scheme_matches ssm ON s.id = ssm.startup_id
LEFT JOIN public.startup_showcase sc ON s.id = sc.startup_id
GROUP BY s.id, i.name, sc.is_public;

-- Institution dashboard view
CREATE OR REPLACE VIEW institution_dashboard AS
SELECT 
  i.id,
  i.name,
  i.city,
  i.subscription_tier,
  COUNT(DISTINCT s.id) as total_startups,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_startups,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT cs.id) as total_chat_sessions,
  AVG(CAST(s.data->>'investment_readiness_score' AS decimal)) as avg_ir_score
FROM public.institutions i
LEFT JOIN public.startups s ON i.id = s.institution_id
LEFT JOIN public.users u ON i.id = u.institution_id
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
WHERE i.is_active = true
GROUP BY i.id;


-- =========================================
-- SECTION 6: SEED DATA
-- =========================================

-- Insert sample government schemes
INSERT INTO public.govt_schemes (
  name, 
  slug, 
  description, 
  category, 
  funding_amount_min, 
  funding_amount_max, 
  eligibility_criteria, 
  official_website, 
  issuing_authority, 
  status, 
  keywords
)
VALUES 
  (
    'Startup India Seed Fund Scheme (SISFS)',
    'startup-india-seed-fund',
    'Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization. Support up to Rs 20 lakhs.',
    'funding',
    500000,
    20000000,
    '{"stages": ["idea", "validation", "early_traction"], "sectors": ["technology", "manufacturing", "services"], "age_months_max": 24, "location": ["india"]}'::jsonb,
    'https://www.startupindia.gov.in/content/sih/en/startup-scheme/siss.html',
    'DPIIT - Startup India',
    'active',
    ARRAY['seed funding', 'prototype', 'proof of concept', 'early stage', 'validation']
  ),
  (
    'NIDHI Entrepreneur in Residence (EIR)',
    'nidhi-eir',
    'Financial support to knowledge-based startups during the pre-incubation/incubation stage to help entrepreneurs set up their ventures.',
    'funding',
    2000000,
    5000000,
    '{"stages": ["incubation"], "sectors": ["technology", "science", "innovation"], "age_months_max": 36}'::jsonb,
    'https://www.nidhibigdata.res.in/',
    'DST - NIDHI Programme',
    'active',
    ARRAY['incubation', 'knowledge based', 'technology', 'science', 'entrepreneur']
  ),
  (
    'MSME Stand-Up India Scheme',
    'msme-stand-up-india',
    'Bank loans between Rs 10 lakh and Rs 1 crore to at least one SC/ST and one woman borrower per bank branch for setting up greenfield enterprises.',
    'funding',
    1000000,
    10000000,
    '{"stages": ["idea", "launch"], "sectors": ["manufacturing", "services", "trading"], "target_group": ["women", "sc", "st"]}'::jsonb,
    'https://www.standupmitra.in/',
    'Ministry of MSME',
    'active',
    ARRAY['msme', 'women entrepreneur', 'sc', 'st', 'bank loan', 'greenfield']
  ),
  (
    'Atal Innovation Mission (AIM)',
    'atal-innovation-mission',
    'Flagship initiative to promote innovation and entrepreneurship through Atal Incubation Centers, Atal Tinkering Labs, and mentorship programs.',
    'infrastructure',
    NULL,
    NULL,
    '{"stages": ["idea", "validation", "incubation"], "sectors": ["technology", "innovation"]}'::jsonb,
    'https://aim.gov.in/',
    'NITI Aayog',
    'active',
    ARRAY['innovation', 'incubation', 'mentorship', 'atal', 'tinkering lab']
  ),
  (
    'Pradhan Mantri Mudra Yojana (PMMY)',
    'pmmy-mudra-loan',
    'Provides loans up to Rs 10 lakh to non-corporate, non-farm small/micro enterprises under three categories: Shishu, Kishore, and Tarun.',
    'funding',
    50000,
    1000000,
    '{"stages": ["launch", "growth"], "sectors": ["manufacturing", "trading", "services"], "loan_types": ["shishu", "kishore", "tarun"]}'::jsonb,
    'https://www.mudra.org.in/',
    'Ministry of Finance',
    'active',
    ARRAY['mudra', 'micro finance', 'small business', 'loan', 'shishu', 'kishore', 'tarun']
  )
ON CONFLICT (slug) DO NOTHING;


-- Create initial super admin user (optional)
INSERT INTO public.users (email, full_name, role, is_active)
VALUES ('admin@portfolioiq.com', 'Super Admin', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;


-- =========================================
-- SECTION 7: VERIFICATION QUERIES
-- =========================================

-- Run these queries after script execution to verify success

-- List all new tables
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
-- ORDER BY table_name;

-- Count rows in each table
-- SELECT 
--   'institutions' as table_name, COUNT(*) as row_count FROM institutions
-- UNION ALL
-- SELECT 'startups', COUNT(*) FROM startups
-- UNION ALL
-- SELECT 'users', COUNT(*) FROM users
-- UNION ALL
-- SELECT 'govt_schemes', COUNT(*) FROM govt_schemes
-- UNION ALL
-- SELECT 'chat_sessions', COUNT(*) FROM chat_sessions;

-- Check sample government schemes
-- SELECT id, name, category, status FROM govt_schemes LIMIT 5;


-- =========================================
-- SCRIPT COMPLETE
-- =========================================
-- 
-- ✅ NEXT STEPS:
-- 1. Verify tables created: Check Table Editor in Supabase
-- 2. Check govt_schemes has 5 sample schemes
-- 3. Verify indexes created (should be automatic)
-- 4. Follow QUICK-START-DATABASE.md for Angular integration
-- 
-- ⚠️ NOTES:
-- - This script is safe to run multiple times
-- - Existing data in institutions, startups, insights is preserved
-- - New columns added with DEFAULT values
-- - RLS is enabled only on users and startup_showcase
-- 
-- 📊 TABLES CREATED:
-- - users (authentication)
-- - chat_sessions (chatbot tracking)
-- - chat_messages (chat history)
-- - landing_analytics (visitor tracking)
-- - govt_schemes (schemes database)
-- - startup_scheme_matches (AI recommendations)
-- - portfolio_reports (export history)
-- - startup_showcase (public profiles)
-- - feature_usage (product analytics)
-- - notifications (user alerts)
-- 
-- 🔧 EXISTING TABLES UPDATED:
-- - institutions (added contact info, subscription tier)
-- - startups (added status, tags, view_count)
-- - insights (added insight_type, ai_model)
-- 
-- =========================================


-- =========================================
-- UPDATES TO EXISTING TABLES
-- =========================================

-- Add columns to existing startups table
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'graduated')),
  ADD COLUMN IF NOT EXISTS tags TEXT[], -- For categorization
  ADD COLUMN IF NOT EXISTS last_scored_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add indexes to startups
CREATE INDEX IF NOT EXISTS idx_startups_institution ON public.startups(institution_id);
CREATE INDEX IF NOT EXISTS idx_startups_status ON public.startups(status);
CREATE INDEX IF NOT EXISTS idx_startups_created ON public.startups(created_at DESC);

-- Add columns to insights table
ALTER TABLE public.insights
  ADD COLUMN IF NOT EXISTS insight_type TEXT CHECK (insight_type IN ('scoring', 'market_intel', 'action_plan', 'valuation', 'schemes')),
  ADD COLUMN IF NOT EXISTS ai_model TEXT, -- Track which AI model generated this
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2); -- AI confidence 0-100

-- Add columns to institutions table
ALTER TABLE public.institutions
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'enterprise'));


-- =========================================
-- NOTE: Triggers already created in SECTION 3
-- This section is intentionally left empty to avoid duplicates
-- =========================================


-- =========================================
-- SAMPLE DATA & VIEWS
-- =========================================

-- View for startup analytics
CREATE OR REPLACE VIEW startup_analytics AS
SELECT 
  s.id,
  s.institution_id,
  i.name as institution_name,
  s.data->>'name' as startup_name,
  s.created_at,
  s.status,
  s.view_count,
  COUNT(DISTINCT ins.startup_id) as insights_count,
  COUNT(DISTINCT ssm.startup_id) as scheme_matches_count,
  sc.is_public as is_showcased
FROM public.startups s
LEFT JOIN public.institutions i ON s.institution_id = i.id
LEFT JOIN public.insights ins ON s.id = ins.startup_id
LEFT JOIN public.startup_scheme_matches ssm ON s.id = ssm.startup_id
LEFT JOIN public.startup_showcase sc ON s.id = sc.startup_id
GROUP BY s.id, i.name, sc.is_public;

-- View for institution dashboard
CREATE OR REPLACE VIEW institution_dashboard AS
SELECT 
  i.id,
  i.name,
  i.city,
  i.subscription_tier,
  COUNT(DISTINCT s.id) as total_startups,
  COUNT(DISTINCT CASE WHEN s.status = 'active' THEN s.id END) as active_startups,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT cs.id) as total_chat_sessions,
  AVG((s.data->>'investment_readiness_score')::decimal) as avg_ir_score
FROM public.institutions i
LEFT JOIN public.startups s ON i.id = s.institution_id
LEFT JOIN public.users u ON i.id = u.institution_id
LEFT JOIN public.chat_sessions cs ON u.id = cs.user_id
GROUP BY i.id;


-- =========================================
-- SEED DATA - Government Schemes
-- =========================================

INSERT INTO public.govt_schemes (name, slug, description, category, funding_amount_min, funding_amount_max, eligibility_criteria, official_website, issuing_authority, status, keywords)
VALUES 
  (
    'Startup India Seed Fund Scheme',
    'startup-india-seed-fund',
    'Financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialization.',
    'funding',
    500000,
    20000000,
    '{"stages": ["idea", "validation"], "sectors": ["technology", "manufacturing"], "age_months_max": 24}'::jsonb,
    'https://www.startupindia.gov.in/content/sih/en/startup-scheme/siss.html',
    'DPIIT - Startup India',
    'active',
    ARRAY['seed funding', 'prototype', 'proof of concept', 'early stage']
  ),
  (
    'NIDHI Entrepreneur in Residence',
    'nidhi-eir',
    'Financial support to knowledge based startups during the pre-incubation/incubation stage.',
    'funding',
    2000000,
    5000000,
    '{"stages": ["incubation"], "sectors": ["technology", "science"], "age_months_max": 36}'::jsonb,
    'https://www.nidhibigdata.res.in/',
    'DST - NIDHI',
    'active',
    ARRAY['incubation', 'knowledge based', 'technology']
  )
ON CONFLICT (slug) DO NOTHING;


-- =========================================
-- COMPLETION MESSAGE
-- =========================================
-- Run this script in your Supabase SQL Editor
-- Order of execution matters due to foreign key constraints
-- Make sure to enable RLS policies and set appropriate permissions
