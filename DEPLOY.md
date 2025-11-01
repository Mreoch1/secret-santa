# Deploy Your Secret Santa Website

Everything is ready! Here's how to deploy your website to the internet.

## Prerequisites

✅ All dependencies are installed
✅ Supabase is running locally at http://127.0.0.1:54321
✅ Development server is running at http://localhost:8000
✅ Christmas music is loaded and ready
✅ All code is complete and tested

## Quick Deploy to Netlify (3 minutes)

### Step 1: Login to Netlify

```bash
cd /Users/michaelreoch/secret-santa
netlify login
```

This will open your browser and ask you to authorize the Netlify CLI.

### Step 2: Initialize the Project

```bash
netlify init
```

Follow the prompts:
- **Create & configure a new site** 
- **Team:** Choose your personal team or organization
- **Site name:** `recon-secret-santa` (or any name you prefer)
- **Build command:** Leave empty (press Enter)
- **Publish directory:** `.` (current directory)

### Step 3: Deploy!

```bash
netlify deploy --prod
```

That's it! Your site will be live at: `https://your-site-name.netlify.app`

## Production Supabase Setup

Currently, the site is configured to use your local Supabase instance. To make it work in production:

### Option 1: Use Supabase Cloud (Recommended)

1. Keep your Supabase project from earlier (or create a new one at https://supabase.com)
2. Update `config.js` with your cloud Supabase URL and anon key
3. Redeploy: `netlify deploy --prod`

### Option 2: Use Local Supabase for Testing

Your current setup works great for local testing! Just make sure:
- Supabase is running (`supabase start`)
- You're accessing the site via http://localhost:8000

## Environment Variables (Optional)

If you want to keep your Supabase credentials secure:

```bash
# Set environment variables in Netlify
netlify env:set SUPABASE_URL "your_supabase_url"
netlify env:set SUPABASE_ANON_KEY "your_supabase_anon_key"
```

Then update `config.js` to use environment variables (requires build step).

## Custom Domain (Optional)

Want to use your own domain like `secretsanta.recon.com`?

```bash
netlify domains:add secretsanta.recon.com
```

Follow the instructions to update your DNS settings.

## Testing Checklist

Before sharing with family, test these features:

- [ ] Can create a new group with a unique code
- [ ] Can join an existing group
- [ ] Participant names appear in the list
- [ ] Spouse names are properly excluded
- [ ] "Draw Names" button assigns everyone correctly
- [ ] Assignments appear on dashboard
- [ ] Christmas music plays when button is clicked
- [ ] Site looks good on mobile devices

## Troubleshooting

### "Failed to fetch" errors in production

**Solution:** Update `config.js` with your cloud Supabase credentials (not localhost)

### Music doesn't play

**Solution:** Some browsers block autoplay. Users must click the "Play Music" button.

### Netlify deploy fails

**Solution:** Make sure all files are present and you're in the project directory

## Quick Commands Reference

```bash
# Check site status
netlify status

# View deployment logs
netlify logs

# Open site in browser
netlify open

# View all sites
netlify sites:list

# Redeploy
netlify deploy --prod
```

## Next Steps

1. **Share the group code** with your family (e.g., "Recon2025")
2. **Send the website link** to everyone
3. **Wait for everyone** to join
4. **Click "Draw Names"** when ready
5. **Enjoy the holiday magic!** 🎄🎅

## Support

- Local dev server: http://localhost:8000
- Supabase Studio: http://127.0.0.1:54323
- Netlify Dashboard: https://app.netlify.com

Happy Holidays! 🎁

