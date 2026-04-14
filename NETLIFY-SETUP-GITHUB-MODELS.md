# PortfolioIQ - Post-Deployment Setup Guide (GitHub Copilot/Models)

## 🎯 Your Configuration (GitHub Models Only)

Since you're using **GitHub Copilot** (not Anthropic Claude), here's exactly what you need to configure:

---

## 1️⃣ Netlify Environment Variables

**NO environment variables needed!** ✅

The app is configured to work entirely client-side. GitHub token will be stored in browser localStorage after users log in.

---

## 2️⃣ Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project (or use existing)
3. Note down:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### Step 2: Run Database Schema
1. In Supabase Dashboard → **SQL Editor**
2. Run this file: `database-schema-improvements.sql`
   - Creates all tables: institutions, startups, insights, etc.
   - Sets up Row Level Security (RLS) policies
   - **IMPORTANT:** This script is safe to run multiple times (has `ON CONFLICT` handling)

### Step 3: Create Super Admin (Optional)
```sql
-- In Supabase SQL Editor, run:
INSERT INTO institutions (name, code, passcode, is_super_admin)
VALUES ('Super Admin', 'superadmin', '$2a$10$hashed_password', true)
ON CONFLICT (code) DO NOTHING;
```

Or use the regular flow:
- First institution registered becomes institution admin
- Super admin can be created via SQL

---

## 3️⃣ Update Production Environment File

**File:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://YOUR_PROJECT.supabase.co',  // ⬅️ Your Supabase URL
    key: 'YOUR_SUPABASE_ANON_KEY'              // ⬅️ Your Anon Key
  },
  ai: {
    provider: 'github',  // ✅ Keep this as 'github'
    
    github: {
      token: '',         // ⬅️ Leave EMPTY (users add via Settings)
      model: 'gpt-4o'    // ✅ Or 'gpt-4o-mini' for faster/cheaper
    },
    
    claude: {
      apiKey: ''         // ⬅️ Leave EMPTY (not using)
    }
  }
};
```

---

## 4️⃣ GitHub Token Setup (For Users)

After deployment, **each user** needs to add their own GitHub token:

### How Users Get GitHub Token:
1. Go to https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: "PortfolioIQ AI"
4. Select scopes:
   - ✅ `repo` (if accessing private repos)
   - ✅ `read:user`
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_...`)

### How Users Add Token to App:
**OPTION A: After Login (Current Implementation)**
- The app currently expects environment.ts to have the token pre-filled
- You'll need to add a Settings page for runtime token entry

**OPTION B: Pre-filled in Code (Dev Only)**
- Add your token in `environment.prod.ts` during build
- **⚠️ NOT RECOMMENDED for production** (security risk)

---

## 5️⃣ Recommended: Add Settings Page for Runtime Token

Since you removed the AI Settings button from startup detail, users need a way to add their GitHub token. Here's what to implement:

### Create Settings Route:
```typescript
// app-routing.module.ts
{ 
  path: 'settings', 
  component: SettingsComponent,
  canActivate: [AuthGuard] 
}
```

### Settings Component (Simple):
```typescript
// settings.component.ts
export class SettingsComponent {
  githubToken = '';
  
  constructor(private aiService: ClaudeAIService) {
    this.githubToken = localStorage.getItem('github_token') || '';
  }
  
  saveToken() {
    localStorage.setItem('github_token', this.githubToken);
    // Update AI service to use this token
    this.toast.success('GitHub token saved successfully');
  }
}
```

### Update ClaudeAIService:
```typescript
// claude-ai.service.ts
private restoreAPIKey() {
  // Check localStorage first (user-provided token)
  const storedToken = localStorage.getItem('github_token');
  if (storedToken) {
    this.apiKey = storedToken;
    return;
  }
  
  // Fallback to environment
  const env = environment as any;
  if (env.ai?.github?.token) {
    this.apiKey = env.ai.github.token;
  }
}
```

---

## 6️⃣ Deployment Checklist

### Before Deploying to Netlify:

✅ **1. Update `environment.prod.ts`:**
   - Add your Supabase URL
   - Add your Supabase Anon Key
   - Ensure `provider: 'github'`
   - Leave GitHub token empty

✅ **2. Run Supabase Schema:**
   - Execute `database-schema-improvements.sql` in Supabase SQL Editor
   - Verify tables created: institutions, startups, insights

✅ **3. Test Locally:**
   ```bash
   ng build --configuration production
   # Test the production build locally
   ```

✅ **4. Deploy to Netlify:**
   - Push code to GitHub
   - Netlify auto-builds and deploys
   - Site goes live at your Netlify URL

✅ **5. First Login:**
   - Visit your Netlify site
   - Register first institution (becomes admin)
   - Add GitHub token via Settings page

---

## 7️⃣ GitHub Models API Details

**What you're using:**
- **Service:** GitHub Models (Free preview)
- **Model:** GPT-4o (via Azure OpenAI)
- **Endpoint:** https://models.inference.ai.azure.com
- **Authentication:** GitHub Personal Access Token (ghp_...)

**Limitations:**
- Rate limits apply (varies by model)
- Free during preview period
- Requires valid GitHub account

**Available Models:**
- `gpt-4o` - Most capable, slower
- `gpt-4o-mini` - Faster, cheaper
- `gpt-4` - Previous generation

---

## 8️⃣ Common Issues & Solutions

### Issue: "AI features not working"
**Solution:** Check that GitHub token is saved in localStorage
```javascript
// Browser Console:
localStorage.getItem('github_token')
// Should return: "ghp_xxxxxxxxxxxx"
```

### Issue: "Database connection failed"
**Solution:** Verify Supabase credentials in environment.prod.ts
- URL format: `https://xxxxx.supabase.co`
- Key should be the **anon/public** key (not service_role)

### Issue: "No data showing after login"
**Solution:** Run the database schema file in Supabase
```sql
-- Check if tables exist:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 9️⃣ Security Recommendations

### For Production:

**Current Setup (Client-Side):**
- ⚠️ GitHub tokens stored in browser localStorage
- ⚠️ API calls made directly from browser
- ⚠️ Token visible in network requests

**Recommended Production Setup:**
1. **Move AI calls to Netlify Functions:**
   ```typescript
   // netlify/functions/ai-analysis.ts
   export async function handler(event) {
     const githubToken = process.env.GITHUB_TOKEN;
     // Call GitHub Models API from server
   }
   ```

2. **Store token as Netlify environment variable:**
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add: `GITHUB_TOKEN` = `ghp_your_token_here`

3. **Remove token from client code:**
   - App calls Netlify Function
   - Function uses server-side token
   - Token never exposed to browser

---

## 🎉 Quick Start Summary

1. **Update** `environment.prod.ts` with Supabase credentials
2. **Run** database schema in Supabase SQL Editor
3. **Deploy** to Netlify (auto-builds on GitHub push)
4. **Register** first institution on live site
5. **Add** GitHub token via Settings page
6. **Start** using AI features!

---

## 📞 Need Help?

- Database not working? Check Supabase logs
- AI not responding? Verify GitHub token in localStorage
- Build failing? Check Netlify build logs

**Your current setup:** GitHub Models (FREE) ✅
**No Anthropic needed:** Correct! ✅
