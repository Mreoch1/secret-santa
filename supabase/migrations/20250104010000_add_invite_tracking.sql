-- Create table to track sent invites
CREATE TABLE IF NOT EXISTS group_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE(group_id, email)
);

-- Enable RLS
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view invites for their groups" ON group_invites
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM participants 
            WHERE participants.group_id = group_invites.group_id 
            AND participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Group creators can manage invites" ON group_invites
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM groups 
            WHERE groups.id = group_invites.group_id 
            AND groups.created_by = auth.uid()
        )
    );

-- Index for performance
CREATE INDEX idx_group_invites_group_id ON group_invites(group_id);
CREATE INDEX idx_group_invites_email ON group_invites(email);

