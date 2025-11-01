# 🗄️ Supabase Cloud Setup (5 Minutes)

Your site is deployed at: **https://holiday-draw-names.netlify.app** ✅

Now you need a cloud database to make it work!

---

## 🚀 Quick Setup Steps

### 1. Create Supabase Project (2 minutes)

**Visit**: https://supabase.com

**Sign in** with your GitHub account (Mreoch1)

**Click "New Project"**:
- **Organization**: Mreoch1's Org
- **Name**: holiday-draw-names
- **Database Password**: (create a strong password - **SAVE IT!**)
- **Region**: East US (closest to you)

**Click "Create new project"**

**Wait ~2 minutes** for setup to complete

---

### 2. Run Database Migrations (1 minute)

Once your project is ready:

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. **Open this file on your computer**:
   `/Users/michaelreoch/secret-santa/supabase/migrations/20250102000000_auth_system.sql`
4. **Copy ALL the contents**
5. **Paste** into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. Wait for success messages ✅

**Your database is now set up!**

---

### 3. Get Your Credentials (30 seconds)

1. Click **Settings** (gear icon) in left sidebar
2. Click **API**
3. You'll see:
   - **Project URL**: https://xxxxx.supabase.co
   - **anon public**: eyJhbGc... (long key)

**Copy both of these!**

---

### 4. Update config-production.js (1 minute)

Open `/Users/michaelreoch/secret-santa/config-production.js` and replace:

**Line 9:** Replace `YOUR_PRODUCTION_SUPABASE_URL` with your Project URL

**Line 14:** Replace `YOUR_PRODUCTION_SUPABASE_ANON_KEY` with your anon key

**Save the file!**

Then rename it to be the main config:
```bash
cd /Users/michaelreoch/secret-santa
mv config.js config-local.js
mv config-production.js config.js
git add config.js
git commit -m "Update config for production"
```

---

### 5. Redeploy to Netlify (30 seconds)

```bash
cd /Users/michaelreoch/secret-santa
netlify deploy --prod
```

---

### 6. Update Supabase Auth Settings (30 seconds)

Back in Supabase Dashboard:

1. Click **Authentication** in left sidebar
2. Click **URL Configuration**
3. Update:
   - **Site URL**: `https://holiday-draw-names.netlify.app`
   - **Redirect URLs**: `https://holiday-draw-names.netlify.app/**`
4. Click **Save**

---

## ✅ DONE! Your Site is Fully Live!

Visit: **https://holiday-draw-names.netlify.app**

Everything now works:
- ✅ Sign up / Sign in
- ✅ Create groups
- ✅ Send email invites
- ✅ Draw names
- ✅ See assignments
- ✅ Multi-group support
- ✅ Real-time updates

---

## 🎯 Quick Reference

**Your URLs:**
- Live Site: https://holiday-draw-names.netlify.app
- Netlify Dashboard: https://app.netlify.com/projects/holiday-draw-names
- Supabase Dashboard: (create at supabase.com)

**Your Account:**
- Netlify: mreoch82@hotmail.com (Mreoch82 team)
- GitHub: Mreoch1
- Supabase: (will use GitHub Mreoch1)

---

## 🎁 Ready to Share!

Once Supabase is set up, share with your family:

**Send them:**
```
🎅 Join our Secret Santa!

Visit: https://holiday-draw-names.netlify.app

Create an account and I'll send you the group code!
```

---

**Total time to complete Supabase setup: 5 minutes**

**Follow the steps above and your Secret Santa will be 100% live!** 🎄🎅✨

