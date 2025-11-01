-- Fix user_profiles RLS to allow viewing other users' profiles
-- Current issue: profiles exist but frontend can't read them

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- Allow authenticated users to view ALL profiles
-- (needed for Secret Santa to show participant names)
CREATE POLICY "Authenticated users can view all profiles" ON public.user_profiles
    FOR SELECT TO authenticated 
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT TO authenticated 
    WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE TO authenticated 
    USING (id = auth.uid());

