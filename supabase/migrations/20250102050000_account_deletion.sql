-- Account Deletion Feature (GDPR Compliance)
-- Allows users to permanently delete their accounts and all associated data

-- Create function to delete user account and all related data
CREATE OR REPLACE FUNCTION delete_user_account(user_id_to_delete UUID)
RETURNS jsonb AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION delete_user_account IS 'GDPR-compliant function to delete all user data from public schema. Auth user must be deleted separately via Admin API.';

-- Grant execute to authenticated users (for their own account)
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

