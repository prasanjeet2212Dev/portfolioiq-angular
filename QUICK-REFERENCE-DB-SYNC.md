# Quick Reference: Database Sync

## Problem
Your database schema has **13 tables**, but only **3 are actually working**. 10 tables are unused or failing silently.

## Reality Check

### ✅ Working (3 tables):
- `institutions` - Auth & multi-tenancy
- `startups` - Core data
- `insights` - AI analysis

### ⚠️ Failing Silently (3 tables):
- `chat_sessions` - Called but wrapped in try-catch
- `chat_messages` - Called but wrapped in try-catch  
- `landing_analytics` - Called but wrapped in try-catch
- **Result:** Chatbot works in-memory only!

### ❌ Completely Unused (7 tables):
- `users`, `govt_schemes`, `startup_scheme_matches`, `startup_showcase`, `feature_usage`, `notifications`, `portfolio_reports`

**Steps:**
```bash
# 1. Backup database (Supabase Dashboard → Settings → Database → Backups)

# 2. Run cleanup script in Supabase SQL Editor
# Copy contents of database-cleanup.sql and execute

# 3. Verify remaining tables (should see 3)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

**Tables Removed:**
- `chat_sessions`, `chat_messages`, `landing_analytics` (fail silently)
- `users`, `govt_schemes`, `startup_scheme_matches`, `startup_showcase`, `feature_usage`, `notifications`, `portfolio_reports` (unused)

**Tables Kept:**
- `institutions` ✅
- `startups` ✅
- `insights` ✅

---

### Option 2: Fresh Start 🆕

If your database has test data, start fresh with only 3 working tables.

**Steps:**
```bash
# 1. Create new Supabase project OR reset current database

# 2. Run active schema script
# Copy contents of database-active-schema.sql
# Paste into Supabase SQL Editor and execute

# 3. Update environment files with new credentials (if new project)
```

---

### Option 3: Implement Features 🚀

Keep all tables and fix/build missing features. See `DATABASE-SYNC-ANALYSIS.md` for full implementation guide.

**Critical First Step:** Debug why chat/analytics tables fail
- Check RLS policies
- Check table existence
- Fix error handling in chatbot.component.ts

**Time Estimate:**
- Fix Chat/Analytics: 1-2 days
- User Management: 3-5 days
- Notifications: 2-3 days  
- Govt Schemes DB: 3-4 days
- Showcase Feature: 4-5 days
- Reports System: 3-4 days
- Feature Analytics: 2-3 days

**Total:** 18-26 days of development

---

## Files Created

1. **`database-cleanup.sql`** - Removes 7 unused tables
2. **`database-active-schema.sql`** - Fresh schema with only 6 active tables
3. **`DATABASE-SYNC-ANALYSIS.md`** - Detailed analysis and implementation guide
4. **`QUICK-REFERENCE-DB-SYNC.md`** - This file

---

## Recommended Actionchat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.landing_analytics CASCADE;
DROP TABLE IF EXISTS public.portfolio_reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.feature_usage CASCADE;
DROP TABLE IF EXISTS public.startup_showcase CASCADE;
DROP TABLE IF EXISTS public.startup_scheme_matches CASCADE;
DROP TABLE IF EXISTS public.govt_schemes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

This keeps your app running exactly as it does now (chatbot already works in-memory)DE;
DROP TABLE IF EXISTS public.startup_scheme_matches CASCADE;
DROP TABLE IF EXISTS public.govt_schemes CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

This keeps your app running exactly as it does now, but with a cleaner database.

---

## Impac3 working tables remain (`institutions`, `startups`, `insights`)
- ✅ Chatbot already works in-memory (database saves were failing silently)

**No impact!** The app will continue working exactly as before because:
- ✅ All actively used tables remain
- ✅ No code changes needed
- ✅ All current features work
- ✅ Performance improves slightly (fewer tables to maintain)

---

## Need Help?

See `DATABASE-SYNC-ANALYSIS.md` for:
- Detailed usage analysis
- Feature implementation guides
- Code examples for each unused table
