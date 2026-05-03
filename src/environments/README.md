# Environment Configuration

## 🔐 Local Setup (NOT committed to git)

After cloning the repository, you need to add your API keys locally:

### 1. Add Your GitHub Token (for AI features)

Open `src/environments/environment.ts` and add your GitHub token:

```typescript
github: {
  token: 'ghp_YOUR_TOKEN_HERE',  // Get from https://github.com/settings/tokens
  model: 'gpt-4o'
}
```

**How to get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it "Portfolio IQ AI"
4. Check **only** `read:user` scope
5. Generate and copy the token

### 2. The File is Protected

The `environment.ts` file is marked with `git update-index --assume-unchanged`, which means:
- ✅ Your local changes (API keys) **won't be committed**
- ✅ Git will ignore your modifications
- ✅ Safe to add your tokens locally

### 3. Production Environment

`environment.prod.ts` is committed with **empty tokens** - this is correct!
Users will add their tokens via the Settings page in the deployed app.

## 🚫 Never Commit API Keys

The following files should **NEVER** have real API keys committed:
- ❌ `environment.ts` - Marked as assume-unchanged
- ❌ `environment.prod.ts` - Should always have empty strings

## ✅ What IS Safe to Commit

- ✅ Supabase publishable key (starts with `sb_publishable_`) - This is public
- ✅ Supabase URL - This is public
- ✅ Configuration structure and comments

## 🔄 Reset Environment File Tracking

If you need to commit changes to the environment file structure:

```bash
# Temporarily track changes
git update-index --no-assume-unchanged src/environments/environment.ts

# Make your structural changes (DO NOT add API keys!)

# Commit the structure
git add src/environments/environment.ts
git commit -m "Update environment structure"

# Protect it again
git update-index --assume-unchanged src/environments/environment.ts
```

## 📝 Quick Reference

| File | Status | Contains |
|------|--------|----------|
| `environment.ts` | ⚠️ Assume-unchanged | Your local dev tokens |
| `environment.prod.ts` | ✅ Tracked | Empty placeholders |
| `README.md` | ✅ Tracked | This guide |
