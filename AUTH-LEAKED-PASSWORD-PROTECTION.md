# Enable Leaked Password Protection

## Security Warning
The Supabase database linter detected that **Leaked Password Protection** is currently disabled.

## What is Leaked Password Protection?
Supabase Auth can prevent users from using compromised passwords by checking against HaveIBeenPwned.org. This enhances security by blocking passwords that have been exposed in data breaches.

**How it works:**
- When a user tries to set a password, Supabase checks it against the HaveIBeenPwned.org database
- If the password has been found in a data breach, the signup/password reset is rejected
- User must choose a different, more secure password

## Plan Requirement
⚠️ **Note**: Leaked Password Protection is available on **Pro Plan and above**. If you're on the free plan, you'll need to upgrade to access this feature.

## How to Enable

This setting **cannot be changed via database migration or API**. It must be enabled in the Supabase Dashboard.

### Step-by-Step Instructions:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Log in to your account

2. **Select Your Project**
   - Click on the project: `holiday-draw-names` (or your project name)

3. **Navigate to Authentication Settings**
   - In the left sidebar, click **Authentication**
   - Click **Settings** (or look for **Password Security** section)

4. **Find Password Security Section**
   - Scroll down to find **Password Security** settings
   - You'll see options for:
     - Minimum password length
     - Password requirements (letters, digits, symbols)
     - **Leaked Password Protection** ← This is what we need

5. **Enable Leaked Password Protection**
   - Toggle the **"Leaked Password Protection"** switch to **Enabled**
   - The setting should turn green/active

6. **Save Changes**
   - Changes are typically saved automatically
   - If there's a "Save" button, click it

### Visual Guide:
```
Dashboard → Authentication → Settings → Password Security → Leaked Password Protection [ON]
```

### Documentation
- [Supabase Password Security Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3#PwnedPasswords)

## Status
⚠️ **Action Required**: 
1. Verify your Supabase plan (Pro or above required)
2. Enable this feature in the Supabase Dashboard
3. Test by trying to sign up with a known compromised password (e.g., "password123")

## Testing
After enabling, you can test that it's working:
1. Try to sign up with a known compromised password
2. You should see an error message indicating the password has been leaked
3. The signup should be rejected

## Benefits
- ✅ Prevents users from using passwords found in data breaches
- ✅ Enhances overall account security
- ✅ Reduces risk of credential stuffing attacks
- ✅ Free service (uses HaveIBeenPwned.org API)

