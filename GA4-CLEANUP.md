# GA4 Cleanup - Final Adjustments

## ✅ Changes Applied

### 1. Removed event_category and event_label
- **Removed from all events**: `event_category` and `event_label` are UA-style and not used in GA4 standard reporting
- **Kept**: Event names and meaningful parameters only

### 2. Fixed value usage
- **create_group**: Removed `value` (not needed)
- **draw_names**: Removed `value` (use `participant_count` param instead)
- **invite_sent**: Removed `value` (use `invite_count` param instead)
- **signup_completed**: Removed `value` (not needed)
- **join_group**: Removed `value` (not needed)
- **send_email**: Removed `value` (not needed)

### 3. Fixed user_id timing
- **Set BEFORE events fire**: `updateUserType()` now sets `user_id` before calling event tracking
- **Added delays**: Small 100ms delays after setting user_id to ensure it's applied before events fire
- **Proper attribution**: Ensures first post-login events are attributed to the user

### 4. Custom Dimensions (Register These)
- ✅ **device_type** (Event-scoped)
- ✅ **user_type** (Event-scoped)
- ✅ **participant_count** (Event-scoped)
- ✅ **invite_count** (Event-scoped)

### 5. Conversions (Mark These)
- ✅ **signup_completed**
- ✅ **create_group**
- ✅ **draw_names**
- ⚠️ **invite_sent** - Keep as funnel step (deduplicated, not conversion)

## 📊 Current Event Structure

### gtag Initialization
```javascript
gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID, {
    'anonymize_ip': true,
    'cookie_flags': 'SameSite=None;Secure',
    'send_page_view': true
    // user_id set later via updateUserType() when user logs in
});
```

### create_group
```javascript
gtag('event', 'create_group', {
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
});
```

### draw_names
```javascript
gtag('event', 'draw_names', {
    participant_count: participantCount,
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
});
```

### invite_sent
```javascript
gtag('event', 'invite_sent', {
    invite_count: count,
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
});
```

### signup_completed
```javascript
// user_id set BEFORE this event fires
gtag('event', 'signup_completed', {
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in'  // Updated before event
});
```

### login
```javascript
// user_id set BEFORE this event fires
gtag('event', 'login', {
    method: 'email',
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in'  // Updated before event
});
```

## 🔍 User ID Attribution Flow

1. **User logs in** → `auth.js` calls `Analytics.updateUserType(true, userId)`
2. **updateUserType()** sets `gtag('set', { 'user_id': userId })`
3. **100ms delay** ensures user_id is applied
4. **Event fires** → `Analytics.signIn()` or `Analytics.signupCompleted()`
5. **Event includes user_id** → Proper attribution

## ✅ Validation Checklist

- [x] Removed event_category and event_label from all events
- [x] Removed value from all events (not using counts as value)
- [x] user_id set BEFORE events fire (with delay)
- [x] Only meaningful parameters included
- [x] No PII in events
- [x] Deduplication on invite_sent

## 📝 Privacy Policy Note

Ensure your privacy policy discloses:
- Use of Google Analytics
- Analytics identifiers (user_id, device identifiers)
- Data collection and processing
- User rights (opt-out, data deletion)

