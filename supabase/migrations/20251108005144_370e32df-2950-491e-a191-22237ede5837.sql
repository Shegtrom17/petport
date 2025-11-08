-- Fix webhook_events RLS to allow service role operations
-- This fixes the "Gift not found" error by allowing edge functions to track webhook events

-- Allow service role to insert webhook event records (for idempotency tracking)
CREATE POLICY "Service role can insert webhook events"
ON public.webhook_events
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to read webhook events (for duplicate detection)
CREATE POLICY "Service role can read webhook events"
ON public.webhook_events
FOR SELECT
TO service_role
USING (true);