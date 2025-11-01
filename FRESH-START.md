# Fresh Start - Clear All Groups

## 🎯 **The Problem:**

Group deletion didn't fully complete, leaving orphaned data that blocks recreating "REOCH2025".

---

## 🔧 **Complete Clean Slate:**

I opened Supabase SQL Editor. Run this to **clear EVERYTHING**:

```sql
-- Delete all Secret Santa data (clean slate)
DELETE FROM assignments;
DELETE FROM participant_blocks;
DELETE FROM group_invites;
DELETE FROM participants;
DELETE FROM groups;

-- Clear spouse names (no longer used)
UPDATE user_profiles SET spouse_name = NULL;

-- Verify clean
SELECT 'Groups' as table_name, COUNT(*) as count FROM groups
UNION ALL SELECT 'Participants', COUNT(*) FROM participants
UNION ALL SELECT 'Blocks', COUNT(*) FROM participant_blocks;
```

---

## ✅ **After Running:**

**Everything will be cleared:**
- ✅ All groups deleted
- ✅ All participants removed
- ✅ All blocks cleared
- ✅ All assignments removed
- ✅ All invites cleared

**User accounts remain:**
- ✅ Michael Reoch account exists
- ✅ Eric Reoch account exists
- ✅ Mike Reoch account exists
- They can all sign in and join new groups!

---

## 🎯 **Then You Can:**

1. **Refresh your dashboard** (F5)
2. Click **"+ Create a Group"**
3. Enter **"REOCH2025"** as group code
4. Set password
5. ✅ **Works!** (No "name taken" error)
6. Invite Eric and Mike with email invites
7. Set up blocklist fresh
8. Draw names!

---

## 🎅 **Start Fresh Workflow:**

### Step 1: Run the SQL above ✅

### Step 2: Create Group
- Code: `REOCH2025`
- Password: `Reoch2025`

### Step 3: Send Email Invites
- Click **"📧 Send Email Invites"**
- Enter:
  ```
  ereo79@yahoo.com
  mike@reconenterprises.net
  ```
- They get emails with join link!

### Step 4: They Join
- Eric signs in → joins with code
- Mike signs in → joins with code

### Step 5: Set Blocklist
- Click **"🚫 Set Block Rules"**
- Check any blocks you want
- Save

### Step 6: Draw Names
- All blocks respected ✅
- Everyone gets email with assignment ✅

---

**Run that SQL for a completely fresh start!** 🎄

Then you can create REOCH2025 again without the "name taken" error! ✨

