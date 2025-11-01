# 🚀 Deploy in 3 Commands (2 Minutes!)

The Netlify CLI needs you to answer a few quick questions. Here's exactly what to do:

---

## 📋 Copy and Run These Commands:

### Command 1: Deploy (will ask questions)

```bash
cd /Users/michaelreoch/secret-santa && netlify deploy --dir=. --prod
```

**When it asks questions, choose:**

1. **"What would you like to do?"**
   - Press **Down Arrow** once
   - Press **Enter**
   - (Selects "Create & configure a new project")

2. **"Team:"**
   - Should show "Mreoch82"
   - Press **Enter**

3. **"Site name:"**
   - Type: **secret-santa-recon**
   - Press **Enter**

4. It will upload and deploy automatically!

---

### Command 2: Set API Key

```bash
netlify env:set RESEND_API_KEY re_cfiPFoPP_DNJvMhYgMM28Edh6bxoMchdj
```

(No questions, just runs!)

---

### Command 3: Open Your Site

```bash
netlify open:site
```

(Opens your live site in browser!)

---

## ✅ That's It!

**Total time: 2 minutes**
**Your site will be live!**

---

## 📝 What You'll Get:

- Live URL: `https://secret-santa-recon.netlify.app`
- All features working (except database - need Supabase next)
- Email ready to go
- Beautiful Christmas UI

---

## 🎯 Next: Supabase (5 minutes)

After Netlify is deployed:

1. Go to **https://supabase.com**
2. Create project (web interface is easiest)
3. Run migrations in SQL Editor
4. Update config.js
5. Redeploy: `netlify deploy --prod`

---

## 💡 Why I Can't Fully Automate

Netlify CLI requires interactive input for:
- Team selection
- Site name
- Confirmation

**But it's super quick!** Just 3 questions and you're deployed! 🚀

---

**Run the first command now and answer the 3 questions - you'll be live in 2 minutes!** 🎅🎄

