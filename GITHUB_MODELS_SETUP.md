# GitHub Models Setup Guide

## ✅ What You Get (100% FREE!)

GitHub Models provides **free access** to powerful AI models for testing:
- **GPT-4o** (Recommended) - Latest and most capable
- **GPT-4** - Proven performance
- **GPT-4o-mini** - Fast and efficient

Perfect for local development and testing - **NO CREDIT CARD REQUIRED!**

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your GitHub Token

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Portfolio IQ AI Testing`
4. **Select scopes**: Check **`read:user`** (that's all you need)
5. Click **"Generate token"**
6. **COPY THE TOKEN** - it starts with `ghp_...`
   - ⚠️ Save it somewhere safe - you can't see it again!

### Step 2: Add Token to Your App

Open: `src/environments/environment.ts`

Replace this line:
```typescript
token: '',  // Put your GitHub token here
```

With your actual token:
```typescript
token: 'ghp_YOUR_TOKEN_HERE',  // Your GitHub token
```

### Step 3: Restart the Server

If the server is running, restart it to pick up the changes:

```bash
# Stop the running server (Ctrl+C)
# Then start again:
npm start
```

**That's it!** The AI features will now work with GitHub Models.

---

## 🎯 How to Use

### In the App:

1. **Login** to Portfolio IQ
2. **View any startup** details
3. Click the **AI tabs**:
   - 📊 **Analysis** - Investment readiness analysis
   - 📈 **Market Intel** - Market opportunities & threats
   - 🎯 **Action Plan** - 90-day roadmap
   - 💰 **Valuation** - Estimated valuation range
   - 🏛 **Schemes** - Government funding schemes

### The AI will generate insights using GitHub Models (GPT-4o)!

---

## ⚙️ Configuration Options

### Switch AI Provider

In `environment.ts`, change the provider:

```typescript
ai: {
  provider: 'github',  // or 'claude' if you have Claude credits
  // ...
}
```

### Change Model

You can use different models:

```typescript
github: {
  token: 'ghp_...',
  model: 'gpt-4o'  // Options: 'gpt-4o', 'gpt-4', 'gpt-4o-mini'
}
```

**Recommended**: `gpt-4o` - Best quality and speed balance

---

## 🔍 Troubleshooting

### Error: "Unauthorized" or "Invalid token"

**Solution**: 
1. Check your token is correct in `environment.ts`
2. Make sure you copied the entire token (starts with `ghp_`)
3. Token must have `read:user` scope
4. Restart the dev server after changing token

### Error: "Failed to fetch" or "Network error"

**Solution**:
1. Check your internet connection
2. Make sure the dev server is running with proxy: `npm start`
3. Check browser console (F12) for detailed errors

### AI responses are slow

**Solution**:
- GPT-4o is usually fast (~2-3 seconds)
- Try `gpt-4o-mini` for faster responses
- Check your network connection

### Still having issues?

1. Open browser console (F12)
2. Look for detailed error messages
3. Check the Network tab to see the exact API request/response

---

## 📊 Rate Limits

GitHub Models has generous **free tier limits**:
- **Requests per minute**: 15
- **Requests per day**: 150
- **Tokens per request**: 8,000

**More than enough for testing and development!**

---

## 🔐 Security Notes

### Development (Local):
- Token is stored in `environment.ts` (git ignored)
- Never commit your token to git
- Token is only used in your browser

### Production:
- Tokens should be set via the Settings page
- Stored in browser localStorage only
- Not sent to any server except GitHub Models API

---

## 💡 Pro Tips

1. **Test Different Models**:
   - `gpt-4o` - Best for complex analysis
   - `gpt-4o-mini` - Faster, good for quick insights

2. **Save Your Token**:
   - Keep it in a password manager
   - You'll need it if you clear browser data

3. **Monitor Usage**:
   - Check GitHub Models dashboard at https://github.com/marketplace/models

4. **Development Workflow**:
   - Use GitHub Models for free testing
   - Switch to Claude in production if needed

---

## 🎓 Learn More

- **GitHub Models Docs**: https://docs.github.com/en/copilot/github-copilot-in-the-cli/using-github-copilot-in-the-cli
- **Available Models**: https://github.com/marketplace/models
- **API Reference**: https://docs.github.com/en/rest

---

## ✨ What's Different from Claude?

| Feature | GitHub Models | Claude |
|---------|--------------|--------|
| **Cost** | ✅ FREE | 💰 Paid credits |
| **Setup** | GitHub token only | API key + billing |
| **Models** | GPT-4o, GPT-4 | Claude 3.5 Sonnet |
| **Rate Limits** | 150 requests/day | Based on credits |
| **Best For** | Testing, Development | Production |

---

**You're all set!** Enjoy free AI-powered startup insights with GitHub Models. 🚀
