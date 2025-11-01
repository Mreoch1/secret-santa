-- Complete fix for user_profiles RLS - remove ALL old policies and create fresh ones
-- This ensures profiles can be viewed by all authenticated users (needed for Secret Santa)

-- Drop ALL existing policies on user_profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles' AND schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.user_profiles';
    END LOOP;
END $$;

-- Create new simple policies

-- SELECT: Everyone can view all profiles (needed to see participant names)
CREATE POLICY "authenticated_select_profiles" ON public.user_profiles
    FOR SELECT TO authenticated 
    USING (true);

-- INSERT: Users can only create their own profile
CREATE POLICY "authenticated_insert_own_profile" ON public.user_profiles
    FOR INSERT TO authenticated 
    WITH CHECK (id = auth.uid());

-- UPDATE: Users can only update their own profile
CREATE POLICY "authenticated_update_own_profile" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- DELETE: Users can only delete their own profile
CREATE POLICY "authenticated_delete_own_profile" ON public.user_profiles
    FOR DELETE TO authenticated 
    USING (id = auth.uid());

