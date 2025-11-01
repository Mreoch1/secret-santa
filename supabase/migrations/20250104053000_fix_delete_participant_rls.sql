-- Fix the participant deletion RLS policy
-- The current policy logic is backwards!

DROP POLICY IF EXISTS "delete_participants" ON public.participants;

-- New correct policy: Allow deletion if user is the creator of the group
CREATE POLICY "delete_participants" ON public.participants
    FOR DELETE TO authenticated 
    USING (
        -- Can delete yourself
        user_id = auth.uid()
        OR
        -- OR you are the creator of this group
        group_id IN (
            SELECT g.id 
            FROM groups g
            JOIN participants p ON p.id = g.created_by
            WHERE p.user_id = auth.uid()
            AND g.id = participants.group_id
        )
    );

