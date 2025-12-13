# GA4 gtag Initialization Review

## Current gtag Initialization Snippet

```javascript
// analytics.js lines 48-64
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Initial config (user_id will be set later when user logs in)
gtag('config', GA_MEASUREMENT_ID, {
    'anonymize_ip': true, // GDPR compliance
    'cookie_flags': 'SameSite=None;Secure',
    'send_page_view': true
    // user_id set later via updateUserType() when user logs in
});

// Set user property for device type (optional - also sent as event param)
gtag('set', { 'user_properties': {
    'device_type': getDeviceType()
}});
```

## User ID Setting Flow

### On Login (auth.js)
```javascript
// 1. Set user_id BEFORE event fires
Analytics.updateUserType(true, data.user.id);

// 2. updateUserType() implementation (analytics.js lines 114-118)
gtag('set', { 
    'user_id': userId,
    'user_properties': {
        'user_type': 'logged_in'
    }
});

// 3. Small delay to ensure user_id is applied
setTimeout(() => {
    Analytics.signIn();  // Event fires with user_id already set
}, 100);
```

### On Signup (auth.js)
```javascript
// Same pattern - user_id set before signup_completed event
Analytics.updateUserType(true, authData.user.id);
setTimeout(() => {
    Analytics.signupCompleted();  // Event fires with user_id already set
}, 100);
```

### On Dashboard Load (dashboard.js)
```javascript
// User already logged in - set user_id immediately
Analytics.updateUserType(true, currentUser.id);
// No delay needed - no immediate events fire
```

## Event Structure (After Cleanup)

### create_group
```javascript
gtag('event', 'create_group', {
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
    // No event_category, event_label, or value
});
```

### draw_names
```javascript
gtag('event', 'draw_names', {
    participant_count: participantCount,  // Explicit param, not value
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
    // No event_category, event_label, or value
});
```

### invite_sent
```javascript
gtag('event', 'invite_sent', {
    invite_count: count,  // Explicit param, not value
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in' | 'anonymous'
    // No event_category, event_label, or value
    // Deduplicated per group per session
});
```

### signup_completed
```javascript
// user_id set BEFORE this event fires
gtag('event', 'signup_completed', {
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in'  // Updated before event
    // No event_category, event_label, or value
});
```

### login
```javascript
// user_id set BEFORE this event fires
gtag('event', 'login', {
    method: 'email',
    device_type: 'mobile' | 'desktop',
    user_type: 'logged_in'  // Updated before event
    // No event_category, event_label, or value
});
```

## ✅ Verification Checklist

- [x] **gtag('js', new Date())** - Correct initialization
- [x] **gtag('config', ...)** - No user_id in initial config (set later)
- [x] **gtag('set', { 'user_id': userId })** - Correct method to set user_id
- [x] **Timing**: user_id set BEFORE events fire (100ms delay ensures application)
- [x] **No event_category/event_label** - Removed from all events
- [x] **No value parameter** - Removed, using explicit params instead
- [x] **user_id cleared on logout** - gtag('set', { 'user_id': null })

## 🔍 Potential Issue to Verify

The 100ms delay should be sufficient, but to be extra safe, you could also:

**Option 1 (Current - Recommended):** Keep the 100ms delay
- Simple and reliable
- Ensures gtag('set') has processed before event fires

**Option 2 (Alternative):** Use gtag('config') with user_id
```javascript
// Instead of gtag('set'), could use:
gtag('config', GA_MEASUREMENT_ID, {
    'user_id': userId
});
```
- But this re-initializes config, which may not be ideal
- Current approach (gtag('set')) is cleaner

## 📊 Current Implementation Status

✅ **All requirements met:**
1. ✅ No event_category/event_label
2. ✅ No value parameter (using explicit params)
3. ✅ user_id set before events fire
4. ✅ user_id cleared on logout
5. ✅ Only meaningful parameters included

The current implementation is correct and follows GA4 best practices.

