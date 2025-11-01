-- Add email to user_profiles for easier invite matching
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update existing profiles with emails from auth.users
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id AND up.email IS NULL;

