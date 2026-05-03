# 🗄️ Enable Database Tracking for Portfolio IQ

## Current Status
- ✅ Chatbot integrated with DatabaseService
- ✅ Dev server running with proxy config
- ⚠️ Database tables NOT YET CREATED in Supabase

## Quick Setup (5 minutes)

### Step 1: Run SQL Migration in Supabase

1. Open your [Supabase Dashboard](https://eejwbapeabedzvtknjad.supabase.co)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `database-schema-improvements.sql` from this project
5. Paste into the SQL Editor
6. Click **RUN** (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

### Step 2: Verify Tables Were Created

1. In Supabase, click **Table Editor** in the left sidebar
2. You should now see these NEW tables:
   - ✅ `chat_sessions` - Stores chatbot conversation sessions
   - ✅ `chat_messages` - Stores individual messages
   - ✅ `users` - User accounts (future use)
   - ✅ `landing_analytics` - Landing page tracking
   - ✅ `feature_usage` - Feature usage metrics
   - ✅ `govt_schemes` - Government funding schemes
   - ✅ `startup_scheme_matches` - Scheme recommendations
   - ✅ `startup_showcase` - Public portfolio showcase
   - ✅ `notifications` - In-app notifications
   - ✅ `portfolio_reports` - Generated reports

### Step 3: Test Database Tracking

1. Open your app at http://localhost:4200
2. Open the chatbot (bottom-right corner)
3. Register as a guest (enter name, email, phone)
4. Send a message
5. Go back to Supabase → **Table Editor** → `chat_sessions`
6. You should see 1 new row with your guest info!
7. Check `chat_messages` → Should have 2+ rows (your message + AI response)

## What Gets Tracked

### Currently Active:
- ✅ **Chat Sessions** - Guest registration, user info, session metadata
- ✅ **Chat Messages** - Every message, AI model used, response time
- ✅ **Conversion Tracking** - Guest → Registered user tracking

### Ready But Not Yet Integrated:
- ⏳ **Landing Analytics** - Page views, button clicks, search usage
- ⏳ **Feature Usage** - Valuation tool, government schemes, market sizing
- ⏳ **Government Schemes** - Loading schemes from database
- ⏳ **Startup Showcase** - Public portfolio listing

## Row Level Security (RLS)

The SQL script creates tables **without RLS enabled** for ease of testing. For production:

1. Enable RLS:
```sql
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
```

2. Create policies (example):
```sql
-- Allow anyone to insert chat sessions
CREATE POLICY "Allow public chat sessions" 
ON chat_sessions FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow users to view their own sessions
CREATE POLICY "Users view own sessions" 
ON chat_sessions FOR SELECT 
USING (guest_email = current_user_email());
```

## Troubleshooting

### "Supabase not initialized"
- Check `environment.ts` has correct Supabase URL and anon key
- Verify config in localStorage: Open DevTools → Application → Local Storage → `piq_config`

### "relation does not exist"
- SQL script not run yet → Run the migration in SQL Editor
- Wrong schema → Ensure you're using `public` schema

### "Foreign key violation"
- Chat session must be created before messages
- The chatbot code handles this automatically

### No data appearing in tables
- Check browser console for errors (F12 → Console tab)
- Verify `piq_chat_session_id` exists in sessionStorage
- Check Network tab for failed API requests to Supabase

## Viewing Analytics (Future)

Once you integrate the admin dashboard:

```typescript
// Example: Get chat statistics
const { data, error } = await supabase
  .from('chat_sessions')
  .select('*, chat_messages(count)')
  .eq('conversion_status', 'registered');

console.log('Converted users:', data);
```

## Next Steps

1. ✅ Run SQL migration (Step 1 above)
2. ✅ Test chatbot database tracking (Step 3 above)
3. (Optional) Integrate landing analytics - see `QUICK-START-DATABASE.md`
4. (Optional) Build analytics dashboard to view collected data
5. (Optional) Enable RLS for production security

---

**Questions?** Check the detailed guide in `QUICK-START-DATABASE.md` or `DATABASE-IMPLEMENTATION-GUIDE.md`
