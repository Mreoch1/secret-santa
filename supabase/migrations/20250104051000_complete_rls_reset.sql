-- Complete reset of participants RLS policies to fix infinite recursion
-- Drop ALL existing policies completely

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'participants' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.participants';
    END LOOP;
END $$;

-- Create simple, non-recursive policies

-- SELECT: Anyone authenticated can view participants
CREATE POLICY "select_participants" ON public.participants
    FOR SELECT TO authenticated 
    USING (true);

-- INSERT: Users can only insert themselves
CREATE POLICY "insert_participants" ON public.participants
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- DELETE: Users can delete themselves, OR delete if they created the group
CREATE POLICY "delete_participants" ON public.participants
    FOR DELETE TO authenticated 
    USING (
        user_id = auth.uid()  -- Can delete self
        OR
        EXISTS (  -- OR is group creator
            SELECT 1 FROM groups
            WHERE groups.id = participants.group_id
            AND groups.created_by = participants.id
            AND participants.user_id != auth.uid()  -- Prevent deleting self this way
        )
    );

