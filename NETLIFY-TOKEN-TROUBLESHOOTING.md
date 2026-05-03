# Netlify Token Troubleshooting Guide

## Problem
**Error:** `GitHub Models - Error response: {"error":{"code":"unauthorized","message":"Bad credentials"}}`

**What this means:** The GITHUB_TOKEN in Netlify environment variables is either missing, incorrect, or expired.

## Solution Steps

### 1. Verify Netlify Environment Variable

1. Go to your Netlify Dashboard: https://app.netlify.com
2. Select your site (portfolioiq-angular)
3. Navigate to: **Site Settings → Environment Variables**
4. Look for `GITHUB_TOKEN`

**Check:**
- ✅ Variable exists
- ✅ Set for **Production** scope (not just "Deploy Preview")
- ✅ No typo in variable name (must be exactly `GITHUB_TOKEN`)

### 2. Verify Token Format

Your GitHub token should:
- Start with: `github_pat_`
- Be approximately 93 characters long
- Have NO spaces or line breaks
- Look like: `github_pat_11ABCDEFG0123456789_aBcDeFgHiJkLmNoPqRsTuVwXyZ...`

### 3. Get or Regenerate Your GitHub Token

**If you don't have a token or need a new one:**

1. Go to: https://github.com/settings/tokens?type=beta
2. Click **"Generate new token"** (fine-grained token)
3. Configure:
   - **Token name:** `Netlify PortfolioIQ Production`
   - **Expiration:** 90 days (or custom)
   - **Repository access:** Public Repositories (All repositories)
   - **Permissions → Repository permissions:**
     - Contents: Read-only
     - Metadata: Read-only
4. Click **"Generate token"**
5. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### 4. Update Netlify Environment Variable

**If token is missing:**
1. In Netlify Dashboard → Site Settings → Environment Variables
2. Click **"Add a variable"**
3. Enter:
   - **Key:** `GITHUB_TOKEN`
   - **Value:** Paste your full token (starts with `github_pat_`)
   - **Scopes:** Check **"Production"**
4. Click **"Create variable"**

**If token exists but is wrong:**
1. Click the **Edit** icon (pencil) next to `GITHUB_TOKEN`
2. Paste the new token value
3. Make sure **"Production"** scope is checked
4. Click **"Save"**

### 5. Trigger Redeploy

**Option A - Trigger deploy in Netlify:**
1. Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes for build

**Option B - Push a small change:**
```powershell
# Make a trivial change to trigger rebuild
git commit --allow-empty -m "chore: trigger redeploy for token update"
git push origin feature/added-auth-services
```

### 6. Verify Fix

After deployment completes:
1. Visit your production site
2. Login as: `tesla` / `test1234`
3. Open chatbot (bottom right)
4. Send a message like: "What is Investment Readiness Score?"
5. Should work without errors! ✅

## Common Mistakes

❌ **Token copied with spaces/line breaks**
- Copy the entire token in one line
- No spaces before or after

❌ **Token expired**
- GitHub tokens can expire (check expiration date)
- Regenerate if expired

❌ **Wrong scope in Netlify**
- Must be set for "Production" scope
- Not just "Deploy Preview"

❌ **Typo in variable name**
- Must be exactly: `GITHUB_TOKEN` (case-sensitive)
- Not `GITHUB_API_TOKEN` or `GH_TOKEN`

❌ **Token without proper permissions**
- Needs "Contents: Read-only" and "Metadata: Read-only"
- For public repositories

## Testing Locally

To verify your token works before deploying:

```powershell
# Test the token directly
$token = "github_pat_YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    messages = @(
        @{
            role = "user"
            content = "Hello"
        }
    )
    model = "gpt-4o"
    max_tokens = 100
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://models.inference.ai.azure.com/chat/completions" -Method POST -Headers $headers -Body $body
```

**Expected:** JSON response with AI completion
**Error 401:** Token is invalid

## Need Help?

If you've followed all steps and still get errors:
1. Regenerate a completely new token
2. Delete the old GITHUB_TOKEN from Netlify
3. Add the new token with fresh variable
4. Clear browser cache and try again

## Related Files
- `netlify/functions/github-models.js` - Netlify Function that uses the token
- `NETLIFY-SETUP-GITHUB-MODELS.md` - Initial setup guide
- `GITHUB_MODELS_SETUP.md` - GitHub Models API documentation
