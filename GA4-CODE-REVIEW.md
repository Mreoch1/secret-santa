# GA4 Event Code Review

## Current Implementation

Here's the actual GA4 event firing code from `analytics.js`:

### Event Structure

All events automatically include `device_type` and `user_type` via `_enrichParams()`:

```javascript
// Helper to enrich event params with device_type and user_type
_enrichParams: function(params = {}) {
    if (window._analyticsHelpers) {
        return window._analyticsHelpers.enrichEventParams(params);
    }
    return params;
}
```

### Key Events

#### 1. signup_completed (Conversion)
```javascript
signupCompleted: function() {
    if (window.gtag) {
        // Update user type to logged_in
        this.updateUserType(true);
        gtag('event', 'signup_completed', this._enrichParams({
            event_category: 'conversion',
            event_label: 'Signup Completed',
            value: 1
        }));
    }
}
```
**Parameters sent:**
- `event_category`: "conversion"
- `event_label`: "Signup Completed"
- `value`: 1
- `device_type`: "mobile" | "desktop" (auto-added)
- `user_type`: "logged_in" (updated before event)

#### 2. create_group (Conversion)
```javascript
createGroup: function(groupCode) {
    if (window.gtag) {
        gtag('event', 'create_group', this._enrichParams({
            event_category: 'engagement',
            event_label: 'Group Created',
            value: 1,
            group_code: groupCode || null
        }));
    }
}
```
**Parameters sent:**
- `event_category`: "engagement"
- `event_label`: "Group Created"
- `value`: 1
- `group_code`: string | null
- `device_type`: "mobile" | "desktop" (auto-added)
- `user_type`: "logged_in" | "anonymous" (auto-added)

#### 3. draw_names (Conversion)
```javascript
drawNames: function(participantCount) {
    if (window.gtag) {
        gtag('event', 'draw_names', this._enrichParams({
            event_category: 'engagement',
            event_label: 'Names Drawn',
            value: participantCount,
            participant_count: participantCount
        }));
    }
}
```
**Parameters sent:**
- `event_category`: "engagement"
- `event_label`: "Names Drawn"
- `value`: participantCount (number)
- `participant_count`: participantCount (number)
- `device_type`: "mobile" | "desktop" (auto-added)
- `user_type`: "logged_in" | "anonymous" (auto-added)

#### 4. invite_sent (Conversion - optional)
```javascript
inviteSent: function(count = 1) {
    if (window.gtag) {
        gtag('event', 'invite_sent', this._enrichParams({
            event_category: 'engagement',
            event_label: 'Invite Sent',
            value: count,
            invite_count: count
        }));
    }
}
```
**Parameters sent:**
- `event_category`: "engagement"
- `event_label`: "Invite Sent"
- `value`: count (number)
- `invite_count`: count (number)
- `device_type`: "mobile" | "desktop" (auto-added)
- `user_type`: "logged_in" | "anonymous" (auto-added)

#### 5. login
```javascript
signIn: function(method = 'email') {
    if (window.gtag) {
        // Update user type to logged_in
        this.updateUserType(true);
        gtag('event', 'login', this._enrichParams({
            method: method
        }));
    }
}
```
**Parameters sent:**
- `method`: "email"
- `device_type`: "mobile" | "desktop" (auto-added)
- `user_type`: "logged_in" (updated before event)

### User Type Management

```javascript
updateUserType: function(isLoggedIn) {
    if (window.gtag && window._analyticsHelpers) {
        const userType = isLoggedIn ? 'logged_in' : 'anonymous';
        gtag('set', { 'user_properties': {
            'user_type': userType
        }});
        // Update the helper function's return value
        window._analyticsHelpers.getUserType = () => userType;
    }
}
```

**Called from:**
- `auth.js`: On successful sign in
- `auth.js`: On successful signup (if session created)
- `dashboard.js`: On page load if user is authenticated

## ✅ Implementation Validation

### 1. Device Type ✅
- **Status**: CORRECT
- **Implementation**: Attached as event parameter on every event
- **No standalone event**: No polluting device_tracking event
- **User property**: Also set as user property (optional, for user-level reporting)

### 2. User Type ✅
- **Status**: CORRECT
- **Implementation**: Uses "logged_in" vs "anonymous" (not localStorage new/returning)
- **Updates dynamically**: `updateUserType()` called on auth state changes
- **User property**: Set as user property for user-level reporting
- **Event parameter**: Included on every event

### 3. Event Parameters ✅
- All events include `device_type` and `user_type`
- Event-specific parameters included (e.g., `invite_count`, `participant_count`, `group_code`)
- No redundant parameters

## 📊 Recommended Custom Dimensions

Register these in GA4 → Admin → Custom definitions:

1. **device_type** (Event-scoped)
   - Description: Device type (mobile/desktop)
   - Already sent on all events

2. **user_type** (Event-scoped)
   - Description: User authentication status (logged_in/anonymous)
   - Already sent on all events

3. **invite_count** (Event-scoped, optional)
   - Description: Number of invites sent in batch
   - Only on `invite_sent` events

4. **participant_count** (Event-scoped, optional)
   - Description: Number of participants in name draw
   - Only on `draw_names` events

5. **group_code** (Event-scoped, optional)
   - Description: Group code for create_group events
   - Only on `create_group` events

## 🎯 Recommended Conversions

Mark these in GA4 → Admin → Events → Mark as conversion:

- ✅ **signup_completed** - Primary conversion
- ✅ **create_group** - Key engagement milestone
- ✅ **draw_names** - Core product action
- ⚠️ **invite_sent** - Optional (can inflate conversion rate if users send multiple)

## 🔍 Validation Checklist

- [ ] DebugView: All events appear with correct parameters
- [ ] Realtime: Events appear within seconds
- [ ] Network: Requests to `google-analytics.com/g/collect` return 200/204
- [ ] Custom dimensions registered in GA4
- [ ] Conversions marked in GA4
- [ ] User properties visible in user reports

