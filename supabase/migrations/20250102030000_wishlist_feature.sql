-- Wishlist Feature Migration
-- Allows participants to add gift ideas that their Secret Santa can see

-- Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE NOT NULL,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    item_description TEXT,
    item_url TEXT,
    price_range TEXT,
    priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1=High, 2=Medium, 3=Low
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_wishlists_participant ON public.wishlists(participant_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_group ON public.wishlists(group_id);

-- Enable Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone in the group can view all wishlists in that group
-- (So your Secret Santa can see your wishlist!)
CREATE POLICY "Group members can view wishlists in their group"
    ON public.wishlists FOR SELECT
    USING (
        group_id IN (
            SELECT group_id FROM public.participants
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert their own wishlist items
CREATE POLICY "Users can add own wishlist items"
    ON public.wishlists FOR INSERT
    WITH CHECK (
        participant_id IN (
            SELECT id FROM public.participants
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own wishlist items
CREATE POLICY "Users can update own wishlist items"
    ON public.wishlists FOR UPDATE
    USING (
        participant_id IN (
            SELECT id FROM public.participants
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own wishlist items
CREATE POLICY "Users can delete own wishlist items"
    ON public.wishlists FOR DELETE
    USING (
        participant_id IN (
            SELECT id FROM public.participants
            WHERE user_id = auth.uid()
        )
    );

-- Add comment for documentation
COMMENT ON TABLE public.wishlists IS 'Gift ideas/wishlists that participants can add for their Secret Santa to see';
COMMENT ON COLUMN public.wishlists.priority IS '1 = High priority (really want), 2 = Medium, 3 = Low priority (nice to have)';

