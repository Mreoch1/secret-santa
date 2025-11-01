# Multi-Group Feature

Users can now join and manage multiple Secret Santa groups simultaneously!

## How It Works

### Joining Multiple Groups

1. **Join First Group**
   - Enter group code: "Recon2025"
   - Enter your details
   - See your dashboard

2. **Join Another Group**
   - Click "Join Another Group" button
   - Enter different group code: "WorkParty2025"
   - Enter same or different email
   - Now you're in 2 groups!

3. **Switch Between Groups**
   - Golden dropdown appears at top of dashboard
   - Select which group to view
   - Dashboard instantly updates

### Group Selector

When you're in multiple groups, you'll see:

```
┌─────────────────────────────────────────┐
│ Switch Group: [Recon2025 (Michael)] ▼  │
└─────────────────────────────────────────┘
```

Click the dropdown to switch between your groups instantly!

### Leaving Groups

**When in Multiple Groups:**
- Click "Leave Group"
- Prompted: "Leave just this group? (Cancel to leave ALL groups)"
- Click **OK** → Leaves current group, switches to another
- Click **Cancel** → Leaves ALL groups

**When in One Group:**
- Click "Leave Group"
- Confirms: "Are you sure?"
- Clears all data and returns to join page

## Use Cases

### Family & Work
```
You: Michael Reoch
Groups:
  - Recon2025 (Family Secret Santa)
  - TechCorp2025 (Work Secret Santa)
  - BowlingLeague (Friends Secret Santa)
```

### Multiple Families
```
You: Michael Reoch
Groups:
  - ReochFamily (Your side)
  - BarriosFamily (Spouse's side)
  - Cousins2025 (Extended family)
```

### Same Person, Different Roles
```
In "Recon2025":
  - You're the creator (can draw names)

In "WorkParty2025":
  - You're a member (waiting for draw)

In "Friends2025":
  - You're the creator (can draw names)
```

## Technical Details

### Data Storage

**Before (Single Group):**
```javascript
localStorage.secretSantaSession = {
  groupId: "abc123",
  groupCode: "Recon2025",
  participantName: "Michael"
}
```

**After (Multiple Groups):**
```javascript
localStorage.secretSantaSessions = [
  {
    groupId: "abc123",
    groupCode: "Recon2025",
    participantName: "Michael",
    isCreator: true
  },
  {
    groupId: "xyz789",
    groupCode: "WorkParty2025",
    participantName: "Michael",
    isCreator: false
  }
]

localStorage.currentGroupId = "abc123"
```

### Features

- ✅ **Unlimited Groups**: Join as many as you want
- ✅ **Instant Switching**: Dropdown switches groups without reload
- ✅ **Persistent**: All groups saved in browser
- ✅ **Independent**: Each group has its own draw, assignments, participants
- ✅ **Smart Logout**: Choose to leave one or all groups
- ✅ **Session Management**: Tracks which group you're currently viewing

### Real-time Updates

Each group maintains its own:
- Participant list
- Draw status
- Assignment
- Admin controls

Real-time updates work independently for each group!

## User Experience

### Group Selector UI

The selector appears as a **golden banner** at the top of the dashboard when you're in 2+ groups:

```
┌────────────────────────────────────────────┐
│ 🌟 Switch Group: [Recon2025] ▼ 🌟        │
├────────────────────────────────────────────┤
│ Welcome, Michael Reoch!                    │
│ Group Code: Recon2025                      │
└────────────────────────────────────────────┘
```

### Buttons

**Join Another Group**
- Visible on every dashboard
- Returns to join form
- Doesn't clear existing sessions

**Leave Group**
- Smart behavior based on number of groups
- Confirms before leaving
- Switches to another group if available

## Testing

Try this scenario:

1. Join "test group 1" as Michael
2. Click "Join Another Group"
3. Join "test group 2" as Michael
4. See the group selector appear!
5. Switch between groups using dropdown
6. Each group shows different participants
7. Try leaving one group
8. See it switch to the other automatically

## Future Enhancements

Potential improvements:
- Badge showing number of groups
- Quick stats for each group
- Notification if any group completes draw
- Export/import group sessions
- Share group codes easily

