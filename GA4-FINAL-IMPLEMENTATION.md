# GA4 Final Implementation - Exact Code

## Current gtag Initialization Block

```javascript
// analytics.js lines 48-64
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', GA_MEASUREMENT_ID, {
    'anonymize_ip': true, // GDPR compliance
    'cookie_flags': 'SameSite=None;Secure',
    'send_page_view': true
    // user_id set later via updateUserType() when user logs in
});

// Set user property for device type
gtag('set', { 'user_properties': {
    'device_type': getDeviceType()
}});

// Store GA_MEASUREMENT_ID globally for use in updateUserType
window.GA_MEASUREMENT_ID = GA_MEASUREMENT_ID;
```

## Login Handler (auth.js)

```javascript
// auth.js lines 109-117
// Update analytics user type and user_id BEFORE tracking login event
// CRITICAL: user_id must be set via gtag('config') before events fire
if (window.Analytics) {
    // Set user_id via gtag('config') - this ensures attribution
    Analytics.updateUserType(true, data.user.id);
    // Small delay to ensure user_id is applied before event fires
    setTimeout(() => {
        Analytics.signIn();
    }, 100);
}
```

## Signup Handler (auth.js)

```javascript
// auth.js lines 193-199
// Update analytics user type and user_id BEFORE tracking signup_completed
// This ensures user_id is set before the conversion event fires
Analytics.updateUserType(true, authData.user.id);
// Small delay to ensure user_id is set before event fires
setTimeout(() => {
    Analytics.signupCompleted();
}, 100);
```

## Logout Handlers

### Dashboard Logout (dashboard.js)
```javascript
// dashboard.js lines 1848-1851
document.getElementById('logoutBtn').addEventListener('click', async () => {
    // Clear analytics user_id before signing out
    if (window.Analytics) {
        Analytics.updateUserType(false);
    }
    await supabase.auth.signOut();
    window.location.href = 'auth.html';
});
```

### Profile Logout (profile.js)
```javascript
// profile.js lines 172-174
// Clear analytics user_id before signing out
if (window.Analytics) {
    Analytics.updateUserType(false);
}
// Sign out
await supabase.auth.signOut();
```

## updateUserType() Implementation

```javascript
// analytics.js lines 103-133
updateUserType: function(isLoggedIn, userId = null) {
    if (window.gtag && window._analyticsHelpers && window.GA_MEASUREMENT_ID) {
        const userType = isLoggedIn ? 'logged_in' : 'anonymous';
        
        // Set user_id via gtag('config') - this is the recommended method
        if (isLoggedIn && userId) {
            gtag('config', window.GA_MEASUREMENT_ID, { 
                'user_id': userId
            });
            gtag('set', { 
                'user_properties': { 
                    'user_type': userType 
                }
            });
        } else if (!isLoggedIn) {
            // Clear user_id when logged out
            gtag('config', window.GA_MEASUREMENT_ID, { 
                'user_id': null
            });
            gtag('set', { 
                'user_properties': { 
                    'user_type': userType 
                }
            });
        } else {
            // Just update user properties if no user_id change
            gtag('set', { 
                'user_properties': { 
                    'user_type': userType 
                }
            });
        }
        
        // Update the helper function's return value
        window._analyticsHelpers.getUserType = () => userType;
    }
}
```

## Event Calls (Exact Format)

### create_group
```javascript
// analytics.js lines 167-174
createGroup: function(groupCode) {
    if (window.gtag) {
        const params = this._enrichParams({});
        gtag('event', 'create_group', {
            device_type: params.device_type,
            user_type: params.user_type
        });
    }
}
```

### draw_names
```javascript
// analytics.js lines 186-193
drawNames: function(participantCount) {
    if (window.gtag) {
        const params = this._enrichParams({});
        gtag('event', 'draw_names', {
            participant_count: participantCount,
            device_type: params.device_type,
            user_type: params.user_type
        });
    }
}
```

### invite_sent
```javascript
// analytics.js lines 208-224
inviteSent: function(count = 1, groupId = null) {
    if (window.gtag) {
        // Deduplicate: only track once per group per session
        const sessionKey = `invite_sent_${groupId || 'default'}`;
        if (sessionStorage.getItem(sessionKey)) {
            return; // Already tracked
        }
        sessionStorage.setItem(sessionKey, 'true');
        
        const params = this._enrichParams({});
        gtag('event', 'invite_sent', {
            invite_count: count,
            device_type: params.device_type,
            user_type: params.user_type
        });
    }
}
```

## ✅ Implementation Status

- [x] **gtag init**: Correct format, user_id set later
- [x] **user_id on login**: Set via `gtag('config', ...)` before events fire
- [x] **user_id on logout**: Cleared via `gtag('config', ..., { user_id: null })`
- [x] **Event format**: Exact match - no event_category, event_label, or value
- [x] **Timing**: 100ms delay ensures user_id is applied before events
- [x] **Logout handlers**: Both dashboard and profile clear user_id

## 📊 Custom Dimensions to Register

1. **device_type** (Event-scoped)
2. **user_type** (Event-scoped)
3. **participant_count** (Event-scoped)
4. **invite_count** (Event-scoped)

## 🎯 Conversions to Mark

- ✅ **signup_completed**
- ✅ **create_group**
- ✅ **draw_names**
- ⚠️ **invite_sent** - Keep as funnel step (not conversion)

