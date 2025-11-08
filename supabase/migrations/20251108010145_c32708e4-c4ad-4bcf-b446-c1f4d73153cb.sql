-- Fix gift_memberships RLS to allow webhook to create and read gift records
-- The stripe-webhook edge function runs as service_role and needs these permissions

-- Allow service role to insert gift records when processing Stripe webhooks
CREATE POLICY "Service role can insert gift records"
ON public.gift_memberships
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to read gift records (needed for deduplication checks)
CREATE POLICY "Service role can read gift records"
ON public.gift_memberships
FOR SELECT
TO service_role
USING (true);

-- Allow service role to update gift records (for activation tracking)
CREATE POLICY "Service role can update gift records"
ON public.gift_memberships
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);