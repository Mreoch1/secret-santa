-- Clean up any duplicate assignments that violate the new constraint
-- This removes orphaned/duplicate data from before the constraint fix

-- Delete any duplicate assignments (keep only the most recent one per group+giver)
WITH ranked_assignments AS (
    SELECT id, 
           group_id,
           giver_id,
           ROW_NUMBER() OVER (PARTITION BY group_id, giver_id ORDER BY created_at DESC) as rn
    FROM public.assignments
)
DELETE FROM public.assignments
WHERE id IN (
    SELECT id FROM ranked_assignments WHERE rn > 1
);

-- Log cleanup
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % duplicate assignment(s)', deleted_count;
END $$;

