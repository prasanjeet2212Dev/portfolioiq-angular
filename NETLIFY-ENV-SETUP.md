# Netlify Environment Variables Setup

## 🔐 GitHub Token Configuration for Production

For production deployment, configure the GitHub token as an environment variable in Netlify so all users can access AI features automatically.

---

## 📋 **Step-by-Step Guide**

### 1. **Get Your GitHub Token**

Visit: https://github.com/settings/tokens

1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. Configure:
   - **Note**: `PortfolioIQ Production`
   - **Expiration**: `No expiration` (or your preference)
   - **Scopes**: Select `repo` ✅
3. Click **"Generate token"**
4. **Copy the token** (starts with `ghp_`)

---

### 2. **Add to Netlify Environment Variables**

#### **Option A: Via Netlify Dashboard** (Recommended)

1. Go to your Netlify site: https://app.netlify.com
2. Select your **PortfolioIQ** site
3. Navigate to: **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add the following:

```
Key:   GITHUB_TOKEN
Value: ghp_your_actual_token_here
```

6. Select scopes:
   - ✅ **All scopes** (or select specific deploy contexts)
7. Click **"Create variable"**

#### **Option B: Via Netlify CLI**

```bash
# Login to Netlify
netlify login

# Link to your site (if not already)
netlify link

# Set environment variable
netlify env:set GITHUB_TOKEN ghp_your_actual_token_here
```

---

### 3. **Update Angular Environment File**

The token will be available at **build time** in Netlify. You need to inject it into your Angular environment.

#### **Update `netlify.toml`**:

```toml
[build]
  command = "npm run build:prod"
  publish = "dist/portfolioiq-angular"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  # GitHub token will be injected from environment variables
  VITE_GITHUB_TOKEN = "${GITHUB_TOKEN}"
```

#### **Update `src/environments/environment.prod.ts`**:

Since Angular doesn't support runtime environment variables directly, the token should be configured in your build process or use the current approach where it's read from localStorage (admin) or hardcoded for production.

**Current Approach (Recommended):**
- Super Admin can configure token via Settings panel
- Token is stored in localStorage
- All users on that browser can use AI features

**Alternative Approach (Server-side):**
- Use Netlify Functions to proxy AI requests
- Keep token secret on server-side
- Users never see the token

---

### 4. **Redeploy Your Site**

After adding the environment variable:

```bash
# Via Git push
git push origin main

# Or trigger manual deploy in Netlify Dashboard
# Site settings → Deploys → Trigger deploy
```

---

## 🔍 **Verification**

### **Check Environment Variable**

In Netlify Dashboard:
1. Go to **Site settings** → **Environment variables**
2. You should see: `GITHUB_TOKEN` = `***************` (hidden)

### **Test in Production**

1. Visit your deployed site
2. Login as Super Admin
3. All AI features should work automatically
4. Regular users will use the configured token

---

## 🎯 **How It Works**

### **Token Priority Order:**

1. **Environment config** (Netlify env vars) - Production
2. **localStorage** (Super Admin configured) - Development/Testing
3. **No token** - AI features disabled

### **For Super Admin:**
- Can still configure token via **⚙ AI Settings** in sidebar
- Useful for testing different tokens

### **For Regular Users:**
- Token automatically loaded from environment
- No configuration needed
- AI features "just work"

---

## 🚨 **Security Best Practices**

1. ✅ **Never commit tokens to Git**
2. ✅ **Use Netlify environment variables for production**
3. ✅ **Rotate tokens regularly** (every 90 days)
4. ✅ **Use minimal required scopes** (only `repo`)
5. ✅ **Monitor token usage** in GitHub Settings
6. ⚠️ **Consider using Netlify Functions** to keep token server-side

---

## 🔄 **Token Rotation**

When rotating tokens:

1. Generate new GitHub token
2. Update Netlify environment variable
3. Redeploy site
4. Old token stops working automatically

---

## 🐛 **Troubleshooting**

### **AI Features Not Working**

1. Check environment variable exists:
   ```bash
   netlify env:list
   ```

2. Check browser console for errors:
   ```
   AI: Using GitHub token from environment config ✅
   ```

3. Verify token is valid in GitHub:
   - Go to https://github.com/settings/tokens
   - Check token hasn't expired

### **"No API key configured" Error**

- Token not set in Netlify environment variables
- Build didn't inject the token properly
- localStorage cleared (for admin-configured tokens)

**Solution:** Set `GITHUB_TOKEN` in Netlify and redeploy

---

## 📚 **Related Documentation**

- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [Angular Environment Configuration](https://angular.io/guide/build#configuring-application-environments)

---

## 💡 **Recommended Setup**

For production:
1. ✅ Set `GITHUB_TOKEN` in Netlify environment variables
2. ✅ Keep Super Admin Settings panel for testing
3. ✅ Regular users get automatic AI access
4. ✅ No user configuration needed

This provides the best user experience while maintaining security!
