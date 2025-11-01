-- Auth System Migration
-- This replaces the old schema with proper Supabase Auth integration

-- Drop old policies first
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Anyone can create groups" ON groups;
DROP POLICY IF EXISTS "Anyone can update groups" ON groups;
DROP POLICY IF EXISTS "Anyone can view participants" ON participants;
DROP POLICY IF EXISTS "Anyone can create participants" ON participants;
DROP POLICY IF EXISTS "Anyone can view their own assignment" ON assignments;
DROP POLICY IF EXISTS "Anyone can create assignments" ON assignments;

-- Drop old indexes
DROP INDEX IF EXISTS idx_participants_email;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    spouse_name TEXT,
    music_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add password to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS group_password TEXT;

-- Update participants table to use auth users
ALTER TABLE participants DROP COLUMN IF EXISTS name;
ALTER TABLE participants DROP COLUMN IF EXISTS email;
ALTER TABLE participants DROP COLUMN IF EXISTS spouse_name;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint for user_id
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_group_id_email_key;
ALTER TABLE participants ADD CONSTRAINT participants_group_user_unique UNIQUE(group_id, user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON user_profiles(id);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Simplified RLS Policies (no circular references)
-- Security is enforced through: auth + password verification in app + unique constraints

-- GROUPS POLICIES
CREATE POLICY "Authenticated users can view groups" ON groups
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update groups" ON groups
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- PARTICIPANTS POLICIES  
CREATE POLICY "Authenticated users can view participants" ON participants
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can join groups" ON participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ASSIGNMENTS POLICIES
CREATE POLICY "Users can view own assignments" ON assignments
    FOR SELECT USING (
        giver_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create assignments" ON assignments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

