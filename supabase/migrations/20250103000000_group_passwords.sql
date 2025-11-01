-- Add password protection to groups
-- Migration to add group_password field

-- Add password field to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS group_password TEXT;

-- Create index for password lookups
CREATE INDEX IF NOT EXISTS idx_groups_password ON groups(group_password);

-- Update RLS policy to allow users to view group passwords when they're in the group
-- (Already covered by existing SELECT policy)

