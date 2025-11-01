-- Nuclear option: Complete reset of user_profiles RLS with SIMPLEST possible policies
-- Current issue: SELECT is returning empty objects {}

-- Drop EVERYTHING
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_profiles';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Disable RLS temporarily to verify it's the issue
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create the SIMPLEST possible policies

-- SELECT: Any authenticated user can read ANY profile
CREATE POLICY "public_select_profiles" 
    ON public.user_profiles
    FOR SELECT 
    TO authenticated
    USING (true);

-- INSERT: Only to your own profile
CREATE POLICY "public_insert_own_profile" 
    ON public.user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- UPDATE: To your own profile OR if you're a group creator of a group they're in
CREATE POLICY "public_update_profiles" 
    ON public.user_profiles
    FOR UPDATE 
    TO authenticated
    USING (
        id = auth.uid()  -- Your own profile
        OR
        id IN (  -- Or profiles of people in your groups
            SELECT p.user_id
            FROM participants p
            WHERE p.group_id IN (
                SELECT g.id 
                FROM groups g
                WHERE g.created_by IN (
                    SELECT p2.id 
                    FROM participants p2 
                    WHERE p2.user_id = auth.uid()
                )
            )
        )
    );

-- DELETE: Only your own
CREATE POLICY "public_delete_own_profile" 
    ON public.user_profiles
    FOR DELETE 
    TO authenticated
    USING (id = auth.uid());

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;

