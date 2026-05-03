-- =========================================
-- DATABASE CLEANUP SCRIPT
-- Removes unused tables from PortfolioIQ
-- =========================================
-- 
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS!
-- 
-- This script removes 10 unused tables that have no active usage in the app.
-- The app currently only uses: institutions, startups, and insights.
--
-- Chat/analytics tables exist but fail silently - chatbot works in-memory only.
--
-- =========================================

-- Drop unused tables in correct order (respecting foreign keys)

-- 1. Drop chat tables (methods exist but fail silently - not actually used)
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;

-- 2. Drop analytics table (tracking method exists but fails silently)
DROP TABLE IF EXISTS public.landing_analytics CASCADE;

-- 3. Drop tables with no dependencies
DROP TABLE IF EXISTS public.portfolio_reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.feature_usage CASCADE;
DROP TABLE IF EXISTS public.startup_showcase CASCADE;

-- 4. Drop scheme-related tables
DROP TABLE IF EXISTS public.startup_scheme_matches CASCADE;
DROP TABLE IF EXISTS public.govt_schemes CASCADE;

-- 5. Drop users table (app uses institution-based auth, not user auth)
DROP TABLE IF EXISTS public.users CASCADE;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================
-- Run these after cleanup to verify remaining tables:

-- List all remaining tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Expected tables after cleanup (ONLY 3):
-- 1. institutions (auth & multi-tenancy)
-- 2. startups (core data)
-- 3. insights (AI analysis)

-- =========================================
-- ROLLBACK PLAN
-- =========================================
-- If you need to restore these tables, you'll need to:
-- 1. Restore from your database backup
-- 2. OR re-run the original schema creation script
-- 3. The schema is preserved in DATABASE-IMPLEMENTATION-GUIDE.md
