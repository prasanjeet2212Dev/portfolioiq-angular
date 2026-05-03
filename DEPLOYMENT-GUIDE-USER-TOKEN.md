# 🚀 Netlify Deployment Guide - User-Provided Token Approach

## Overview

Portfolio IQ uses a **user-provided token** approach where each user configures their own GitHub token after deployment. This is the **recommended and secure** approach for SaaS applications.

---

## ✅ Benefits of This Approach

- ✅ **No secrets in code** - Tokens never committed to Git
- ✅ **User-specific tokens** - Each organization uses their own API credits
- ✅ **Easy management** - Users can rotate tokens anytime
- ✅ **No Netlify env vars needed** - Simpler deployment
- ✅ **Works immediately** - No setup required before deployment

---

## 📦 Deployment Steps

### **Step 1: Push to GitHub**

```bash
git add .
git commit -m "Production-ready deployment"
git push origin main
```

### **Step 2: Connect to Netlify**

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your `portfolioiq-angular` repository
5. Configure build settings:
   - **Build command:** `npm run build:prod`
   - **Publish directory:** `dist/portfolioiq-angular`
   - **Node version:** 20 (set in netlify.toml automatically)
6. Click **"Deploy site"**

### **Step 3: Wait for Build**

Netlify will:
- Install dependencies (`npm install`)
- Run production build (`ng build --configuration production`)
- Deploy to CDN

### **Step 4: Configure Custom Domain** (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `portfolioiq.yourdomain.com`)
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Netlify)

---

## 🔧 User Setup After Deployment

### **For Super Admins:**

Once deployed, users need to configure their GitHub token:

1. **Access the app** at your Netlify URL (e.g., `https://your-app.netlify.app`)
2. **Login as Super Admin:**
   - Email: `super-admin`
   - Password: `SuperAdmin@2026`
3. **Open AI Settings:**
   - Click **"⚙️ AI Settings"** button in the top-right
4. **Get GitHub Token:**
   - Visit https://github.com/settings/tokens
   - Click **"Generate new token (classic)"**
   - Set name: `Portfolio IQ Production`
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:org` (Read org and team membership)
   - Set expiration: 90 days or No expiration
   - Click **"Generate token"**
   - **Copy the token** (starts with `ghp_...`)
5. **Save Token in App:**
   - Paste token in the Settings panel
   - Click **"💾 Save Token"**
   - Verification: Should see "✅ Token configured - AI features enabled"

6. **Test AI Features:**
   - Open chatbot (bottom-right bubble)
   - Send a message
   - Generate startup analysis

---

## 🔐 Security Considerations

### **Local Storage**
The token is stored in browser `localStorage`:
- ✅ **Per-domain:** Only accessible on your domain
- ✅ **Client-side:** Not exposed to other users
- ✅ **Persists:** Survives page refreshes
- ⚠️ **Browser-based:** Users should use trusted devices

### **Best Practices:**

1. **Token Rotation:** 
   - Set 90-day expiration on GitHub tokens
   - Remind users to rotate periodically

2. **Private Deployment:**
   - If deploying for single organization, add password protection via Netlify
   - Settings → Visitor access → Password protect

3. **Token Scope:**
   - Only grant minimum required scopes
   - Don't use tokens with `admin` or `delete` permissions

---

## 🌐 Environment Configuration

### **Production Environment** (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://eejwbapeabedzvtknjad.supabase.co',
    key: 'sb_publishable_dZXEzlt_Ztwsa6hARg-Lzg_iyeGbbYi'
  },
  ai: {
    provider: 'github',
    github: {
      token: '',  // Empty - users provide via Settings
      model: 'gpt-4o'
    },
    claude: {
      apiKey: ''
    }
  }
};
```

### **Token Loading Priority** (in AIService)

1. **Environment file** (`environment.ts/prod.ts`)
2. **localStorage** (`piq_ai_key`) ← User-provided token via Settings
3. **Fallback:** Empty string (AI features disabled)

---

## 📊 Netlify Configuration Files

### **`netlify.toml`**

```toml
[build]
  command = "npm run build:prod"
  publish = "dist/portfolioiq-angular"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/api/github-models/*"
  to = "https://models.inference.ai.azure.com/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **`package.json` Scripts**

```json
{
  "scripts": {
    "build:prod": "ng build --configuration production"
  }
}
```

---

## 🐛 Troubleshooting

### **Issue: "AI features not working"**

**Check:**
1. Token is saved: Open Settings → Should show "✅ Token configured"
2. Browser console (F12) → Check for errors
3. Network tab → `/api/github-models/chat/completions` should return 200
4. Try clearing localStorage and re-adding token

**Fix:**
```javascript
// In browser console:
localStorage.getItem('piq_ai_key')  // Should show your token
localStorage.setItem('piq_ai_key', 'ghp_YOUR_NEW_TOKEN')  // Manually set
```

### **Issue: "Build fails on Netlify"**

**Check build logs for:**
- Node version issues → Ensure Node 20 in netlify.toml
- Dependency errors → Delete `package-lock.json` and rebuild locally
- TypeScript errors → Run `npm run build:prod` locally first

### **Issue: "Database not connecting"**

**Fix:** Update Supabase credentials in `environment.prod.ts`:
```typescript
supabase: {
  url: 'YOUR_SUPABASE_URL',
  key: 'YOUR_SUPABASE_ANON_KEY'
}
```

---

## 📝 User Documentation

**Create this guide for your users:**

# Setting Up AI Features

1. **Login** to Portfolio IQ
2. **Click** the ⚙️ AI Settings button (top-right)
3. **Generate** a GitHub token:
   - Visit https://github.com/settings/tokens
   - Create "Personal access token (classic)"
   - Select: `repo` and `read:org` scopes
   - Copy the token
4. **Paste** token in Settings panel
5. **Click** "Save Token"
6. **Test** by opening the chatbot and sending a message

Your AI features are now enabled! 🎉

---

## 🔄 Updating the App

To deploy updates:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Netlify will automatically:
- Detect the push
- Rebuild the app
- Deploy to production
- User tokens persist (stored in browser)

---

## 💡 Alternative: Organization-Wide Token

If you want to provide a **single token for all users**:

1. Generate an organization GitHub token
2. Store in Netlify environment variables:
   - Go to Site settings → Environment variables
   - Add: `GITHUB_TOKEN = ghp_...`
3. Update deployment docs (NETLIFY-SETUP-GITHUB-MODELS.md)
4. Users won't need to configure tokens

**Pros:** Easier for users  
**Cons:** Single point of failure, all users share API limits

---

## ✨ Summary

✅ Deploy to Netlify (zero configuration)  
✅ Users add their own GitHub tokens via Settings  
✅ Tokens stored securely in browser localStorage  
✅ No secrets in Git repository  
✅ Each user manages their own API credits  

**Your app is production-ready!** 🚀
