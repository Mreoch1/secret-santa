-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    group_code TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can create a ticket (public access)
CREATE POLICY "Anyone can create support tickets" ON support_tickets
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Admin can view all tickets (we'll add this later if needed)
-- For now, we'll use service role key for admin access

-- Indexes for performance
CREATE INDEX idx_support_tickets_email ON support_tickets(email);
CREATE INDEX idx_support_tickets_group_id ON support_tickets(group_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_support_tickets_updated_at();

-- Note: For email notifications on new support tickets, use Supabase Database Webhooks
-- Go to: Supabase Dashboard → Database → Webhooks → Create Webhook
-- 
-- Configuration:
--   Table: support_tickets
--   Events: INSERT
--   HTTP Request:
--     URL: https://[your-project].supabase.co/functions/v1/notify-support-ticket
--     Method: POST
--     Headers:
--       Authorization: Bearer [your-anon-key]
--       Content-Type: application/json
--     Body Template:
--       {
--         "record": {
--           "id": "{{ $new.id }}",
--           "name": "{{ $new.name }}",
--           "email": "{{ $new.email }}",
--           "group_code": "{{ $new.group_code }}",
--           "message": "{{ $new.message }}",
--           "created_at": "{{ $new.created_at }}"
--         }
--       }
--
-- Alternatively, you can set up the webhook via Supabase CLI or use pg_net extension

