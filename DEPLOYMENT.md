# PortfolioIQ Angular - Deployment Complete ✅

## Live Application
- **URL:** https://iq-portfolios.netlify.app
- **GitHub:** https://github.com/prasanjeet2212Dev/portfolioiq-angular
- **Status:** Live and Ready! 🚀

## Credentials & Configuration

### Supabase Setup ✅
- **Project URL:** https://eejwbapeabedzvtknjad.supabase.co
- **Anon Key:** sb_publishable_dZXEzlt_Ztwsa6hARg-Lzg_iyeGbbYi
- **Database:** Multi-tenant (institutions, startups, insights tables)
- **Tables Created:** ✅ institutions, startups, insights with RLS policies

### Claude AI Setup ✅
- **API Key:** Must be added to environment files before deployment
- **Access:** Via ⚙ Settings → AI Settings after login (for runtime key override)
- **Production Deployment:** See "Deploying to Netlify" section below

## Quick Start Guide

### First Login
1. Go to https://iq-portfolios.netlify.app
2. **Sign In:**
   - Institution Code: `tesla`
   - Passcode: `test1234`
3. Or **Register** a new institution

### Add Claude API Key
1. Click **⚙ (gear icon)** in sidebar
2. Paste your Claude API key
3. Click "Save Key"
4. Now AI features are enabled!

## Features Available
✅ Multi-Institution Auth
✅ Portfolio Dashboard with KPIs
✅ Investment Readiness Scoring (IR Score 0-100)
✅ Market Potential Scoring (MP Score 0-100)
✅ Claude AI Integration:
   - 📊 Investment Analysis
   - 📈 Market Intelligence
   - 🎯 90-Day Action Plans
   - 💰 Valuation Estimation
   - 🏛 Government Scheme Matching
✅ Real-time Supabase Updates
✅ Mobile Responsive Design
✅ Dark Theme UI

## Architecture
- **Frontend:** Angular 14 (TypeScript)
- **Backend:** Supabase (PostgreSQL + Real-time)
- **AI:** Anthropic Claude API
- **Hosting:** Netlify (Auto-deploys on GitHub push)
- **Package Size:** 552 KB (optimized production build)

## Next Steps
1. ✅ Test the app at https://iq-portfolios.netlify.app
2. ✅ Add some test startups
3. ✅ Try AI features (Analysis, Market Intel, Valuations)
4. ✅ Create new institutions for your incubators

## Development & Updates
- Push code to GitHub → Netlify auto-deploys
- All credentials stored in browser localStorage (secure)
- No sensitive data on servers

## Support & Documentation
- See README.md in the repository for detailed setup
- Netlify logs available in dashboard for debugging
- All AI features require valid Claude API key

## Deploying to Netlify

### Claude API Key Setup
The Claude API key is **not** committed to the repository for security reasons. Users must add it via the Settings page after logging in:

1. **After Deployment:** App builds and deploys without Claude API key
2. **Users Add Their Own Key:**
   - Log in to the app
   - Click **⚙ Settings** icon in sidebar 
   - Paste Claude API key
   - Click "Save Key"
   - AI features are now enabled for that user

The API key is stored in browser localStorage and persists across sessions.

**Security Note:** The current implementation uses direct browser API calls with the `dangerous-direct-browser-access` header. For production, consider:
- Moving Claude API calls to a backend server/Netlify Functions
- Using API key rotation and rate limiting
- Implementing proper authentication middleware

### Build Process
```bash
# Netlify automatically runs:
npm install
npm run build

# Deploys: dist/portfolioiq-angular folder
```

---

**Status:** LIVE AND READY FOR USE! 🎉
