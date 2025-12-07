# Comprehensive Test Guide - 10 User Group

## 🎯 Test Overview

This guide will help you manually test all aspects of the Secret Santa platform with 10 users.

## 📋 Prerequisites

1. **Sign in** to the dashboard at `https://holidaydrawnames.com/dashboard.html`
2. **Open browser console** (F12 or Cmd+Option+I)
3. **Copy the test script** from `test-group-comprehensive.js`

## 🚀 Quick Start

### Step 1: Load Test Script

1. Open browser console on dashboard
2. Copy entire contents of `test-group-comprehensive.js`
3. Paste into console and press Enter
4. Wait for: `✅ Test suite loaded! Run: await runSecretSantaTests()`

### Step 2: Run Tests

```javascript
await runSecretSantaTests()
```

This will:
- Create a test group (TEST2025)
- Test all functionality
- Generate detailed logs
- Save results to localStorage

### Step 3: View Results

```javascript
// View summary
const results = JSON.parse(localStorage.getItem('testResults'));
console.table(results);

// View all logs
results.logs.forEach(log => {
    console.log(`[${log.elapsed}] ${log.level.toUpperCase()}: ${log.message}`);
});
```

## 📝 Manual Testing Steps

### Phase 1: Create Group

1. **Click "+ Create a Group"**
2. **Enter details:**
   - Group Code: `TEST2025`
   - Password: `TestPassword123`
   - Budget: $20 - $50
   - Exchange Date: 2025-12-25
   - Location: Virtual Party
3. **Click "Create Group"**
4. **Verify:** Group appears in dashboard

### Phase 2: Add 10 Participants

**Option A: Email Invites (Recommended)**
1. Click "📧 Send Email Invites"
2. Enter these test emails (one per line):
   ```
   alice.test@example.com
   bob.test@example.com
   charlie.test@example.com
   diana.test@example.com
   eve.test@example.com
   frank.test@example.com
   grace.test@example.com
   henry.test@example.com
   ivy.test@example.com
   jack.test@example.com
   ```
3. Add personal message (optional)
4. Click "Send Invites"
5. **Verify:** Success message appears

**Option B: Manual Join (For Testing)**
1. Share group code: `TEST2025`
2. Share password: `TestPassword123`
3. Each user signs up and joins
4. **Verify:** Participant count increases

### Phase 3: Set Up Spouse Relationships

1. **For Alice & Bob:**
   - Alice: Profile → Set spouse: "Bob Anderson"
   - Bob: Profile → Set spouse: "Alice Anderson"

2. **For Eve & Frank:**
   - Eve: Profile → Set spouse: "Frank Evans"
   - Frank: Profile → Set spouse: "Eve Evans"

3. **Verify:** Spouse names saved in profiles

### Phase 4: Test Blocklist

1. Click "🚫 Set Block Rules"
2. **Test scenarios:**
   - Block Alice from getting Bob
   - Block Charlie from getting Diana
   - Save blocklist
3. **Verify:** Blocks saved

### Phase 5: Draw Names

1. **Verify participant count:** Should show 11 (creator + 10)
2. **Click "🎲 Draw Names"**
3. **Wait for:**
   - Confetti animation
   - Success message
   - Email notifications sent
4. **Verify:**
   - Group status: "Names Drawn"
   - Assignments visible
   - Creator receipt email received

### Phase 6: Verify Assignments

**Check Console Logs:**
```javascript
// Get assignments
const { data: assignments } = await supabase
    .from('assignments')
    .select('*')
    .eq('group_id', YOUR_GROUP_ID);

console.table(assignments);
```

**Manual Checks:**
1. ✅ No one got themselves
2. ✅ Alice didn't get Bob (spouse)
3. ✅ Bob didn't get Alice (spouse)
4. ✅ Eve didn't get Frank (spouse)
5. ✅ Frank didn't get Eve (spouse)
6. ✅ All blocks respected
7. ✅ Everyone has an assignment
8. ✅ Everyone has a giver

### Phase 7: Test Email Notifications

1. **Check inboxes** for:
   - Assignment emails (10 sent)
   - Creator receipt email (1 sent)
2. **Verify email content:**
   - Correct recipient name
   - Correct giver name
   - Group code included
   - Wishlist link works
   - Dashboard link works

### Phase 8: Test Undo/Redraw

1. **Click "↩️ Undo Draw"**
2. **Verify:**
   - Group status: "Ready to Draw"
   - Assignments cleared
   - Can draw again
3. **Click "🎲 Draw Names" again**
4. **Verify:** New assignments created

### Phase 9: Test Dashboard Features

1. **QR Code:**
   - Click "📱 Show QR Code"
   - Verify QR code displays
   - Test scanning (if possible)

2. **Copy Links:**
   - Click "📋 Copy Group Link"
   - Verify link copied
   - Test link in new tab

3. **Group Details:**
   - Verify budget displayed
   - Verify exchange date displayed
   - Verify location displayed

### Phase 10: Test Edge Cases

1. **Try to draw with 1 person:** Should show error
2. **Try to join with wrong password:** Should show error
3. **Try to draw twice:** Should show warning
4. **Try to add duplicate participant:** Should show warning

## 📊 Expected Results

### Participant Count
- **Expected:** 11 participants (1 creator + 10 test users)
- **Verify:** Dashboard shows correct count

### Assignments
- **Expected:** 11 assignments (everyone gives and receives)
- **Verify:** All participants have assignments

### Email Count
- **Expected:** 11 emails (10 assignments + 1 creator receipt)
- **Verify:** Check email logs/Netlify function logs

### Spouse Blocks
- **Expected:** 0 spouse assignments
- **Verify:** Alice ≠ Bob, Eve ≠ Frank

### Self Assignments
- **Expected:** 0 self-assignments
- **Verify:** No one got themselves

## 🔍 Inspecting Logs

### Browser Console
```javascript
// View all test logs
const results = JSON.parse(localStorage.getItem('testResults'));
results.logs.forEach(log => console.log(log));
```

### Netlify Function Logs
1. Go to Netlify Dashboard
2. Navigate to Functions → send-email
3. Check logs for email sends

### Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs → API
3. Check for errors or issues

## 🧹 Cleanup

### Option 1: Keep for Inspection
- Leave test group
- Review results
- Delete later

### Option 2: Delete Test Group
```sql
-- Run in Supabase SQL Editor
DELETE FROM assignments WHERE group_id = 'YOUR_GROUP_ID';
DELETE FROM participant_blocks WHERE group_id = 'YOUR_GROUP_ID';
DELETE FROM participants WHERE group_id = 'YOUR_GROUP_ID';
DELETE FROM groups WHERE id = 'YOUR_GROUP_ID';
```

### Option 3: Delete via Dashboard
1. Open group
2. Click "Delete Group"
3. Confirm deletion

## 📈 Success Criteria

✅ **All tests pass:**
- Group created successfully
- All participants added
- Names drawn without errors
- No self-assignments
- No spouse assignments
- All blocks respected
- Emails sent successfully
- Undo/redraw works
- Dashboard displays correctly

## 🐛 Troubleshooting

### "Not enough participants"
- **Fix:** Add more participants before drawing

### "Email sending failed"
- **Check:** Netlify function logs
- **Verify:** RESEND_API_KEY set in Netlify
- **Check:** Domain verified in Resend

### "Spouse assignment found"
- **Check:** Spouse names set correctly in profiles
- **Verify:** Matching algorithm respects spouse blocks

### "Self-assignment found"
- **Check:** Matching algorithm
- **Verify:** No duplicate participants

## 📝 Test Report Template

```markdown
# Test Report - [Date]

## Test Group
- Code: TEST2025
- Participants: 11
- Date: [Date]

## Results
- ✅ Group Creation: PASS
- ✅ Participant Addition: PASS
- ✅ Name Drawing: PASS
- ✅ Email Sending: PASS
- ✅ Spouse Blocks: PASS
- ✅ Self-Assignment Check: PASS

## Issues Found
- None / [List issues]

## Recommendations
- [Any recommendations]
```

---

**Happy Testing! 🎅🎄**

