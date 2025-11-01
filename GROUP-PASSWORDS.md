# Group Password Protection 🔒

## Overview

Groups are now password-protected to prevent random people from joining your Secret Santa!

## How It Works

### Creating a Group (Creator)

1. Click **"+ Join a Group"**
2. Click **"Create New Group Instead"**
3. Enter:
   - **Group Code**: e.g., "Recon2025"
   - **Password**: e.g., "FamilyFun123"
   - **Confirm Password**: Re-enter password
4. Click **"Create Group"**
5. You'll get a success message with the group code and password
6. **Share both** with your family members!

### Joining a Group (Members)

1. Click **"+ Join a Group"**
2. Enter:
   - **Group Code**: "Recon2025" (from organizer)
   - **Password**: "FamilyFun123" (from organizer)
3. Click **"Join Group"**
4. If password is correct, you're in! 🎄

## 📧 Email Invitations

### As Group Creator:

1. Click on your group card in the dashboard
2. You'll see:
   - 🔒 **Group Password** displayed
   - 📧 **"Send Email Invites"** button
3. Click **"Send Email Invites"**
4. Enter email addresses (one per line):
   ```
   grandma@example.com
   uncle.bob@example.com
   cousin.sarah@example.com
   ```
5. Add a personal message (optional):
   ```
   Join our family Secret Santa! Can't wait to see what you get me! 😄
   ```
6. Click **"Send Invitations"**

### What Recipients Get:

Beautiful HTML email with:
- 🎄 Christmas theme
- Your personal message
- Group code and password
- Direct link to join
- Step-by-step instructions

### Example Invitation Email:

```
┌────────────────────────────────────┐
│   🎄 You're Invited! 🎅          │
├────────────────────────────────────┤
│                                    │
│ Michael Reoch says:                │
│ "Join our family Secret Santa!     │
│  Can't wait to celebrate!"         │
│                                    │
│ Join Information:                  │
│ ┌────────────────────────────┐   │
│ │ Group Code: RECON2025       │   │
│ │ Password:   FamilyFun123    │   │
│ └────────────────────────────┘   │
│                                    │
│      [Join Secret Santa 🎁]       │
│                                    │
│ How to Join:                       │
│ 1. Click button above              │
│ 2. Create account or sign in       │
│ 3. Enter code and password         │
│ 4. Wait for the draw!              │
└────────────────────────────────────┘
```

## Security Features

### Password Protection
- ✅ Required for all groups
- ✅ Minimum 4 characters
- ✅ Prevents random people joining
- ✅ Only creator sees the password
- ✅ Password verification on join

### Access Control
- ✅ Only group creator can:
  - See the group password
  - Send email invites
  - Draw names
- ✅ Members can:
  - Join with correct password
  - See participants
  - See their assignment (after draw)

## Email Service Options

### Option 1: Manual (Current - No Setup)
- System shows you what would be sent
- You copy and manually email it
- **Works right now** without any configuration

### Option 2: Resend API (Recommended)
- Free tier: 100 emails/day
- Professional email delivery
- Setup time: 5 minutes

**To Enable:**
```bash
# 1. Get API key from https://resend.com
# 2. Set in Supabase:
supabase secrets set RESEND_API_KEY=re_your_key
supabase secrets set SITE_URL=https://your-site.netlify.app

# 3. Deploy function:
supabase functions deploy send-invites
```

### Option 3: Custom SMTP
- Use your own email server
- Configure in Edge Function
- Full control

## Best Practices

### Choose Strong Group Passwords
- ❌ Bad: "123", "password", "santa"
- ✅ Good: "FamilyXmas2025", "ReochSecretSanta", "HoHoHo123"

### Password Tips:
- Make it memorable for family
- Don't make it too complex
- Include the year for uniqueness
- Share securely with invitees

### Sharing Credentials

**Secure Ways:**
- ✅ Use the built-in email invite system
- ✅ Text message to family members
- ✅ Private family group chat
- ✅ Phone call

**Avoid:**
- ❌ Public social media posts
- ❌ Public forums
- ❌ Unencrypted public spaces

## Group Creator Dashboard View

When you open a group you created:

```
┌──────────────────────────────────┐
│ Recon2025                        │
├──────────────────────────────────┤
│ Status: ⏳ Waiting for Draw      │
│ Participants: 3                  │
│ 👑 You're the organizer          │
├──────────────────────────────────┤
│ Participants:                    │
│ • Michael Reoch                  │
│ • Brittany Barrios              │
│ • Sarah Johnson                  │
├──────────────────────────────────┤
│ 🔒 Group Password: FamilyFun123 │
│    Share this with new members!  │
├──────────────────────────────────┤
│ [📧 Send Email Invites]         │
├──────────────────────────────────┤
│ [Draw Names 🎲]                 │
└──────────────────────────────────┘
```

## Benefits

✅ **Privacy**: Only invited people can join  
✅ **Control**: Creator manages access  
✅ **Convenience**: Email invites make it easy  
✅ **Security**: Password verification on join  
✅ **Professional**: Beautiful invitation emails  
✅ **Simple**: One password per group  

## Testing

### Test the Password Protection:

1. **Create a group** with password "TestPass123"
2. **Try to join** with wrong password → ❌ Rejected
3. **Join with correct password** → ✅ Success
4. **Send invite** to test email
5. **Receive email** with code and password
6. **Join from invite** → ✅ Works!

### Test Email Invites:

1. Open a group you created
2. Click "Send Email Invites"
3. Enter test emails
4. Add personal message
5. Click "Send Invitations"
6. If Resend not configured: See preview text
7. If Resend configured: Emails sent! ✉️

## Troubleshooting

### "Incorrect password" error
- ✅ Check spelling/capitalization
- ✅ Verify with group creator
- ✅ Make sure no extra spaces

### Can't see password
- ✅ You must be the group creator
- ✅ Only creator can see/share password

### Emails not sending
- ✅ Check Edge Function is deployed
- ✅ Verify Resend API key is set
- ✅ Use manual mode (copy/paste) as fallback

## Future Enhancements

Possible additions:
- [ ] Password strength meter
- [ ] Copy password to clipboard button
- [ ] Password change feature
- [ ] Invitation history
- [ ] Email templates customization
- [ ] Bulk invite from CSV

---

**Your Secret Santa groups are now secure and private! 🎅🔒**

