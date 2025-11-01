-- Allow group creators to edit profiles of participants in their groups
-- This lets creators fix typos in spouse names before drawing

DROP POLICY IF EXISTS "authenticated_update_own_profile" ON public.user_profiles;

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Group creators can update profiles of participants in their groups
CREATE POLICY "creators_update_participant_profiles" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (
        -- Can update profiles of participants in groups you created
        id IN (
            SELECT p.user_id
            FROM participants p
            JOIN groups g ON g.id = p.group_id
            JOIN participants creator ON creator.id = g.created_by
            WHERE creator.user_id = auth.uid()
        )
    )
    WITH CHECK (
        -- Same check for the updated values
        id IN (
            SELECT p.user_id
            FROM participants p
            JOIN groups g ON g.id = p.group_id
            JOIN participants creator ON creator.id = g.created_by
            WHERE creator.user_id = auth.uid()
        )
    );

