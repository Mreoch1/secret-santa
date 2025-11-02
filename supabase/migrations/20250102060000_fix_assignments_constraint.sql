-- Fix Assignment Constraints
-- The original UNIQUE(giver_id) constraint is too restrictive
-- It prevents people from giving in multiple groups or redrawing

-- Drop the incorrect unique constraint
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_giver_id_key;

-- Add correct constraint: unique giver per group (allows multiple groups and redraws)
ALTER TABLE public.assignments DROP CONSTRAINT IF EXISTS assignments_group_giver_unique;
ALTER TABLE public.assignments 
    ADD CONSTRAINT assignments_group_giver_unique UNIQUE(group_id, giver_id);

-- This allows:
-- ✅ Same person to give in multiple groups
-- ✅ Undo/redraw within a group
-- ❌ Prevents duplicate assignments within the same draw

COMMENT ON CONSTRAINT assignments_group_giver_unique ON public.assignments IS 
    'Ensures each participant can only give once per group draw (but can participate in multiple groups)';

