-- Secret Santa Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code TEXT UNIQUE NOT NULL,
    is_drawn BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Participants Table
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    spouse_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(group_id, email)
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
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Groups
CREATE POLICY "Anyone can view groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create groups" ON groups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update groups" ON groups
    FOR UPDATE USING (true);

-- RLS Policies for Participants
CREATE POLICY "Anyone can view participants" ON participants
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create participants" ON participants
    FOR INSERT WITH CHECK (true);

-- RLS Policies for Assignments
CREATE POLICY "Anyone can view their own assignment" ON assignments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create assignments" ON assignments
    FOR INSERT WITH CHECK (true);

