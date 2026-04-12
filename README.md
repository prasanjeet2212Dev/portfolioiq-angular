# PortfolioIQ Angular — Incubator Intelligence Platform

The complete rewrite of PortfolioIQ in Angular with full feature parity to the vanilla JS version.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase

Open `src/app/services/supabase.service.ts` and update:
```typescript
const url = 'your-supabase-url';   // https://xxx.supabase.co
const key = 'your-supabase-key';   // sb_publishable_...
```

### 3. Run Development Server
```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### 4. Build for Production
```bash
npm run build
```

Build artifacts will be stored in `dist/portfolioiq-angular/`.

## Features

- ✅ **Multi-Institution Auth** — Institution code + passcode login
- ✅ **Portfolio Dashboard** — KPIs, stage distribution, runway alerts
- ✅ **Investment Readiness Scoring** — IR score 0–100
- ✅ **Market Potential Scoring** — MP score 0–100
- ✅ **Claude AI Integration** — Analysis, market intel, valuations, schemes
- ✅ **Supabase Real-Time** — Live portfolio updates
- ✅ **Mobile Responsive** — Full mobile support
- ✅ **Dark Theme** — Modern UI

## Deployment to Netlify

### Option 1: Git Integration (Recommended)
1. Push this repo to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist/portfolioiq-angular`
5. Click Deploy

### Option 2: Drag & Drop
1. Build: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag `dist/portfolioiq-angular` folder onto your site


