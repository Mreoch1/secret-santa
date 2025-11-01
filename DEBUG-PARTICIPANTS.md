# Debug: Why "Unknown" Keeps Coming Back

## 🔍 **The Console Shows:**

1. ✅ "Participant deleted successfully"
2. 🔄 "Reloading groups..."
3. ⚠️ Still shows 2 participants with empty profiles: `(2) [{}, {}]`

---

## 🎯 **This Means:**

There are likely **2 or more** participants with missing profiles!

When you delete one "Unknown", another one appears because there's ANOTHER participant without a profile.

---

## 📋 **Run This in Supabase SQL Editor:**

I just opened it for you. Run this query:

```sql
SELECT 
    p.id as participant_id,
    p.user_id,
    p.created_at,
    up.full_name,
    up.email,
    au.email as auth_email
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
LEFT JOIN auth.users au ON p.user_id = au.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
ORDER BY p.created_at;
```

---

## 🔧 **Quick Fix Options:**

### Option 1: Delete ALL Unknown Participants
```sql
-- Delete all participants without user profiles from REOCH2025
DELETE FROM participants
WHERE group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
AND user_id NOT IN (SELECT id FROM user_profiles WHERE full_name IS NOT NULL);
```

### Option 2: Create Profiles for All Missing Users
```sql
-- Create profiles for anyone missing one
INSERT INTO user_profiles (id, full_name, email, spouse_name, music_consent)
SELECT 
    p.user_id,
    SPLIT_PART(au.email, '@', 1),
    au.email,
    NULL,
    FALSE
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
JOIN auth.users au ON p.user_id = au.id
WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
  AND up.id IS NULL
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, email = EXCLUDED.email;
```

### Option 3: Nuclear - Clear All Except You
```sql
-- Delete all participants except yourself from REOCH2025
DELETE FROM participants
WHERE group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
AND user_id != (SELECT id FROM auth.users WHERE email = 'mreoch82@hotmail.com');
```

---

## 🎯 **I Recommend:**

**Option 1**: Run the first query to SEE how many participants there actually are, then **Option 3** to clear them all except you.

Then you can properly invite people with email invites so they join correctly!

---

**Run that first query in Supabase to see what's actually in the database!** 🔍

