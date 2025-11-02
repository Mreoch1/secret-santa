-- Budget and Deadline Feature
-- Allows group creators to set gift budget and exchange details

-- Add columns to groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS budget_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget_max INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS exchange_date DATE,
ADD COLUMN IF NOT EXISTS exchange_location TEXT,
ADD COLUMN IF NOT EXISTS exchange_notes TEXT;

-- Update existing groups with defaults
UPDATE public.groups 
SET budget_min = 0, budget_max = 50, currency = 'USD'
WHERE budget_min IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.groups.budget_min IS 'Minimum gift budget (cents or dollars depending on UI)';
COMMENT ON COLUMN public.groups.budget_max IS 'Maximum gift budget (cents or dollars depending on UI)';
COMMENT ON COLUMN public.groups.exchange_date IS 'Date when gifts will be exchanged';
COMMENT ON COLUMN public.groups.exchange_location IS 'Where the gift exchange will happen';
COMMENT ON COLUMN public.groups.exchange_notes IS 'Additional notes or instructions for participants';

