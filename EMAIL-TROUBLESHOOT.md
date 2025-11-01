# 📧 Email Invite Troubleshooting

## ✅ Good News:

The Netlify function IS working! I just tested it successfully.

---

## 🔍 **To See What's Wrong:**

### Step 1: Check Browser Console

1. On the **holidaydrawnames.com** site
2. Press **F12** (or Cmd+Option+I)
3. Click **"Console"** tab
4. Try sending invite again
5. Look for error messages in red

**Send me what you see** and I can fix it!

---

### Step 2: Check Netlify Function Logs

I just opened the Netlify function logs. Look for:
- Recent requests to `send-email`
- Any error messages
- Response codes

---

## 🎯 **Common Issues & Fixes:**

### Issue 1: Resend Domain Not Verified

**Check**: Is `holidaydrawnames.com` verified in Resend?

**Fix**: 
1. Go to Resend → Domains
2. Click "I've added the records"
3. Wait for verification

---

### Issue 2: EMAIL_ENDPOINT Not Set

**Check**: Open browser console and see if it shows:
```
Using endpoint: /.netlify/functions/send-email
```

**Fix**: Should be set automatically by dashboard-production.js

---

### Issue 3: Network Error

**Check**: Browser console shows network error?

**Fix**: Clear browser cache (Cmd+Shift+R)

---

## 🧪 **Test the Function Directly:**

Try this in your browser console (F12):

```javascript
fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        from: 'Secret Santa <santa@holidaydrawnames.com>',
        to: ['your-email@example.com'],
        subject: 'Test',
        html: '<p>Test</p>'
    })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

---

## ✅ **Quick Fix to Try:**

1. **Hard refresh**: Cmd+Shift+R
2. **Clear cache**: In Dev Tools (F12) → Application → Clear storage
3. **Try invite again**

---

## 📝 **Updated Code:**

I just deployed:
- ✅ Better error logging
- ✅ Detailed error messages
- ✅ Console debugging info

**Refresh the page and try again - you'll get more detailed error info!**

---

**Check the browser console (F12) and Netlify logs to see the specific error!** 🎅

