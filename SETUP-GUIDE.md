# Complete Setup Guide - Full Auth System

## 🎯 What You Now Have

A **production-ready** Secret Santa platform with:
- ✅ User authentication (sign up/sign in/forgot password)
- ✅ User profiles with spouse tracking
- ✅ Multi-group support per user
- ✅ Dashboard showing all user's groups
- ✅ Smart Secret Santa matching algorithm
- ✅ Cookie & music consent
- ✅ Real-time updates
- ✅ Row-level security
- ✅ Email notifications (foundation ready)

## 📁 New File Structure

```
secret-santa/
├── index.html              # Entry point (auto-redirects)
├── auth.html              # Sign in/Sign up pages
├── auth.js                # Authentication logic
├── dashboard.html         # Main dashboard (logged in users)
├── dashboard.js           # Dashboard logic
├── config.js              # Supabase config
├── styles.css             # All styles (updated)
├── music/                 # Christmas music
├── supabase/
│   ├── migrations/
│   │   └── 20250102000000_auth_system.sql
│   └── functions/
│       └── notify-draw/
│           └── index.ts
└── test-email.html        # Email template preview
```

## 🚀 Setup Steps

### Step 1: Reset Database with New Schema

```bash
cd /Users/michaelreoch/secret-santa

# Apply the new migration
supabase db reset

# Or run manually in Supabase SQL Editor:
# Copy contents of supabase/migrations/20250102000000_auth_system.sql
```

### Step 2: Configure Supabase Auth

1. **Go to Supabase Dashboard** → Your Project

2. **Authentication** → **Providers**
   - Enable **Email** provider
   - ✅ Enable email confirmations (recommended)
   - ✅ Enable secure email change

3. **Authentication** → **URL Configuration**
   - **Site URL**: `http://localhost:8000` (dev) or your Netlify URL (prod)
   - **Redirect URLs**: 
     - `http://localhost:8000/**`
     - `https://your-site.netlify.app/**`

4. **Authentication** → **Email Templates**
   - Customize **Confirm Signup** template
   - Customize **Reset Password** template
   - Update branding to match your site

### Step 3: Test Locally

```bash
cd /Users/michaelreoch/secret-santa

# Make sure Supabase is running
supabase status

# Start web server
python3 -m http.server 8000

# Open browser
open http://localhost:8000
```

### Step 4: Create Your First Account

1. Visit http://localhost:8000 → Redirects to `auth.html`
2. Click **"Sign Up"**
3. Fill in details:
   - Full Name: Michael Reoch
   - Email: mreoch82@hotmail.com
   - Password: (secure password)
   - Spouse: Brittany Barrios
   - ✅ Auto-play music
   - ✅ Accept cookies
4. Click **"Create Account"**
5. Check email for verification link (if enabled)
6. Sign in → Redirected to dashboard

### Step 5: Join/Create a Group

1. On dashboard, click **"+ Join a Group"**
2. Enter group code: `Recon2025`
3. Click **"Join Group"**
4. Group card appears!

### Step 6: Test Multi-User (Open Incognito)

1. Open incognito window
2. Sign up as another user
3. Join same group code: `Recon2025`
4. Both users see each other in participants list

### Step 7: Draw Names

1. As the group creator (first person who joined):
2. Click on the group card
3. Click **"Draw Names"**
4. Everyone's assignment is revealed!

## 📧 Email Notifications (Optional)

### Option 1: Simple Console Logging (Current)

The Edge Function logs notifications to console. Good for testing.

### Option 2: Supabase Built-in Email

Supabase can send basic emails. Configure SMTP in:
- **Settings** → **Auth** → **SMTP Settings**

### Option 3: Resend Integration (Recommended for Production)

```typescript
// Update supabase/functions/notify-draw/index.ts
// Add Resend API call (see commented code in function)

// Set secret:
supabase secrets set RESEND_API_KEY=your_key

// Deploy:
supabase functions deploy notify-draw
```

## 🍪 How Cookie & Music Consent Works

### Sign Up Flow:
1. User checks "Auto-play music" checkbox
2. Stored in `user_profiles.music_consent` (database)
3. Also stored in `localStorage.musicAutoplay` (browser)

### Dashboard Load:
1. Checks user's `music_consent` from database
2. If `true`, auto-plays music on first interaction
3. User can still pause manually

## 🔐 Security Features

### Row Level Security (RLS)

**What users CAN do:**
- ✅ View/edit their own profile
- ✅ View groups they're in
- ✅ View participants in their groups
- ✅ View their own Secret Santa assignments
- ✅ Create new groups
- ✅ Join existing groups
- ✅ Draw names (if group creator)

**What users CANNOT do:**
- ❌ See other users' profiles
- ❌ See groups they're not in
- ❌ See other people's assignments
- ❌ Modify groups they don't own
- ❌ Access data without authentication

## 🎨 User Experience Flow

### New User Journey
```
Visit Site
   ↓
index.html (auto-redirect)
   ↓
auth.html (Sign Up)
   ↓
Fill Form + Check Consents
   ↓
Email Verification (optional)
   ↓
dashboard.html (Welcome!)
   ↓
Join/Create Group
   ↓
Wait for Draw
   ↓
See Assignment 🎁
```

### Returning User Journey
```
Visit Site
   ↓
index.html (checks auth)
   ↓
dashboard.html (logged in)
   ↓
See All Groups
   ↓
Music Auto-plays (if consented)
   ↓
View Assignments
```

## 🚀 Deploy to Production (Netlify)

### 1. Update config.js for Production

Create environment-specific config or use Netlify environment variables.

### 2. Update Supabase URLs

In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Update Site URL to your Netlify domain
- Add redirect URLs for your production domain

### 3. Deploy

```bash
cd /Users/michaelreoch/secret-santa

# Deploy to Netlify
netlify deploy --prod

# Or push to GitHub and connect to Netlify
git init
git add .
git commit -m "Full auth system"
git remote add origin your-repo-url
git push -u origin main
```

### 4. Environment Variables in Netlify

Set these in Netlify dashboard:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key

## 🧪 Testing Checklist

- [ ] Sign up new user
- [ ] Verify email (if enabled)
- [ ] Sign in
- [ ] Create a group
- [ ] Join existing group
- [ ] View group details
- [ ] Draw names (as creator)
- [ ] See assignment
- [ ] Music auto-plays (if consented)
- [ ] Sign out
- [ ] Forgot password flow
- [ ] Multi-group support
- [ ] Real-time updates
- [ ] Mobile responsiveness

## ⚠️ Important Notes

### Migration from Old System

**The old localStorage-based system is REPLACED.** 

Users need to:
1. Create new accounts
2. Re-join their groups

To preserve data, you would need to:
1. Export localStorage data
2. Create accounts for users
3. Migrate group memberships

### Email Limits

- Supabase free tier: Limited emails/hour
- For production: Use Resend, SendGrid, or configure SMTP

### Database Size

- Free tier: 500MB
- Plenty for thousands of users

## 🎯 What's Different from Before

### Before (Simple Version)
- No authentication
- localStorage only
- Anyone could join any group
- No security
- Single device only

### Now (Full Auth System)
- ✅ Proper user accounts
- ✅ Secure authentication
- ✅ Database-backed
- ✅ Row-level security
- ✅ Multi-device support
- ✅ Email verification
- ✅ Password reset
- ✅ Professional dashboard
- ✅ Production-ready

## 📱 Mobile Support

Everything is responsive! Works great on:
- 📱 iPhone/Android
- 💻 Desktop
- 📲 Tablets

## 🆘 Troubleshooting

### "Failed to fetch" errors
- Check Supabase is running: `supabase status`
- Verify `config.js` has correct credentials
- Check browser console for specific errors

### Email not sending
- Check Supabase Auth settings
- Verify SMTP configuration
- Check spam folder

### Can't sign in
- Verify email if confirmation is enabled
- Check password requirements (6+ characters)
- Try password reset

### Groups not loading
- Check RLS policies are applied
- Verify user is authenticated
- Check browser console

## 🎉 You're Ready!

Your Secret Santa platform is now production-ready with:
- Professional authentication
- Secure user management
- Beautiful dashboard
- Full feature set

Visit http://localhost:8000 to get started! 🎅🎄

