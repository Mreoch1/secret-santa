# Clear Blocklist and Spouse Data

## 🎯 **The Issue:**

You're seeing "(🚫 blocked: Eric Reoch)" but you cleared the blocklist. This could be:
1. Old data still in `participant_blocks` table
2. Old `spouse_name` data still in database (we removed the code but not the data)

---

## 🔧 **Quick Fix - Run in Supabase SQL Editor:**

I just opened it for you. Run this:

```sql
-- Clear all blocks from REOCH2025
DELETE FROM participant_blocks
WHERE group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025');

-- Clear old spouse_name data (no longer used)
UPDATE user_profiles
SET spouse_name = NULL
WHERE id IN (
    SELECT p.user_id 
    FROM participants p
    WHERE p.group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025')
);

-- Verify it's clear
SELECT COUNT(*) as block_count FROM participant_blocks 
WHERE group_id IN (SELECT id FROM groups WHERE group_code = 'REOCH2025');
```

---

## ✅ **After Running:**

1. **Refresh your dashboard** (F5)
2. **Open REOCH2025 group**
3. **Participants should show:**
   - Michael Reoch (you) ← No blocks shown
   - Eric Reoch ← No blocks shown
   - Mike Reoch ← No blocks shown

---

## 🎯 **Then Set Up Blocklist Fresh:**

1. Click **"🚫 Set Block Rules"**
2. Check boxes for who shouldn't be paired
3. Click **💾 Save**
4. Refresh
5. **Blocks will show** next to names!

---

## 📝 **Example After Setting Blocks:**

If you block Michael ↔ Eric:
```
Michael Reoch (🚫 blocked: Eric Reoch) (you)
Eric Reoch (🚫 blocked: Michael Reoch)
Mike Reoch
```

---

**Run that SQL to clear everything, then set up blocklist fresh!** 🎅

