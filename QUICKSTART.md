# Quick Start Guide

Get your Secret Santa website running in 5 minutes!

## Current Status

✅ Development server is running at http://localhost:8000
⚠️ **You need to configure Supabase before the website will work**

## Step-by-Step Setup

### Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"
5. Fill in:
   - **Name:** secret-santa
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to you
6. Click "Create new project"
7. Wait 2 minutes for setup to complete

### Step 2: Set Up Database (1 minute)

1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the file `supabase-schema.sql` from this project
4. Copy ALL the contents
5. Paste into the Supabase SQL Editor
6. Click "Run" (or press Cmd+Enter)
7. You should see success messages

### Step 3: Get Your API Keys (1 minute)

1. In Supabase, go to Settings > API (gear icon in sidebar)
2. You'll see two important values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public key** (long string starting with "eyJ...")
3. Keep this tab open - you'll need these values!

### Step 4: Configure Your Website (1 minute)

1. Open `config.js` in your code editor
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-actual-project.supabase.co';  // Paste your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGc...';  // Paste your anon public key
```

3. Save the file

### Step 5: Test It Out! (Now!)

1. Go to http://localhost:8000 in your browser
2. You should see the Christmas-themed Secret Santa website!
3. Try it out:
   - Enter a group code: `Recon2025`
   - Enter your name and email
   - Add a spouse name if applicable
   - Click "Join Secret Santa"
4. Open another browser (or incognito window) and add more test participants
5. Click "Draw Names" to see the magic happen!

## Optional: Add Christmas Music

1. Download free music from:
   - https://www.bensound.com (search "Christmas")
   - https://freepd.com (search "Jingle Bells")
2. Save it as `music/jingle-bells.mp3`
3. Refresh your browser
4. Click "Play Music" button

## Troubleshooting

### "Failed to fetch" or connection errors
- ✅ Make sure you updated `config.js` with your real Supabase credentials
- ✅ Check that your Supabase project is active (green indicator)
- ✅ Open browser console (F12) to see specific errors

### Database errors
- ✅ Make sure you ran the entire `supabase-schema.sql` file
- ✅ Check for errors in the SQL Editor
- ✅ Verify all 3 tables were created (groups, participants, assignments)

### Music not playing
- ✅ Make sure file exists at `music/jingle-bells.mp3`
- ✅ Some browsers block autoplay - click the "Play Music" button
- ✅ Check file format is MP3

## Deploy to the Internet

When you're ready to share with your family:

### Quick Deploy with Netlify (5 minutes)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
cd /Users/michaelreoch/secret-santa
netlify login
netlify init
netlify deploy --prod
```

3. Follow the prompts and you'll get a live URL!

### Set Up Emails (Optional)

See `SETUP.md` for detailed instructions on setting up automated email notifications using Resend (free tier: 100 emails/day).

## Need Help?

- 📖 See `SETUP.md` for detailed instructions
- 📖 See `README.md` for project overview
- 🐛 Check browser console (F12) for error messages
- 📧 Supabase docs: https://supabase.com/docs

## You're All Set! 🎅🎄

Your Secret Santa website is ready to spread holiday cheer!

