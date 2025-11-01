# Fix "Unknown" Participant Right Now

## 🎯 I opened the Supabase SQL Editor for you!

---

## 📋 **Step 1: Run This Query**

Copy and paste this into the Supabase SQL Editor:

```sql
-- See the current state
SELECT 
    p.id as participant_id,
    p.user_id,
    up.id as profile_id,
    up.full_name,
    up.email,
    au.email as auth_email
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
ORDER BY p.created_at;
```

**This will show you:**
- Which participant has no profile
- What their auth email is

---

## 🔧 **Step 2: Fix It**

After seeing the results, run this:

```sql
-- Fix missing profiles for REOCH2025 group
INSERT INTO user_profiles (id, full_name, email, spouse_name, music_consent)
SELECT 
    p.user_id,
    COALESCE(SPLIT_PART(au.email, '@', 1), 'User'),
    au.email,
    NULL,
    FALSE
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
  AND up.id IS NULL
  AND au.id IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET 
    full_name = COALESCE(user_profiles.full_name, EXCLUDED.full_name),
    email = COALESCE(user_profiles.email, EXCLUDED.email);
```

---

## ✅ **Step 3: Verify**

Run this to confirm it's fixed:

```sql
SELECT 
    p.id as participant_id,
    up.full_name,
    up.email
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
ORDER BY p.created_at;
```

You should now see TWO rows with names/emails!

---

## 🎯 **Quick Alternative: Delete & Rejoin**

If the above doesn't work, the "Unknown" user can:
1. You click the **🗑️ Remove** button next to "Unknown"
2. They sign in again
3. They rejoin the group with the password
4. ✅ Their name will show properly!

---

## 📝 **After Fixing:**

1. **Refresh your dashboard** (Cmd+R or F5)
2. **Open the group again**
3. **Check the console** - "Unknown" should be replaced with their email or name

---

**Run those 3 SQL queries in the Supabase editor I just opened!** 🔍

Or just **click the 🗑️ Remove button** and have them rejoin! 🎅

