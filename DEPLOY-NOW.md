# 🚀 Deploy to Netlify - Quick Guide

## Option 1: Run the Deploy Script (Easiest)

I've created a deployment script that handles everything:

```bash
cd /Users/michaelreoch/secret-santa
./deploy.sh
```

This will:
1. ✅ Check Netlify CLI
2. ✅ Initialize your site (you'll choose team and name)
3. ✅ Set environment variables
4. ✅ Deploy to production

**Just run the script and follow the prompts!**

---

## Option 2: Manual Deployment (Step by Step)

### Step 1: Initialize Site

```bash
cd /Users/michaelreoch/secret-santa
netlify init
```

**Prompts you'll see:**
- What would you like to do? → **Create & configure a new site**
- Team: → **Mreoch82** (your team)
- Site name: → **secret-santa-recon** (or your choice)
- Your build command: → **(leave empty, press Enter)**
- Directory to deploy: → **.** (current directory)

### Step 2: Set Environment Variable

```bash
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
```

### Step 3: Deploy

```bash
netlify deploy --prod
```

### Step 4: Get Your URL

After deployment, you'll see:
```
✅ Deploy is live!
Website URL: https://secret-santa-recon.netlify.app
```

---

## 📝 After Deployment: Set Up Supabase Cloud

Your site will be live but needs a database. Here's what to do:

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign in with GitHub (use Mreoch1 account)
3. Click "New Project"
4. Fill in:
   - **Organization**: Mreoch1's Org
   - **Name**: secret-santa
   - **Database Password**: (create and save it!)
   - **Region**: East US (closest to you)
5. Click "Create new project"
6. Wait 2 minutes

### 2. Run Database Migrations

1. In your Supabase project → **SQL Editor**
2. Click "New Query"
3. Open `/Users/michaelreoch/secret-santa/supabase/migrations/20250102000000_auth_system.sql`
4. Copy ALL contents
5. Paste in SQL Editor
6. Click "Run"
7. Wait for success messages

### 3. Get Your Credentials

1. **Settings** → **API**
2. Copy:
   - **Project URL**: https://xxxxx.supabase.co
   - **anon public** key: eyJhbGc...

### 4. Update config.js

Replace in `config-production.js`:
- `YOUR_PRODUCTION_SUPABASE_URL` → your Project URL
- `YOUR_PRODUCTION_SUPABASE_ANON_KEY` → your anon key

### 5. Use Production Config

Rename files:
```bash
mv config.js config-local.js
mv config-production.js config.js
```

### 6. Redeploy

```bash
netlify deploy --prod
```

### 7. Update Supabase Settings

1. In Supabase → **Authentication** → **URL Configuration**
2. Set:
   - **Site URL**: https://secret-santa-recon.netlify.app
   - **Redirect URLs**: https://secret-santa-recon.netlify.app/**

---

## ✅ Then Everything Works!

- ✅ Authentication
- ✅ Database
- ✅ Groups
- ✅ **Email invitations**
- ✅ Secret Santa draws
- ✅ All features!

---

## 🎯 Quick Summary

**Yes, email will work on Netlify!**

**Steps:**
1. Run `./deploy.sh` or `netlify init` + `netlify deploy --prod`
2. Create Supabase cloud project
3. Run migrations
4. Update config with production URLs
5. Redeploy
6. Done! ✅

**The email system is already configured to work in production with Netlify Functions!**

---

Want me to walk you through the deployment now? Just say the word! 🚀🎅
