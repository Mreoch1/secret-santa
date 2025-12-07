-- Fix function search_path security warnings
-- Functions need SET search_path to prevent search_path injection attacks

-- Fix delete_user_account function
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    deleted_count jsonb;
BEGIN
    -- Initialize counter
    deleted_count := jsonb_build_object(
        'wishlists', 0,
        'assignments', 0,
        'participants', 0,
        'profile', 0
    );
    
    -- 1. Delete wishlist items
    WITH deleted_wishlists AS (
        DELETE FROM public.wishlists
        WHERE participant_id IN (
            SELECT id FROM public.participants WHERE user_id = user_id_to_delete
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count->'wishlists' FROM deleted_wishlists;
    
    -- 2. Delete assignments where user is giver or receiver
    WITH deleted_assignments AS (
        DELETE FROM public.assignments
        WHERE giver_id IN (
            SELECT id FROM public.participants WHERE user_id = user_id_to_delete
        ) OR receiver_id IN (
            SELECT id FROM public.participants WHERE user_id = user_id_to_delete
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count->'assignments' FROM deleted_assignments;
    
    -- 3. Delete invites sent by user
    DELETE FROM public.group_invites
    WHERE sent_by = user_id_to_delete;
    
    -- 4. Delete participant records
    WITH deleted_participants AS (
        DELETE FROM public.participants
        WHERE user_id = user_id_to_delete
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count->'participants' FROM deleted_participants;
    
    -- 5. Delete user profile
    DELETE FROM public.user_profiles
    WHERE id = user_id_to_delete;
    
    deleted_count := deleted_count || jsonb_build_object('profile', 1);
    
    -- Note: auth.users deletion must be done via Supabase Admin API
    -- This function handles all public schema cleanup
    
    RETURN deleted_count;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

-- Verify functions have search_path set
DO $$
DECLARE
    func_search_path TEXT;
BEGIN
    -- Check delete_user_account
    SELECT proconfig::text INTO func_search_path
    FROM pg_proc
    WHERE proname = 'delete_user_account'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF func_search_path IS NULL OR func_search_path !~ 'search_path' THEN
        RAISE WARNING 'delete_user_account search_path not set correctly';
    ELSE
        RAISE NOTICE 'delete_user_account search_path: %', func_search_path;
    END IF;
    
    -- Check update_updated_at_column
    SELECT proconfig::text INTO func_search_path
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF func_search_path IS NULL OR func_search_path !~ 'search_path' THEN
        RAISE WARNING 'update_updated_at_column search_path not set correctly';
    ELSE
        RAISE NOTICE 'update_updated_at_column search_path: %', func_search_path;
    END IF;
END $$;

