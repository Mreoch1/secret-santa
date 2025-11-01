-- Find and fix any participants without user profiles
-- This ensures all participants have a profile entry

DO $$
DECLARE
    participant_record RECORD;
    user_email TEXT;
BEGIN
    -- Loop through all participants that don't have a matching user_profile
    FOR participant_record IN 
        SELECT p.user_id, au.email
        FROM participants p
        LEFT JOIN user_profiles up ON p.user_id = up.id
        LEFT JOIN auth.users au ON p.user_id = au.id
        WHERE up.id IS NULL AND au.id IS NOT NULL
    LOOP
        -- Create missing profile using email
        INSERT INTO user_profiles (id, full_name, email, spouse_name, music_consent)
        VALUES (
            participant_record.user_id,
            COALESCE(SPLIT_PART(participant_record.email, '@', 1), 'User'),
            participant_record.email,
            NULL,
            FALSE
        )
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created profile for user: %', participant_record.email;
    END LOOP;
END $$;

-- Log results
SELECT 
    COUNT(*) as participants_fixed
FROM participants p
LEFT JOIN user_profiles up ON p.user_id = up.id
WHERE up.id IS NOT NULL;

