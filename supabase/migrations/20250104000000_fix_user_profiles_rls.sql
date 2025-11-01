-- Fix user_profiles RLS policy to allow signup

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create policy that allows authenticated users to insert their own profile
-- This works during signup when auth.uid() is set
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add ALL policy to allow reading own profile with any operation
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

CREATE POLICY "Users can manage own profile" ON user_profiles
    FOR ALL USING (auth.uid() = id);

