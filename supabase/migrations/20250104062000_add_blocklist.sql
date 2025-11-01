-- Create blocklist table for managing who can't be paired together
-- Much more flexible than spouse name matching!

CREATE TABLE IF NOT EXISTS participant_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    participant_a_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    participant_b_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(group_id, participant_a_id, participant_b_id),
    -- Ensure A and B are different people
    CHECK (participant_a_id != participant_b_id)
);

-- Enable RLS
ALTER TABLE participant_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view blocks in their groups" ON participant_blocks
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM participants 
            WHERE participants.group_id = participant_blocks.group_id 
            AND participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Group creators can manage blocks" ON participant_blocks
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM groups g
            JOIN participants p ON g.created_by = p.id
            WHERE g.id = participant_blocks.group_id
            AND p.user_id = auth.uid()
        )
    );

-- Index for performance
CREATE INDEX idx_participant_blocks_group_id ON participant_blocks(group_id);
CREATE INDEX idx_participant_blocks_participant_a ON participant_blocks(participant_a_id);
CREATE INDEX idx_participant_blocks_participant_b ON participant_blocks(participant_b_id);

