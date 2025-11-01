-- Temporarily DISABLE RLS on user_profiles to test if that's the issue
-- This will help us see if RLS is the problem or something else

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Note: This makes all profiles readable by anyone authenticated
-- We'll add proper RLS back after confirming this fixes it

