# 🚀 YOUR SECRET SANTA IS READY TO DEPLOY!

## Quick Deploy Commands

Run these commands in your terminal:

### Step 1: Deploy to Netlify

```bash
cd /Users/michaelreoch/secret-santa

# Initialize and deploy (will ask you a few questions)
netlify init
```

**When prompted, choose:**
- What would you like to do? → **Create & configure a new site**
- Team: → **Mreoch82**
- Site name: → **secret-santa-recon** (or your choice)
- Build command: → **(leave empty, just press Enter)**
- Directory to deploy: → **.** (just press Enter)

Then it will deploy automatically!

### Step 2: Set Environment Variable

```bash
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
```

### Step 3: Deploy to Production

```bash
netlify deploy --prod
```

You'll get a URL like: **https://secret-santa-recon.netlify.app**

---

## 📝 After First Deployment

Your site is live but needs Supabase! Here's the 5-minute setup:

### Create Supabase Cloud (Web Interface)

**Why web interface?** Supabase CLI needs interactive login. Easier to use dashboard!

1. **Visit**: https://supabase.com
2. **Sign in** with GitHub (Mreoch1 account)
3. **New Project**:
   - Organization: **Mreoch1's Org**
   - Name: **secret-santa**
   - Password: (create and SAVE IT!)
   - Region: **East US**
4. **Wait 2 minutes** for setup

### Run Migrations

1. In Supabase → **SQL Editor**
2. Copy from: `supabase/migrations/20250102000000_auth_system.sql`
3. Paste and **Run**
4. ✅ Tables created!

### Get Credentials

1. **Settings** → **API**
2. Copy:
   - Project URL
   - anon public key

### Update Config

Edit `config.js` and replace:
```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### Redeploy

```bash
netlify deploy --prod
```

### Update Supabase Auth URLs

1. Supabase → **Authentication** → **URL Configuration**
2. Set:
   - Site URL: `https://secret-santa-recon.netlify.app`
   - Redirect URLs: `https://secret-santa-recon.netlify.app/**`

---

## ✅ DONE! Your Site is Live!

Visit your Netlify URL and everything works:
- ✅ Sign up/Sign in
- ✅ Create groups
- ✅ Send email invites
- ✅ Draw names
- ✅ See assignments

---

## 🎁 What's Deployed

- All HTML/CSS/JS files
- Netlify Function for emails
- Christmas music
- Complete authentication system
- Multi-group support
- Email invitation system

---

## 🚀 Ready to Go?

**Run these 3 commands:**

```bash
cd /Users/michaelreoch/secret-santa
netlify init
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
netlify deploy --prod
```

**Then create Supabase cloud project and update config!**

🎅🎄 Let's get this live!

