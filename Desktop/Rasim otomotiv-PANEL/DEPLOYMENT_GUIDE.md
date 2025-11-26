# 🚀 Rasim Otomotiv Panel - Production Deployment Guide

Complete guide for deploying your application **100% FREE** with custom domain support.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Database Setup](#supabase-database-setup)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Custom Domain Configuration](#custom-domain-configuration)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment Steps](#post-deployment-steps)

---

## 🎯 Prerequisites

Create free accounts on these platforms:
- ✅ [Supabase](https://supabase.com) - PostgreSQL Database
- ✅ [Railway](https://railway.app) - Backend NestJS API (Free: $5 credit/month)
- ✅ [Vercel](https://vercel.com) - Frontend React App (100% Free)
- ✅ Domain provider (optional - Freenom, Hostinger, Cloudflare)

---

## 🗄️ Supabase Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `rasim-otomotiv-panel`
   - **Database Password**: Generate strong password (SAVE THIS!)
   - **Region**: Choose closest to Turkey (Europe West - Frankfurt)
4. Wait 2-3 minutes for project creation

### Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content from `backend/supabase-schema-fixed.sql`
4. Paste and click **"Run"**
5. Verify tables created: Go to **Table Editor** → Should see `users`, `customers`, `vehicles`, `sales`, `services`

### Step 3: Get Database Credentials

Go to **Settings** → **API** and copy:
- ✅ `Project URL` (like: https://xxxxx.supabase.co)
- ✅ `anon/public key` (starts with "eyJh...")
- ✅ `service_role key` (starts with "eyJh..." - **KEEP SECRET!**)

Go to **Settings** → **Database** and copy:
- ✅ `Connection String` (starts with "postgresql://")

**⚠️ IMPORTANT**: Save all these values - you'll need them for backend deployment!

---

## 🚂 Backend Deployment (Railway)

Railway gives you $5 free credit per month (enough for hobby projects).

### Step 1: Prepare Repository

1. Make sure your code is pushed to GitHub:
```bash
cd /Users/bma/Desktop/Rasim\ otomotiv-PANEL
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Deploy to Railway

1. Go to [Railway Dashboard](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your repository: `Rasim otomotiv-PANEL`
4. Railway will detect your project structure
5. Click **"Add variables"** and configure (see Environment Variables section below)

### Step 3: Configure Backend Service

1. Railway will auto-detect the NestJS app
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm run start:prod`
5. Click **"Deploy"**

### Step 4: Get Backend URL

1. After deployment, go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your backend URL (like: `https://your-app.up.railway.app`)
4. **SAVE THIS URL** - you'll need it for frontend!

---

## ⚡ Frontend Deployment (Vercel)

Vercel is 100% free for personal projects with unlimited bandwidth.

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Project"**
3. Import from GitHub: Select your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Configure Environment Variables

Click **"Environment Variables"** and add:

```env
VITE_API_URL=https://your-backend-url.up.railway.app
```

Replace with your actual Railway backend URL!

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel will give you a URL: `https://your-app.vercel.app`

---

## 🌐 Custom Domain Configuration

### Option A: Free Domain (Freenom)

1. Go to [Freenom](https://www.freenom.com)
2. Search for available domain (`.tk`, `.ml`, `.ga`, `.cf`, `.gq` are free)
3. Register domain (12 months free)
4. In Freenom → **My Domains** → **Manage Domain** → **Management Tools** → **Nameservers**
5. Select **"Use custom nameservers"**

### Option B: Paid Domain (Recommended)

Buy from: Hostinger, Namecheap, GoDaddy, Cloudflare Registrar

### Configure Domain for Vercel (Frontend)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain: `example.com` and `www.example.com`
3. Vercel will show DNS records to add
4. In your domain provider's DNS settings, add:

```
Type  | Name  | Value
------|-------|---------------------------
A     | @     | 76.76.21.21
CNAME | www   | cname.vercel-dns.com
```

5. Wait 5-60 minutes for DNS propagation

### Configure Subdomain for Backend (Railway)

1. In Railway Dashboard → **Settings** → **Networking** → **Custom Domain**
2. Add subdomain: `api.example.com`
3. Railway will show CNAME record
4. In your domain provider's DNS, add:

```
Type  | Name | Value
------|------|---------------------------
CNAME | api  | your-app.up.railway.app
```

### Update Frontend Environment

After custom domain is live, update Vercel environment variable:

```env
VITE_API_URL=https://api.example.com
```

Then redeploy in Vercel!

---

## 🔐 Environment Variables

### Backend (Railway)

```env
# Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh... [YOUR-SERVICE-ROLE-KEY]

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# CORS (Important!)
FRONTEND_URL=https://your-app.vercel.app

# Email (Optional - for now uses mock)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@rasimotomotiv.com

# Environment
NODE_ENV=production
PORT=3007
```

### Frontend (Vercel)

```env
VITE_API_URL=https://your-backend.up.railway.app
```

**After custom domain:**
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## ✅ Post-Deployment Steps

### 1. Create Admin User

After backend is deployed, create your admin account:

**Option A: Using Railway CLI**
```bash
railway run node backend/create-admin.js
```

**Option B: Directly in Supabase**
1. Go to Supabase → **Table Editor** → `users`
2. Click **"Insert row"**
3. Fill:
   - `email`: admin@rasimotomotiv.com
   - `password`: (hash your password using bcrypt - see below)
   - `first_name`: Admin
   - `last_name`: User
   - `role`: admin
   - `is_active`: true

Generate password hash:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash));"
```

### 2. Test the Application

1. Visit your frontend URL: `https://your-app.vercel.app`
2. Try to register a new user (should show pending approval)
3. Login with admin account
4. Approve the pending user
5. Test all features

### 3. Enable HTTPS (Automatic)

Both Vercel and Railway automatically provide SSL certificates. Your app will be HTTPS by default!

### 4. Monitor Application

**Railway Backend Monitoring:**
- View logs: Railway Dashboard → Your service → **Logs**
- View metrics: **Metrics** tab
- Set up alerts: **Settings** → **Alerts**

**Vercel Frontend Monitoring:**
- View deployments: Vercel Dashboard → Your project
- View analytics: **Analytics** tab
- View logs: Click any deployment → **Logs**

### 5. Configure Email (Optional)

For production emails (user registration notifications):

1. Create Gmail App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

2. Update Railway environment variables:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@rasimotomotiv.com
```

3. Restart Railway service

---

## 🎉 Deployment Checklist

Use this checklist to ensure everything is configured:

### Database
- [ ] Supabase project created
- [ ] Database schema applied (`supabase-schema-fixed.sql`)
- [ ] Database credentials saved
- [ ] RLS policies enabled

### Backend
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Backend URL obtained
- [ ] Health check endpoint working: `https://your-backend.up.railway.app/`

### Frontend
- [ ] Vercel project created
- [ ] Environment variables configured (with backend URL)
- [ ] Frontend deployed successfully
- [ ] Can access frontend URL
- [ ] API calls working

### Domain (Optional)
- [ ] Domain purchased/registered
- [ ] DNS records added for frontend
- [ ] DNS records added for backend API
- [ ] SSL certificates active (automatic)
- [ ] Environment variables updated with custom domain

### Security
- [ ] JWT_SECRET is strong and unique
- [ ] SUPABASE_SERVICE_ROLE_KEY is kept secret
- [ ] CORS configured with correct frontend URL
- [ ] Admin user created

### Testing
- [ ] User registration works
- [ ] Pending approval page works
- [ ] Admin can approve users
- [ ] Login works
- [ ] Dashboard loads
- [ ] All features functional

---

## 🆘 Troubleshooting

### Backend Not Starting
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct
- Check Supabase project is running

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check backend is deployed and running
- Open browser console for error messages
- Verify CORS settings in backend

### Database Connection Failed
- Check DATABASE_URL format is correct
- Verify Supabase project is active
- Check RLS policies are configured
- Ensure service_role key is correct

### Domain Not Working
- Wait 30-60 minutes for DNS propagation
- Check DNS records are correct (use [WhatsMyDNS](https://www.whatsmydns.net))
- Verify nameservers are updated
- Clear browser cache

---

## 💰 Cost Breakdown

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| **Supabase** | 500MB database, 2GB bandwidth | $25/month (Pro) |
| **Railway** | $5 credit/month (~500 hours) | $20/month (Team) |
| **Vercel** | Unlimited (personal use) | $20/month (Pro) |
| **Domain** | Free (.tk/.ml) or $10-15/year | - |

**Total**: **$0-15/year** for hobby use!

---

## 🚀 Quick Deploy Commands

Save these for future deployments:

```bash
# Update and deploy
git add .
git commit -m "Update: [description]"
git push origin main

# Railway auto-deploys on push
# Vercel auto-deploys on push
```

---

## 📞 Support

If you encounter issues:
1. Check Railway logs
2. Check Vercel deployment logs
3. Check browser console
4. Verify all environment variables
5. Review this guide again

**Your app is now production-ready!** 🎊
