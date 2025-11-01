# Fix "Unknown" Participant Issue

## 🔍 **What's Happening:**

The "Unknown" participant means their `user_profiles` record is missing or has no `full_name`.

---

## 🛠️ **Quick Fix in Supabase:**

I just opened the Supabase SQL Editor.

### Step 1: Find the Problem

Run this query:
```sql
SELECT 
  p.id as participant_id,
  p.user_id,
  up.full_name,
  up.email,
  au.email as auth_email
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
ORDER BY p.created_at;
```

This will show:
- Which participant has no `full_name`
- Their email from `auth.users`

---

### Step 2: Fix the Missing Profile

If a participant has no profile, create one:

```sql
-- Replace USER_ID_HERE with the actual user_id from Step 1
-- Replace EMAIL_HERE with their actual email

INSERT INTO user_profiles (id, full_name, email, spouse_name, music_consent)
VALUES (
  'USER_ID_HERE',  -- The user_id from the query
  'EMAIL_HERE',     -- Their email (will show until they update)
  'EMAIL_HERE',
  NULL,
  FALSE
)
ON CONFLICT (id) DO UPDATE
SET 
  full_name = COALESCE(user_profiles.full_name, EXCLUDED.email),
  email = EXCLUDED.email;
```

---

### Step 3: Or Update Existing Profile

If the profile exists but `full_name` is null:

```sql
-- Update the profile with the email as a temporary name
UPDATE user_profiles
SET full_name = email
WHERE id = 'USER_ID_HERE' AND (full_name IS NULL OR full_name = '');
```

---

## 🎯 **Better Solution - Auto-Fix:**

Let me add code to automatically handle this!

The dashboard should show email if full_name is missing.

---

## 📝 **Run the Query:**

1. I opened Supabase SQL Editor
2. Copy the query from Step 1 above
3. Paste and run it
4. **Send me a screenshot** of the results
5. I'll tell you exactly what to fix!

---

**Or just paste the results here and I'll fix it for you!** 🎅

