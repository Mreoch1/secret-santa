# 📧 Customize Supabase Email Templates

I just opened your Supabase email templates page!

---

## 🎯 **Templates to Customize:**

You'll see 3 templates:

### 1. **Confirm Signup**

**Replace default with:**

```html
<h2>🎄 Welcome to Holiday Draw Names! 🎅</h2>

<p>Hi there!</p>

<p>Thanks for joining Holiday Draw Names - your online Secret Santa organizer!</p>

<p>Click the link below to confirm your email address and get started:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #c41e3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">Confirm Your Email 🎁</a></p>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

<p style="color: #666; font-size: 0.9em;">
Ready to organize your Secret Santa? After confirming, you can:
<ul>
  <li>Create password-protected groups</li>
  <li>Send email invitations</li>
  <li>Draw names automatically</li>
  <li>Manage multiple gift exchanges</li>
</ul>
</p>

<p style="color: #666; font-size: 0.8em; margin-top: 30px;">
🎄 Holiday Draw Names - Making Secret Santa easy!<br>
Visit us at: <a href="https://holidaydrawnames.com">holidaydrawnames.com</a>
</p>
```

---

### 2. **Magic Link**

```html
<h2>🎄 Sign In to Holiday Draw Names 🎅</h2>

<p>Click the link below to sign in to your account:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #0f7c3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">Sign In 🎁</a></p>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<p style="color: #666; font-size: 0.9em; margin-top: 30px;">
This link expires in 1 hour for security.
</p>

<p style="color: #666; font-size: 0.8em; margin-top: 30px;">
🎄 Holiday Draw Names<br>
<a href="https://holidaydrawnames.com">holidaydrawnames.com</a>
</p>
```

---

### 3. **Reset Password**

```html
<h2>🎄 Reset Your Password 🎅</h2>

<p>Hi there!</p>

<p>You requested to reset your password for Holiday Draw Names.</p>

<p>Click the link below to choose a new password:</p>

<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #c41e3a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">Reset Password 🔒</a></p>

<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>

<p style="color: #666; font-size: 0.9em; margin-top: 20px;">
If you didn't request this, you can safely ignore this email.
</p>

<p style="color: #666; font-size: 0.8em; margin-top: 30px;">
🎄 Holiday Draw Names<br>
<a href="https://holidaydrawnames.com">holidaydrawnames.com</a>
</p>
```

---

## 📝 **How to Update:**

In the Supabase email templates page I just opened:

1. Click **"Confirm signup"** template
2. **Replace** the entire HTML with the template above
3. Click **"Save"**
4. **Repeat** for "Magic Link" and "Reset Password"

---

## ✅ **After Updating:**

All system emails will show:
- ✅ "Holiday Draw Names" in subject and body
- ✅ Christmas-themed styling
- ✅ Branded colors (red and green)
- ✅ Professional appearance
- ✅ Links to holidaydrawnames.com

---

## 🎨 **Email Branding Complete:**

| Email Type | From | Branding |
|------------|------|----------|
| Signup Confirmation | Supabase | ✅ Holiday Draw Names |
| Magic Link | Supabase | ✅ Holiday Draw Names |
| Password Reset | Supabase | ✅ Holiday Draw Names |
| Group Invitations | santa@holidaydrawnames.com | ✅ Holiday Draw Names |

---

**Update those 3 templates in the Supabase page I opened!** 🎅📧

