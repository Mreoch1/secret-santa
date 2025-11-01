# Secret Santa Setup Guide

Follow these steps to get your Secret Santa website up and running!

## Prerequisites

- macOS (you're all set!)
- Homebrew installed
- A Supabase account (free tier is fine)
- A Netlify account (free tier is fine)
- Optional: A Resend account for emails (free tier: 100 emails/day)

## Step 1: Install Required Tools

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Install Netlify CLI
npm install -g netlify-cli
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Name it "secret-santa" or similar
4. Choose a database password (save this!)
5. Select a region close to you
6. Wait for the project to be created

### 2.2 Set Up Database Schema

1. In your Supabase project, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run"
5. You should see success messages for all table creations

### 2.3 Get Your Supabase Credentials

1. In your Supabase project, go to Settings > API
2. Copy your "Project URL" (this is your SUPABASE_URL)
3. Copy your "anon public" key (this is your SUPABASE_ANON_KEY)

### 2.4 Update config.js

1. Open `config.js`
2. Replace `YOUR_SUPABASE_URL` with your actual Supabase URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your actual anon key
4. Save the file

## Step 3: Set Up Email Functionality (Optional but Recommended)

### Option A: Using Resend (Recommended - Free 100 emails/day)

1. Go to https://resend.com and create an account
2. Get your API key from the dashboard
3. Deploy the Edge Function:

```bash
cd /Users/michaelreoch/secret-santa

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=your_resend_api_key

# Deploy the Edge Function
supabase functions deploy send-assignment-emails
```

### Option B: Without Email (Manual Notification)

If you skip email setup, users can still see their assignments on their dashboard page. They just won't receive email notifications.

## Step 4: Add Christmas Music

1. Download free Christmas music (suggestions below)
2. Create a `music` folder in the project directory
3. Save the music file as `jingle-bells.mp3` in the `music` folder

**Free Christmas Music Sources:**
- https://www.bensound.com (royalty-free music)
- https://freepd.com (public domain)
- https://incompetech.com (Creative Commons)

**Recommended:** Search for "Jingle Bells" or "Silent Night" instrumental versions.

## Step 5: Deploy to Netlify

```bash
# Navigate to project directory
cd /Users/michaelreoch/secret-santa

# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Give it a site name (e.g., recon-secret-santa)
# - Build command: (leave empty)
# - Publish directory: . (current directory)

# Deploy
netlify deploy --prod
```

Your site will be live at: `https://your-site-name.netlify.app`

## Step 6: Test Your Site

1. Visit your Netlify URL
2. Enter a test group code (e.g., "TEST2025")
3. Add yourself as a participant
4. Add 1-2 more test participants using different emails
5. Click "Draw Names" to test the Secret Santa algorithm
6. Check that assignments appear correctly

## Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:** Make sure your Supabase credentials in `config.js` are correct.

### Issue: "Database error" messages

**Solution:** 
1. Check that you ran the SQL schema correctly in Supabase
2. Verify Row Level Security policies are enabled
3. Check the browser console for specific errors

### Issue: Emails not sending

**Solution:**
1. Verify your Resend API key is set correctly
2. Check the Edge Function logs in Supabase Dashboard > Edge Functions
3. Make sure the Edge Function is deployed

### Issue: Music not playing

**Solution:**
1. Verify the music file exists in `/music/jingle-bells.mp3`
2. Try a different browser (some browsers block autoplay)
3. User must click the "Play Music" button due to browser autoplay policies

## Environment Variables for Netlify (if needed)

If you need to add environment variables:

```bash
netlify env:set SUPABASE_URL "your_url"
netlify env:set SUPABASE_ANON_KEY "your_key"
```

## Security Notes

- The `anon` key is safe to use in the browser (it's public)
- Row Level Security (RLS) policies protect your data
- Never commit your `.env` file to version control
- Keep your service role key private (not used in this app)

## Getting Help

- Supabase Docs: https://supabase.com/docs
- Netlify Docs: https://docs.netlify.com
- Check browser console for error messages
- Review Supabase logs for database errors

## Customization Ideas

- Change colors in `styles.css`
- Add more snowflakes or decorations
- Customize the email template in the Edge Function
- Add a "Share group code" button
- Add gift budget suggestions
- Create a wishlist feature

Enjoy your Secret Santa! 🎅🎄

