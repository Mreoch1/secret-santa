# 🌐 Add Custom Domain to Your Secret Santa Site

## The CLI doesn't have domain commands, so we'll use the Netlify Dashboard (super easy!)

---

## 🚀 Quick Setup (3 Minutes)

### Step 1: Add Domain in Netlify Dashboard

I just opened your Netlify dashboard, or visit:
**https://app.netlify.com/sites/holiday-draw-names/settings/domain**

1. Scroll to **"Custom domains"** section
2. Click **"Add a domain"**
3. Enter: **secretsanta.reconenterprises.net**
4. Click **"Verify"**
5. Click **"Add domain"**

### Step 2: Add DNS Record

In your domain provider for **reconenterprises.net**:

**Add a CNAME record:**
- **Type**: CNAME
- **Name**: secretsanta
- **Value**: holiday-draw-names.netlify.app
- **TTL**: Auto or 3600

### Step 3: Wait for DNS (5-10 minutes)

Netlify will automatically provision SSL certificate.

---

## 📧 Step 4: Verify in Resend

Now go back to Resend:

1. **Remove** the `holiday-draw-names.netlify.app` domain
2. **Add** new domain: **reconenterprises.net** (the root domain)
3. **Add DNS records** that Resend provides to your DNS provider
4. **Verify**
5. ✅ Now you can send to anyone!

---

## 🎯 Or Even Simpler: Buy a Domain

**Quick option:**
1. Buy **secretsantadraw.com** ($12/year) from Namecheap/Google Domains
2. Point it to Netlify
3. Verify in Resend
4. Done!

**Want me to help you buy and set up a new domain?** It's super quick!

---

## 💡 Alternative: Use Existing Domain

You could also use:
- **santa.gtreoch.com**
- **secretsanta.sgo.golf**
- Any of your existing domains

Just needs:
- CNAME record pointing to Netlify
- Resend verification on the root domain

---

**What would you prefer?**
1. Use reconenterprises.net subdomain (secretsanta.reconenterprises.net)
2. Buy a new domain for Secret Santa
3. Use one of your other domains

Let me know and I'll help you set it up! 🎅

