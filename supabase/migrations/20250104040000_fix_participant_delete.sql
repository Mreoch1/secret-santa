-- Fix RLS policies to allow group creators to delete participants
-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage participants in their groups" ON public.participants;
DROP POLICY IF EXISTS "Users can view participants in their groups" ON public.participants;

-- Allow users to view participants in groups they're part of
CREATE POLICY "Users can view participants in their groups" ON public.participants
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM participants p2
            WHERE p2.group_id = participants.group_id
            AND p2.user_id = auth.uid()
        )
    );

-- Allow users to insert themselves as participants
CREATE POLICY "Users can join groups" ON public.participants
    FOR INSERT TO authenticated WITH CHECK (
        user_id = auth.uid()
    );

-- Allow group creators to delete any participant (except themselves during draw)
CREATE POLICY "Group creators can remove participants" ON public.participants
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM groups g
            JOIN participants p ON g.id = p.group_id
            WHERE g.id = participants.group_id
            AND g.created_by = p.id
            AND p.user_id = auth.uid()
        )
    );

-- Allow users to delete themselves from groups (leave group)
CREATE POLICY "Users can leave groups" ON public.participants
    FOR DELETE TO authenticated USING (
        user_id = auth.uid()
    );

