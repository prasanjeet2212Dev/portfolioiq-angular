# 📊 Portfolio IQ - Database Schema Implementation Guide

## 🎯 Overview

This document explains the database improvements needed for Portfolio IQ based on current and upcoming features.

---

## 📋 New Tables Summary

### **1. CRITICAL TABLES (Implement First)**

#### **users** - Proper User Management
**Why:** Replace sessionStorage authentication with proper user accounts
- **Current Issue:** Using sessionStorage for auth (not persistent, no multi-device support)
- **Solution:** Proper user table with roles, institution mapping
- **Priority:** ⭐⭐⭐⭐⭐ CRITICAL

**Impact:**
- Enables proper login/logout
- Multi-device support
- User management dashboard
- Permission-based access control

#### **chat_sessions** - Guest & User Chat Tracking
**Why:** Track who's using the AI chatbot and convert them to users
- **Current Issue:** No tracking of guest users who use chatbot
- **Solution:** Store guest details, track conversion funnel
- **Priority:** ⭐⭐⭐⭐⭐ CRITICAL (just implemented chatbot)

**Impact:**
- Identify potential customers
- Track chatbot effectiveness
- Convert guests to registered users
- Analytics on AI usage

#### **chat_messages** - Conversation History
**Why:** Store AI conversations for analytics and user reference
- **Current Issue:** Conversations lost on page refresh
- **Solution:** Persistent chat history
- **Priority:** ⭐⭐⭐⭐ HIGH

**Impact:**
- Users can review past conversations
- Analyze common questions
- Improve AI responses
- Export chat transcripts

---

### **2. ANALYTICS TABLES (Implement Second)**

#### **landing_analytics** - Visitor Behavior Tracking
**Why:** Understand how visitors interact with landing page
- **Features Tracked:**
  - Page views
  - CTA clicks
  - Search usage
  - Chatbot opens
  - Form submissions
- **Priority:** ⭐⭐⭐⭐ HIGH

**Impact:**
- Optimize landing page
- Track conversion funnel
- A/B testing data
- ROI measurement

#### **feature_usage** - Product Analytics
**Why:** See which features are actually being used
- **Tracks:**
  - AI scoring usage
  - Comparison feature
  - Export/reports
  - Valuation tools
- **Priority:** ⭐⭐⭐ MEDIUM

**Impact:**
- Focus development on popular features
- Identify unused features
- Performance monitoring
- User engagement metrics

---

### **3. FEATURE TABLES (Implement Third)**

#### **govt_schemes** - Government Schemes Database
**Why:** Replace hardcoded schemes with dynamic database
- **Current Issue:** Schemes are hardcoded in TypeScript
- **Solution:** Searchable, filterable database
- **Priority:** ⭐⭐⭐⭐ HIGH

**Impact:**
- Easy to add/update schemes
- Better AI matching
- User scheme applications tracking
- Admin management interface

#### **startup_scheme_matches** - AI Scheme Recommendations
**Why:** Track AI-generated scheme matches and their status
- **Tracks:**
  - Match confidence scores
  - Application status
  - User feedback
- **Priority:** ⭐⭐⭐ MEDIUM

**Impact:**
- Better scheme recommendations
- Track application success rate
- Learn from user feedback

#### **startup_showcase** - Public Portfolios
**Why:** Allow startups to have public profiles (like LinkedIn)
- **Features:**
  - Public URLs (e.g., portfolioiq.com/startup/tech-startup)
  - SEO-friendly
  - Controlled visibility
- **Priority:** ⭐⭐⭐ MEDIUM

**Impact:**
- Social proof for startups
- Marketing opportunity
- Network effects
- Lead generation

---

### **4. SUPPORTING TABLES (Implement Fourth)**

#### **portfolio_reports** - Export Tracking
**Why:** Track generated reports and allow re-downloading
- **Features:**
  - Report history
  - Temporary URLs
  - Download analytics
- **Priority:** ⭐⭐ LOW

#### **notifications** - User Notifications
**Why:** Notify users about important events
- **Use Cases:**
  - New scheme matches
  - Startup updates
  - System announcements
- **Priority:** ⭐⭐ LOW

---

## 🔧 Implementation Steps

### **Phase 1: Core Authentication (Week 1)**

1. **Run SQL Script**
   ```sql
   -- In Supabase SQL Editor, run sections:
   -- 1. users table
   -- 2. Update existing institutions table
   -- 3. Utility functions for updated_at
   ```

2. **Update Supabase Service**
   ```typescript
   // Add methods in supabase.service.ts:
   - createUser()
   - loginUser()
   - getCurrentUser()
   - updateUserProfile()
   ```

3. **Replace SessionStorage Auth**
   ```typescript
   // Current: sessionStorage.setItem('piq_session', ...)
   // New: Use Supabase Auth + users table
   ```

4. **Update Auth Component**
   - Add user registration flow
   - Hash passwords (use Supabase Auth)
   - Email verification (optional)

**Files to Update:**
- `src/app/services/supabase.service.ts`
- `src/app/features/auth/auth.component.ts`
- `src/app/guards/auth.guard.ts`

---

### **Phase 2: Chatbot Enhancement (Week 2)**

1. **Create Chat Tables**
   ```sql
   -- In Supabase SQL Editor:
   -- 1. chat_sessions table
   -- 2. chat_messages table
   ```

2. **Update Chatbot Component**
   ```typescript
   // In chatbot.component.ts:
   - Save chat session on open
   - Store each message in DB
   - Load chat history
   - Track guest → user conversion
   ```

3. **Add Chat Service**
   ```typescript
   // New file: src/app/services/chat.service.ts
   createChatSession()
   saveChatMessage()
   getChatHistory()
   trackConversion()
   ```

**Files to Update:**
- `src/app/shared/chatbot/chatbot.component.ts`
- `src/app/services/` (new chat.service.ts)

---

### **Phase 3: Analytics Implementation (Week 3)**

1. **Landing Page Tracking**
   ```typescript
   // In landing.component.ts:
   ngOnInit() {
     this.trackPageView();
   }
   
   navigateToAuth() {
     this.trackEvent('cta_clicked', { button: 'signup' });
     this.router.navigate(['/auth']);
   }
   ```

2. **Create Analytics Service**
   ```typescript
   // New file: src/app/services/analytics.service.ts
   trackPageView()
   trackEvent()
   trackFeatureUsage()
   ```

3. **Add to All Components**
   - Dashboard: Track feature usage
   - Comparison: Track comparisons
   - Detail: Track AI generation

**Files to Create:**
- `src/app/services/analytics.service.ts`

**Files to Update:**
- All feature components

---

### **Phase 4: Government Schemes (Week 4)**

1. **Seed Schemes Database**
   ```sql
   -- Run seed data section from SQL script
   -- Add more schemes manually or via admin panel
   ```

2. **Update Govt Schemes Component**
   ```typescript
   // In govt-schemes.component.ts:
   async loadSchemes() {
     const schemes = await this.supabase.getGovtSchemes();
     // Display dynamically
   }
   ```

3. **Add Scheme Matching**
   ```typescript
   // In claude-ai.service.ts:
   async matchSchemes(startup: Startup) {
     // AI generates matches
     // Save to startup_scheme_matches table
   }
   ```

**Files to Update:**
- `src/app/features/govt-schemes/govt-schemes.component.ts`
- `src/app/services/claude-ai.service.ts`
- `src/app/services/supabase.service.ts`

---

### **Phase 5: Public Showcase (Week 5)**

1. **Create Showcase Tables**
   ```sql
   -- Run startup_showcase table creation
   ```

2. **Add Public Routes**
   ```typescript
   // In app-routing.module.ts:
   { path: 'showcase/:slug', component: PublicStartupComponent }
   ```

3. **Create Public Component**
   ```typescript
   // New file: public-startup.component.ts
   // Display public startup profile
   // No authentication required
   ```

**Files to Create:**
- `src/app/features/public-startup/` (new component)

---

## 📊 Data Migration Strategy

### **For Existing Data**

1. **Institutions** ✅ Already exists
   - Add new columns (contact_email, logo_url, etc.)
   - Update with real data

2. **Startups** ✅ Already exists
   - Add status, tags columns
   - No data migration needed

3. **Users** ❗ NEW - Migration needed
   ```sql
   -- Create initial super admin
   INSERT INTO users (email, full_name, role)
   VALUES ('adminsuper@portfolioiq.com', 'Super Admin', 'super_admin');
   
   -- Create admin for each institution
   INSERT INTO users (email, full_name, institution_id, role)
   SELECT 
     CONCAT(LOWER(slug), '@portfolioiq.com'),
     name,
     id,
     'admin'
   FROM institutions;
   ```

---

## 🔐 Row Level Security (RLS) Best Practices

### **Public Tables** (No RLS needed)
- `landing_analytics` - Insert only
- `chat_sessions` (guest) - Insert only
- `startup_showcase` (where is_public=true)

### **Protected Tables** (RLS Required)
```sql
-- Example: startups table
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

-- Users can only see their institution's startups
CREATE POLICY "institution_startups" ON startups
  FOR SELECT USING (
    institution_id = (
      SELECT institution_id FROM users 
      WHERE id = auth.uid()::bigint
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::bigint 
      AND role = 'super_admin'
    )
  );
```

---

## 📈 Expected Database Size Estimates

### **After 1 Year** (10 institutions, 100 startups each)

| Table | Rows | Size | Growth |
|-------|------|------|--------|
| users | ~100 | 50 KB | Low |
| institutions | ~10 | 10 KB | Very Low |
| startups | ~1,000 | 5 MB | Medium |
| insights | ~5,000 | 25 MB | High |
| chat_sessions | ~5,000 | 2 MB | Medium |
| chat_messages | ~50,000 | 20 MB | High |
| landing_analytics | ~100,000 | 50 MB | High |
| feature_usage | ~200,000 | 100 MB | Very High |
| govt_schemes | ~100 | 100 KB | Very Low |
| startup_scheme_matches | ~10,000 | 5 MB | Medium |

**Total: ~210 MB** (very manageable for Supabase free tier: 500 MB)

---

## 🎯 Priority Implementation Order

1. **Week 1:** ⭐⭐⭐⭐⭐ `users` table + authentication
2. **Week 2:** ⭐⭐⭐⭐⭐ `chat_sessions` + `chat_messages`
3. **Week 3:** ⭐⭐⭐⭐ `landing_analytics` + `feature_usage`
4. **Week 4:** ⭐⭐⭐⭐ `govt_schemes` + `startup_scheme_matches`
5. **Week 5:** ⭐⭐⭐ `startup_showcase`
6. **Week 6:** ⭐⭐ `portfolio_reports` + `notifications`

---

## ✅ Must-Keep/Must-Have Details

### **JSONB Fields Architecture**

#### **startups.data** (Keep current structure)
```json
{
  "name": "TechStartup",
  "sector": "Technology",
  "stage": "Seed",
  "investment_readiness_score": 85,
  "market_potential_score": 90,
  "founders": [...],
  "funding": {...},
  "metrics": {...}
}
```

#### **insights.data** (Keep current structure)
```json
{
  "analysis": "AI-generated analysis text",
  "market_intel": "Market insights",
  "action_plan": "Recommended actions",
  "valuation": {...}
}
```

#### **govt_schemes.eligibility_criteria** (New structure)
```json
{
  "sectors": ["technology", "manufacturing"],
  "stages": ["seed", "series_a"],
  "location": ["india", "delhi"],
  "age_months_max": 24,
  "revenue_max": 100000000,
  "employee_count_max": 50
}
```

### **Critical Indexes**

All foreign keys must have indexes:
```sql
CREATE INDEX idx_[table]_[column] ON [table]([column]);
```

Example:
```sql
CREATE INDEX idx_startups_institution ON startups(institution_id);
CREATE INDEX idx_users_institution ON users(institution_id);
```

### **Timestamp Consistency**

All tables must have:
- `created_at TIMESTAMPTZ DEFAULT NOW()`
- `updated_at TIMESTAMPTZ DEFAULT NOW()` (with trigger)

---

## 🚀 Quick Start Commands

```bash
# 1. Copy SQL script
cat database-schema-improvements.sql

# 2. Open Supabase Dashboard
https://supabase.com/dashboard/project/[your-project]/sql

# 3. Paste and run the SQL script

# 4. Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# 5. Test with sample query
SELECT * FROM users LIMIT 5;
```

---

## 📞 Support & Next Steps

After implementing Phase 1 (users table), you can:
1. Replace sessionStorage auth with proper Supabase Auth
2. Add user registration/login UI
3. Implement role-based permissions
4. Add user management dashboard

**Questions to Ask:**
- Do you want email verification for new users?
- Should we allow social login (Google, LinkedIn)?
- What should the password policy be?
- Do you want password reset via email?

