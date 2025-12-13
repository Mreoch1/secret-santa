# GA4 Validation and Setup Guide

This guide helps you validate that GA4 is working correctly and configure it for optimal reporting.

## ✅ Implementation Fixes Applied

### 1. Device Type Tracking
- **Fixed**: Device type is now attached as an event parameter (`device_type`) on every event
- **Removed**: Standalone device tracking event that was polluting reports
- **Implementation**: `device_type` is automatically added to all events via `_enrichParams()`

### 2. User Type Tracking
- **Fixed**: Changed from localStorage-based "new/returning" to "logged_in/anonymous"
- **Implementation**: 
  - `user_type` is set to `anonymous` by default
  - Updated to `logged_in` when user signs in via `Analytics.updateUserType(true)`
  - Also sent as event parameter on every event

## 📊 GA4 Event Structure

All events now include these parameters automatically:
- `device_type`: "mobile" or "desktop"
- `user_type`: "logged_in" or "anonymous"

### Key Events Being Tracked:

1. **signup_completed** (Conversion)
   - Parameters: `method`, `device_type`, `user_type`
   - Fired: After successful account creation with session

2. **create_group** (Conversion)
   - Parameters: `event_category`, `event_label`, `value`, `group_code`, `device_type`, `user_type`
   - Fired: When user creates a new Secret Santa group

3. **draw_names** (Conversion)
   - Parameters: `event_category`, `event_label`, `value`, `participant_count`, `device_type`, `user_type`
   - Fired: When organizer draws names

4. **invite_sent** (Conversion - optional)
   - Parameters: `event_category`, `event_label`, `value`, `invite_count`, `device_type`, `user_type`
   - Fired: When invites are sent (batch count)

5. **login**
   - Parameters: `method`, `device_type`, `user_type` (updated to "logged_in")
   - Fired: On successful sign in

6. **join_group**
   - Parameters: `event_category`, `event_label`, `value`, `device_type`, `user_type`
   - Fired: When user joins a group

## 🔍 Validation Steps

### 1. GA4 DebugView

1. Open GA4 → **Admin** → **DebugView**
2. Enable debug mode in your browser:
   - Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) extension
   - Or add `?debug_mode=true` to your URL
3. Trigger each action:
   - Sign up → Should see `signup_completed` event
   - Create group → Should see `create_group` with `group_code` parameter
   - Send invites → Should see `invite_sent` with `invite_count` parameter
   - Draw names → Should see `draw_names` with `participant_count` parameter
4. Verify each event shows:
   - `device_type`: "mobile" or "desktop"
   - `user_type`: "logged_in" or "anonymous"
   - Event-specific parameters (e.g., `invite_count`, `participant_count`)

### 2. Realtime Report

1. GA4 → **Reports** → **Realtime**
2. Perform actions on your site
3. Confirm events appear within seconds
4. Check that new SEO pages show up in pageviews:
   - `/free-secret-santa-generator`
   - `/online-secret-santa-draw`
   - `/secret-santa-without-email-signup`

### 3. Network Validation

1. Open browser DevTools → **Network** tab
2. Filter by: `collect` or `google-analytics.com`
3. Perform actions on your site
4. Look for requests to: `https://www.google-analytics.com/g/collect`
5. Verify:
   - Requests return `200` or `204` status
   - Request payload includes event names and parameters
   - No CORS errors

## ⚙️ GA4 Configuration Steps

### 1. Register Custom Dimensions

**Admin** → **Custom definitions** → **Create custom dimension**

Create these **Event-scoped** dimensions:

1. **device_type**
   - Scope: Event
   - Description: Device type (mobile/desktop)

2. **user_type**
   - Scope: Event
   - Description: User authentication status (logged_in/anonymous)

3. **invite_count** (optional)
   - Scope: Event
   - Description: Number of invites sent in batch

4. **participant_count** (optional)
   - Scope: Event
   - Description: Number of participants in name draw

5. **group_code** (optional)
   - Scope: Event
   - Description: Group code for create_group events

**Note**: Without registering these, parameters exist but won't be reportable in GA4 UI.

### 2. Mark Conversions

**Admin** → **Events** → Mark as conversion:

- ✅ **signup_completed** - Primary conversion
- ✅ **create_group** - Key engagement milestone
- ✅ **draw_names** - Core product action
- ⚠️ **invite_sent** - Optional (can inflate conversion rate if users send multiple invites)

### 3. Create Custom Reports

**Explore** → **Create new exploration**

**Suggested Reports:**

1. **Conversion Funnel**
   - Dimensions: `user_type`, `device_type`
   - Metrics: `signup_completed`, `create_group`, `draw_names`
   - Shows conversion by user type and device

2. **Device Breakdown**
   - Dimensions: `device_type`
   - Metrics: All key events
   - Shows mobile vs desktop behavior

3. **User Engagement**
   - Dimensions: `user_type`
   - Metrics: `create_group`, `join_group`, `draw_names`
   - Compares logged_in vs anonymous behavior

## 🔧 Code Review

Here's the current GA4 event code structure:

```javascript
// All events automatically enriched with device_type and user_type
Analytics.signupCompleted() // Adds: device_type, user_type
Analytics.createGroup(code)  // Adds: device_type, user_type, group_code
Analytics.drawNames(count)   // Adds: device_type, user_type, participant_count
Analytics.inviteSent(count)  // Adds: device_type, user_type, invite_count
Analytics.signIn()           // Updates user_type to "logged_in", then fires event
```

**Key Implementation Details:**
- `_enrichParams()` automatically adds `device_type` and `user_type` to all events
- `updateUserType()` is called on sign in/signup to update user property
- No standalone device tracking events (prevents report pollution)

## 📝 SEO Page Validation

Verify each new SEO page has:

- ✅ Unique title tag
- ✅ Unique meta description
- ✅ Canonical URL pointing to itself
- ✅ Internal link back to main generator page
- ✅ Included in `sitemap.xml`
- ✅ Not blocked by `robots.txt`

**Pages to check:**
- `/free-secret-santa-generator`
- `/online-secret-santa-draw`
- `/secret-santa-without-email-signup`

## 🚨 Common Issues

1. **Events not appearing in DebugView**
   - Check browser console for errors
   - Verify GA4 Measurement ID is correct
   - Ensure you're on production domain (holidaydrawnames.com)

2. **Parameters not showing in reports**
   - Must register as custom dimensions first
   - Wait 24-48 hours for data to populate

3. **user_type always showing "anonymous"**
   - Check that `Analytics.updateUserType(true)` is called on sign in
   - Verify auth.js and dashboard.js are calling it correctly

4. **Network requests failing**
   - Check CORS settings
   - Verify ad blockers aren't blocking GA
   - Check browser console for errors

## 📈 Next Steps

1. **Validate in DebugView** - Confirm all events fire with correct parameters
2. **Check Realtime** - Verify events appear within seconds
3. **Register Custom Dimensions** - Make parameters reportable
4. **Mark Conversions** - Set up conversion tracking
5. **Create Reports** - Build custom explorations for insights
6. **Monitor for 24-48 hours** - Let data accumulate before making decisions

