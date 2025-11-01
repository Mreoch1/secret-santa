# Authentication System Migration Guide

## 🎯 What's Changing

We're migrating from a simple localStorage-based system to a full Supabase Authentication system with proper user accounts, sign in/sign up, and a dashboard.

## ✅ What's Been Created

### 1. Database Schema Updates
- ✅ `user_profiles` table (stores user info like name, spouse, music consent)
- ✅ Updated `participants` to reference auth users
- ✅ Proper Row Level Security (RLS) policies
- ✅ User-based access control

### 2. New Pages
- ✅ `auth.html` - Sign In/Sign Up/Forgot Password pages
- ✅ `auth.js` - Authentication logic
- ✅ Updated CSS with auth and dashboard styles

### 3. Features Implemented
- ✅ Sign Up with full name, email, password, spouse name
- ✅ Sign In with email/password  
- ✅ Forgot Password functionality
- ✅ Music autoplay consent checkbox
- ✅ Cookie consent checkbox
- ✅ Password validation (minimum 6 characters)

## 🚀 Complete Migration Steps

### Step 1: Update Database Schema

```bash
cd /Users/michaelreoch/secret-santa

# Reset database with new schema
supabase db reset

# Or manually run the updated supabase-schema.sql in Supabase Studio
```

### Step 2: Enable Email in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Customize templates for:
   - Confirm Signup
   - Reset Password
   - Magic Link

4. Go to **Authentication** → **Providers**
5. Enable **Email** provider
6. Configure SMTP (or use Supabase's default)

### Step 3: Configure Auth Settings

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: `http://localhost:8000` (for dev)
- **Redirect URLs**: Add `http://localhost:8000/*`

### Step 4: Update File Structure

**Current Structure:**
```
index.html (main app with join form)
app.js (all logic)
```

**New Structure:**
```
auth.html (sign in/sign up pages) ← ENTRY POINT
auth.js (authentication logic)
index.html (dashboard for logged-in users)
dashboard.js (dashboard logic - TO BE CREATED)
```

### Step 5: Create Missing Files

#### A. Dashboard HTML (update index.html)

Replace current `index.html` with a proper dashboard that:
- Shows welcome message with user's name
- Displays all groups user is in (grid layout)
- Shows draw status for each group
- Shows Secret Santa assignment if draw is complete
- Has "Join New Group" button
- Has logout button

#### B. Dashboard JavaScript (dashboard.js)

Create new file that:
- Checks auth on load (redirect to auth.html if not logged in)
- Loads user profile from `user_profiles`  
- Fetches all groups user is in
- Displays group cards with status
- Handles joining new groups
- Implements draw functionality for group creators
- Auto-plays music if user gave consent

## 📧 Email Notifications via Supabase

### Option 1: Using Supabase Auth Hooks (Recommended)

Create a database trigger that sends email when draw happens:

```sql
-- Function to notify users of draw
CREATE OR REPLACE FUNCTION notify_draw_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Supabase will send email via Auth system
    -- Insert notification record
    INSERT INTO notifications (user_id, group_id, type, message)
    VALUES (
        (SELECT user_id FROM participants WHERE id = NEW.giver_id),
        NEW.group_id,
        'draw_complete',
        'Secret Santa draw has been completed! Check your assignment.'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on assignment creation
CREATE TRIGGER on_assignment_created
    AFTER INSERT ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_draw_complete();
```

### Option 2: Using Supabase Edge Functions

The Edge Function we created earlier can be updated to:
1. Be triggered by database webhook
2. Use Supabase's built-in email
3. Send simple notification emails

```typescript
// Update supabase/functions/send-assignment-emails/index.ts
// to use Supabase Auth email instead of Resend
```

## 🍪 Cookie & Music Consent

### How It Works

1. **Sign Up Page**: Users check boxes for:
   - 🍪 Cookie consent (required)
   - 🎵 Music autoplay consent (optional)

2. **Stored in**:
   - `user_profiles.music_consent` (database)
   - `localStorage.musicAutoplay` (browser)
   - `localStorage.cookieConsent` (browser)

3. **On Dashboard Load**:
   ```javascript
   // Check music consent
   const musicConsent = await getUserMusicConsent();
   if (musicConsent) {
       autoPlayMusic();
   }
   ```

## 🔐 Security Features

### Row Level Security (RLS) Policies

**Users can only:**
- ✅ View their own profile
- ✅ View groups they're in
- ✅ View participants in their groups
- ✅ View their own Secret Santa assignments
- ✅ Create groups (if authenticated)
- ✅ Join groups (if authenticated)
- ✅ Draw names (if they're the group creator)

## 📱 User Flow

### New User Journey

1. **Visit Site** → Redirected to `auth.html`
2. **Click "Sign Up"**
3. **Fill Form**:
   - Full Name: Michael Reoch
   - Email: mreoch82@hotmail.com
   - Password: ••••••••
   - Spouse: Brittany Barrios (optional)
   - ☑ Music autoplay
   - ☑ Accept cookies (required)
4. **Submit** → Account created → Email verification sent
5. **Verify Email** → Click link in email
6. **Redirected to Dashboard** → See welcome message
7. **Click "Join a Group"** → Enter group code
8. **Group Card Appears** → Shows status and participants
9. **Creator Draws Names** → Email notification sent
10. **See Assignment** → Dashboard shows who you got!

### Existing User Journey

1. **Visit Site** → Redirected to `auth.html`
2. **Enter Email/Password** → Click "Sign In"
3. **Dashboard Loads** → See all groups
4. **Click Group Card** → View details/assignment

## 🎨 Dashboard Layout

```
┌─────────────────────────────────────────┐
│ Welcome, Michael! 🎅        [Logout]    │
└─────────────────────────────────────────┘

┌───────────────┐  ┌───────────────┐
│ Recon2025     │  │ Work Party    │
│ Status: ✅     │  │ Status: ⏳     │
│               │  │               │
│ You got:      │  │ Waiting for   │
│ Sarah Johnson │  │ draw...       │
│               │  │               │
│ 5 participants│  │ 8 participants│
└───────────────┘  └───────────────┘

        [+ Join New Group]
```

## 🔄 Migration Checklist

### Database
- [ ] Run updated schema
- [ ] Enable Supabase Auth
- [ ] Configure email templates
- [ ] Test RLS policies

### Frontend
- [ ] Create dashboard.js
- [ ] Update index.html to be dashboard
- [ ] Test auth flows
- [ ] Test cookie consent
- [ ] Test music autoplay

### Testing
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Reset password
- [ ] Join a group
- [ ] Create a group
- [ ] Draw names
- [ ] View assignment
- [ ] Check email notifications

## 📝 Quick Start for Development

```bash
# 1. Reset database
cd /Users/michaelreoch/secret-santa
supabase db reset

# 2. Start dev server
python3 -m http.server 8000

# 3. Visit auth page
open http://localhost:8000/auth.html

# 4. Create account and test!
```

## 🎯 Benefits of New System

✅ **Secure** - Proper authentication with Supabase Auth  
✅ **Professional** - Real user accounts, not localStorage  
✅ **Email Verification** - Confirms user emails  
✅ **Password Reset** - Users can recover accounts  
✅ **Better UX** - Single dashboard for all groups  
✅ **Privacy** - RLS ensures users only see their data  
✅ **Consent Management** - Proper cookie/music consent  
✅ **Scalable** - Can add features like profiles, settings, etc.

## ⚠️ Important Notes

1. **Email**: Supabase free tier has email limits. For production, configure your own SMTP.

2. **Migration**: Existing localStorage data will NOT transfer. Users need to create accounts.

3. **Testing**: Use Supabase local dev for testing before deploying.

4. **Production**: Update URLs in Supabase dashboard when deploying to Netlify.

## 🤔 Next Steps

Want me to:
1. **Complete the dashboard.js implementation**?
2. **Create email notification templates**?
3. **Build a user profile/settings page**?
4. **Add social auth (Google, etc.)**?

The foundation is in place - we just need to finish connecting all the pieces!

