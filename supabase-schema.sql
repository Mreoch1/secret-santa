-- Secret Santa Database Schema
-- Run this in your Supabase SQL Editor

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

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code TEXT UNIQUE NOT NULL,
    is_drawn BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Participants Table (now references auth users)
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
    giver_id UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(giver_id),
    CHECK (giver_id != receiver_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_participants_group_id ON participants(group_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_assignments_group_id ON assignments(group_id);
CREATE INDEX IF NOT EXISTS idx_assignments_giver_id ON assignments(giver_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(group_code);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Groups
CREATE POLICY "Users can view groups they're in" ON groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM participants 
            WHERE participants.group_id = groups.id 
            AND participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Group creators can update groups" ON groups
    FOR UPDATE USING (created_by IN (
        SELECT id FROM participants WHERE user_id = auth.uid()
    ));

-- RLS Policies for Participants
CREATE POLICY "Users can view participants in their groups" ON participants
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can join groups" ON participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Assignments
CREATE POLICY "Users can view their own assignments" ON assignments
    FOR SELECT USING (
        giver_id IN (
            SELECT id FROM participants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Group creators can create assignments" ON assignments
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT g.id FROM groups g
            JOIN participants p ON p.id = g.created_by
            WHERE p.user_id = auth.uid()
        )
    );

