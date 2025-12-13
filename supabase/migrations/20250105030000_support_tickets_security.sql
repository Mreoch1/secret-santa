-- Add security and metadata fields to support_tickets
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS created_ip TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS spam_score INTEGER DEFAULT 0;

-- Update status check constraint (already exists, but ensure it's correct)
-- Status is already defined in original migration

-- Create support_messages table for ticket replies
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    from_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on support_messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_messages
-- Users can view messages for their own tickets
CREATE POLICY "Users can view their ticket messages" ON support_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM support_tickets 
            WHERE support_tickets.id = support_messages.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- Anyone can create messages (for future public replies)
CREATE POLICY "Anyone can create messages" ON support_messages
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX idx_support_tickets_created_ip ON support_tickets(created_ip);
CREATE INDEX idx_support_tickets_spam_score ON support_tickets(spam_score);
CREATE INDEX idx_support_tickets_last_notified_at ON support_tickets(last_notified_at);

-- Rate limiting table (simple in-memory alternative is Edge Function, but DB is more reliable)
CREATE TABLE IF NOT EXISTS support_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash TEXT NOT NULL,  -- SHA256 hash of IP address
    fingerprint_hash TEXT,  -- Optional: hash of browser fingerprint
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_request_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(ip_hash, window_start)
);

-- Index for rate limit lookups
CREATE INDEX idx_support_rate_limits_ip_hash ON support_rate_limits(ip_hash);
CREATE INDEX idx_support_rate_limits_window_start ON support_rate_limits(window_start);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION check_support_rate_limit(
    p_ip_hash TEXT,
    p_max_requests INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current window start (round down to nearest window)
    v_window_start := DATE_TRUNC('hour', NOW()) + 
                      (EXTRACT(MINUTE FROM NOW())::INTEGER / p_window_minutes)::INTEGER * 
                      (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Get or create rate limit record
    INSERT INTO support_rate_limits (ip_hash, window_start, request_count, last_request_at)
    VALUES (p_ip_hash, v_window_start, 1, NOW())
    ON CONFLICT (ip_hash, window_start) 
    DO UPDATE SET 
        request_count = support_rate_limits.request_count + 1,
        last_request_at = NOW()
    RETURNING request_count INTO v_count;
    
    -- Check if over limit
    IF v_count > p_max_requests THEN
        RETURN false;
    END IF;
    
    -- Clean up old windows (older than 24 hours)
    DELETE FROM support_rate_limits 
    WHERE window_start < NOW() - INTERVAL '24 hours';
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

