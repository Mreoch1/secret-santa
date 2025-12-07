-- Enable RLS on user_profiles table
-- This fixes the security linter errors:
-- - policy_exists_rls_disabled
-- - rls_disabled_in_public

-- Ensure RLS is enabled on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'user_profiles'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS was not successfully enabled on user_profiles';
    END IF;
END $$;

-- Verify policies exist (they should from previous migrations)
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles';
    
    IF policy_count = 0 THEN
        RAISE WARNING 'No RLS policies found on user_profiles. Policies should be created separately.';
    ELSE
        RAISE NOTICE 'Found % policies on user_profiles', policy_count;
    END IF;
END $$;

