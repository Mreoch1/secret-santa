#!/bin/bash

echo "🎄 Secret Santa - Netlify Deployment Script 🎅"
echo "================================================"
echo ""

cd /Users/michaelreoch/secret-santa

echo "📦 Step 1: Checking Netlify CLI..."
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi
echo "✅ Netlify CLI ready"
echo ""

echo "🔗 Step 2: Initializing Netlify site..."
echo "   Follow the prompts to create your site"
echo ""
netlify init

echo ""
echo "🔑 Step 3: Setting environment variables..."
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj

echo ""
echo "🚀 Step 4: Deploying to production..."
netlify deploy --prod

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Create Supabase cloud project at https://supabase.com"
echo "2. Run migrations from supabase/migrations/"
echo "3. Update config-production.js with your Supabase URLs"
echo "4. Redeploy: netlify deploy --prod"
echo ""
echo "🎉 Your Secret Santa site is live! 🎅🎄"

