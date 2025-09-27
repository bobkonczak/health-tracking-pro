# 🚀 Health Tracking Pro - Vercel Production Deployment Guide

## ✅ Pre-Deployment Complete
- [x] All code committed to git
- [x] Vercel CLI installed (v48.1.6)
- [x] Environment variables configured locally
- [x] Database connectivity tested
- [x] Build successful

## 🔧 Quick Deployment Steps

### 1. Authenticate with Vercel
```bash
vercel login
```
**Note**: Visit the OAuth URL provided and complete authentication in browser.

### 2. Deploy to Production
```bash
vercel --prod
```

**Answer the prompts:**
- Link to existing project? **N**
- Project name: **health-tracking-pro**
- Directory: **./** (current directory)
- Override settings? **N**

### 3. Configure Environment Variables

After initial deployment, add these environment variables in the Vercel dashboard:

**Go to**: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://qbktlaoycqvncwwfhmud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia3RsYW95Y3F2bmN3d2ZobXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NzIxMDcsImV4cCI6MjA3NDU0ODEwN30.AxYRPNZ5bqG0s5PLsEux-SDLOQR6vnXya-dpxezj0z8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFia3RsYW95Y3F2bmN3d2ZobXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk3MjEwNywiZXhwIjoyMDc0NTQ4MTA3fQ.FTf8JgfgSIIBC-P0_P2daXOiNt6gu3g85Wn9RnPYAN0
HEALTH_WEBHOOK_SECRET=health-tracking-pro-secret-2024
```

**Set scope for each variable:** Production, Preview, Development

### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

This will redeploy the app with the environment variables loaded.

## 🎯 Expected Results

**Production URL**: `https://health-tracking-pro-[unique-id].vercel.app`

**Features Working:**
- ✅ Dashboard with real-time competition data
- ✅ User-specific checklists (Bob & Paula)
- ✅ Database connectivity monitoring
- ✅ API endpoints for health data
- ✅ Error handling with offline fallback

**API Endpoints Available:**
- `GET /api/health` - Database health check
- `POST /api/checklist` - Save daily checklist
- `POST /api/health-data` - iOS Health webhook
- `GET /api/export` - Data export

## 🔧 Troubleshooting

### If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Ensure database schema is created in Supabase

### If app shows loading forever:
1. Check browser console for errors
2. Verify Supabase environment variables
3. Test `/api/health` endpoint

### If database connection fails:
1. Verify Supabase credentials in environment variables
2. Check Supabase project is active
3. Ensure database schema is properly created

## 📊 Testing Production

After deployment, test these URLs:
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Dashboard
curl https://your-app.vercel.app/

# Checklist API
curl -X POST https://your-app.vercel.app/api/checklist \
  -H "Content-Type: application/json" \
  -d '{"user":"Bob","date":"2025-09-27","checklist":{"noSugar":true},"dailyPoints":1,"totalPoints":1,"streak":1}'
```

## 🚀 Next Steps After Deployment

1. **Share the production URL** with users
2. **Set up iOS Health shortcuts** using the production webhook URL
3. **Configure Pipedream workflows** to use production endpoints
4. **Monitor performance** in Vercel dashboard
5. **Set up custom domain** if needed

---

## 📋 Deployment Checklist

- [ ] Complete Vercel authentication
- [ ] Run `vercel --prod` deployment
- [ ] Add environment variables in Vercel dashboard
- [ ] Redeploy to pick up environment variables
- [ ] Test production URL functionality
- [ ] Verify database connectivity
- [ ] Test API endpoints
- [ ] Share production URL

**Estimated deployment time: 3-5 minutes**