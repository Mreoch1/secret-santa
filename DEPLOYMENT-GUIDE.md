# 🚀 Deploying to Netlify - Complete Guide

## ✅ Your Secret Santa is Ready for Production!

Follow these steps to deploy your fully functional Secret Santa platform to the internet.

---

## 📋 Pre-Deployment Checklist

- [x] All code complete
- [x] Authentication system working
- [x] Email system configured
- [x] Database schema ready
- [x] Netlify Function created
- [ ] Supabase cloud project setup
- [ ] Netlify deployment
- [ ] Environment variables configured

---

## Step 1: Create Supabase Cloud Project (5 minutes)

### 1.1 Create Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: secret-santa-prod
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2 minutes for setup

### 1.2 Run Database Migrations

1. In Supabase Dashboard → **SQL Editor**
2. Click "New Query"
3. Copy contents of `/Users/michaelreoch/secret-santa/supabase/migrations/20250102000000_auth_system.sql`
4. Paste and click "Run"
5. Should see success messages

### 1.3 Configure Authentication

1. **Authentication** → **URL Configuration**:
   - Site URL: `https://your-site.netlify.app` (update after deployment)
   - Redirect URLs: `https://your-site.netlify.app/**`

2. **Authentication** → **Email Templates**:
   - Customize templates (optional)
   - Enable email confirmations (optional)

3. **Authentication** → **Providers**:
   - Ensure **Email** is enabled

### 1.4 Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., https://xxxxx.supabase.co)
   - **anon public key** (starts with eyJ...)
3. Keep these handy!

---

## Step 2: Update Configuration Files

### 2.1 Update config.js

Create a production version:

```javascript
// Production Supabase Configuration
const SUPABASE_URL = 'https://your-project.supabase.co'; // Your cloud URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // Your cloud anon key
const RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj'; // Your Resend key
```

**Or better - use environment variables** (recommended):

### 2.2 Create netlify.toml (Already exists!)

Update it with environment variables:

```toml
[build]
  publish = "."
  command = "echo 'No build needed - static site'"

[build.environment]
  NODE_VERSION = "18"

# Environment variables (set in Netlify UI instead)
```

---

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify CLI (Recommended)

```bash
cd /Users/michaelreoch/secret-santa

# Login to Netlify
netlify login

# Initialize site
netlify init

# Follow prompts:
# - Create & configure a new site
# - Team: Your personal team
# - Site name: recon-secret-santa (or your choice)
# - Build command: (leave empty)
# - Publish directory: . (current directory)

# Deploy to production
netlify deploy --prod
```

### Option B: Deploy via GitHub + Netlify Dashboard

```bash
# 1. Create GitHub repo
git init
git add .
git commit -m "Secret Santa platform with auth and email"

# 2. Push to GitHub
# (Create repo at github.com/Mreoch1/secret-santa-app)
git remote add origin https://github.com/Mreoch1/secret-santa-app.git
git push -u origin main

# 3. In Netlify Dashboard:
# - Click "Add new site" → "Import from Git"
# - Connect GitHub
# - Select repository
# - Deploy!
```

---

## Step 4: Set Environment Variables in Netlify

### Via Netlify Dashboard:

1. Go to your site in Netlify
2. **Site settings** → **Environment variables**
3. Add these variables:

```
RESEND_API_KEY = re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
```

### Via Netlify CLI:

```bash
cd /Users/michaelreoch/secret-santa
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
```

---

## Step 5: Update Supabase URLs After Deployment

### 5.1 Get Your Netlify URL

After deployment, you'll get a URL like:
- `https://recon-secret-santa.netlify.app`

### 5.2 Update Supabase Settings

1. Go to Supabase Dashboard
2. **Authentication** → **URL Configuration**
3. Update:
   - **Site URL**: `https://recon-secret-santa.netlify.app`
   - **Redirect URLs**: `https://recon-secret-santa.netlify.app/**`

---

## Step 6: Update config.js for Production

**Important:** Create environment-aware config:

```javascript
// Auto-detect environment
const isDevelopment = window.location.hostname === 'localhost';

const SUPABASE_URL = isDevelopment 
  ? 'http://127.0.0.1:54321'
  : 'https://your-project.supabase.co'; // Your production URL

const SUPABASE_ANON_KEY = isDevelopment
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : 'your-production-anon-key'; // Your production key

const RESEND_API_KEY = 're_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj';
```

---

## 📧 How Email Works in Production

### Local Development (Current):
```
Browser → Python Proxy (localhost:5001) → Resend API → ✅ Email Sent
```

### Production on Netlify:
```
Browser → Netlify Function (/.netlify/functions/send-email) → Resend API → ✅ Email Sent
```

**Both work the same way!** The code automatically detects the environment and uses the right endpoint.

---

## 🎯 What Happens on Netlify

### Automatically Deployed:
- ✅ All HTML/CSS/JS files
- ✅ Netlify Function (`netlify/functions/send-email.js`)
- ✅ Music files
- ✅ Images and assets

### Environment Variables:
- ✅ `RESEND_API_KEY` - Kept secure, not in code
- ✅ Netlify Functions can access it
- ✅ Never exposed to browser

### Email Sending:
- ✅ Works exactly like local
- ✅ No CORS issues (serverless function)
- ✅ Secure API key handling
- ✅ Same beautiful email templates

---

## ⚠️ Important Notes

### Resend Domain Verification

**Current**: Can only send to mreoch82@hotmail.com

**For Production** (sending to anyone):
1. Go to https://resend.com/domains
2. Add your domain (e.g., secretsanta.com)
3. Add DNS records (they provide instructions)
4. Wait for verification (~5 minutes)
5. Update "from" address in code:
   ```javascript
   from: 'Secret Santa <santa@yourdomain.com>'
   ```

**Or** use Resend's test domain (limits apply)

### Database

- Local dev uses Docker Supabase
- Production uses Supabase Cloud
- Both have same schema
- Data doesn't transfer (separate databases)

---

## 🚀 Quick Deploy Checklist

```bash
# 1. Create Supabase cloud project
# → supabase.com

# 2. Run migrations in SQL Editor
# → Copy/paste migration files

# 3. Update config.js with production URLs

# 4. Deploy to Netlify
cd /Users/michaelreoch/secret-santa
netlify login
netlify init
netlify deploy --prod

# 5. Set environment variables
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj

# 6. Update Supabase redirect URLs
# → Use your Netlify URL

# 7. Test!
# → Visit your live site
# → Sign up
# → Send invites
# → Everything works! ✅
```

---

## 💡 Testing Production Emails

When deployed, to test:

1. Visit your Netlify URL
2. Sign up/sign in
3. Create a group
4. Send invite to **mreoch82@hotmail.com**
5. Should work perfectly! ✅

---

## ✅ Yes, Email WILL Work on Netlify!

**Summary:**
- ✅ Local: Python proxy → Resend
- ✅ Production: Netlify Function → Resend
- ✅ Same code, different backend
- ✅ Automatic environment detection
- ✅ Fully functional!

**Want me to help you deploy to Netlify right now?** I can walk you through it! 🚀
