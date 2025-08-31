-- Enhanced subscription system with grace period and webhook idempotency
-- Safe migration with proper order and constraints

-- 1. Create account status enum
DO $$ BEGIN
  CREATE TYPE public.account_status AS ENUM ('active', 'grace', 'suspended', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_events (admin only)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 3. Add new columns to subscribers (nullable first, then backfill, then constraints)
ALTER TABLE public.subscribers 
  ADD COLUMN IF NOT EXISTS status public.account_status,
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMPTZ;

-- 4. Ensure user_id column exists and backfill status from subscribed
DO $$
BEGIN
  -- Check if subscribed column exists and backfill
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'subscribers' AND column_name = 'subscribed') THEN
    -- Backfill status from existing subscribed column
    UPDATE public.subscribers 
    SET status = CASE 
      WHEN subscribed = true THEN 'active'::public.account_status
      ELSE 'suspended'::public.account_status
    END
    WHERE status IS NULL;
  END IF;
  
  -- Set default status for any remaining NULL rows
  UPDATE public.subscribers 
  SET status = 'suspended'::public.account_status
  WHERE status IS NULL;
END $$;

-- 5. Add constraints after backfill
ALTER TABLE public.subscribers 
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'active'::public.account_status;

-- Ensure user_id is unique and not null
ALTER TABLE public.subscribers 
  ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_user_id_key') THEN
    ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON public.subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_grace_end ON public.subscribers(grace_period_end) WHERE grace_period_end IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON public.webhook_events(stripe_event_id);

-- 7. Create the subscription status check function (SECURITY INVOKER)
CREATE OR REPLACE FUNCTION public.is_user_subscription_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY INVOKER
AS $$
  SELECT COALESCE(
    (SELECT status = 'active' OR (status = 'grace' AND grace_period_end > now())
     FROM public.subscribers 
     WHERE user_id = user_uuid),
    false
  );
$$;

-- 8. Create state transition function for webhooks
CREATE OR REPLACE FUNCTION public.update_subscriber_status(
  _user_id UUID,
  _status public.account_status,
  _payment_failed_at TIMESTAMPTZ DEFAULT NULL,
  _grace_period_end TIMESTAMPTZ DEFAULT NULL,
  _suspended_at TIMESTAMPTZ DEFAULT NULL,
  _canceled_at TIMESTAMPTZ DEFAULT NULL,
  _reactivated_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subscribers 
  SET 
    status = _status,
    payment_failed_at = COALESCE(_payment_failed_at, payment_failed_at),
    grace_period_end = COALESCE(_grace_period_end, grace_period_end),
    suspended_at = COALESCE(_suspended_at, suspended_at),
    canceled_at = COALESCE(_canceled_at, canceled_at),
    reactivated_at = COALESCE(_reactivated_at, reactivated_at),
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Insert if user doesn't exist
  IF NOT FOUND THEN
    INSERT INTO public.subscribers (
      user_id, status, payment_failed_at, grace_period_end,
      suspended_at, canceled_at, reactivated_at
    ) VALUES (
      _user_id, _status, _payment_failed_at, _grace_period_end,
      _suspended_at, _canceled_at, _reactivated_at
    );
  END IF;
END;
$$;

-- 9. Create webhook idempotency check function
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  _stripe_event_id TEXT,
  _event_type TEXT
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
BEGIN
  -- Check if event already processed
  IF EXISTS (SELECT 1 FROM public.webhook_events WHERE stripe_event_id = _stripe_event_id) THEN
    RETURN false; -- Already processed
  END IF;
  
  -- Record the event as processed
  INSERT INTO public.webhook_events (stripe_event_id, event_type)
  VALUES (_stripe_event_id, _event_type);
  
  RETURN true; -- New event, proceed with processing
END;
$$;

-- 10. Add computed column for backward compatibility (optional)
ALTER TABLE public.subscribers 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN 
  GENERATED ALWAYS AS (status = 'active' OR (status = 'grace' AND grace_period_end > now())) STORED;

-- 11. Update RLS policies to enforce subscription status
-- First, drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON public.pets;

-- Create new policies that check subscription status
CREATE POLICY "Active subscribers can view their pets" ON public.pets
  FOR SELECT USING (
    auth.uid() = user_id AND public.is_user_subscription_active(auth.uid())
  );

CREATE POLICY "Active subscribers can insert pets" ON public.pets
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND public.is_user_subscription_active(auth.uid())
  );

CREATE POLICY "Active subscribers can update their pets" ON public.pets
  FOR UPDATE USING (
    auth.uid() = user_id AND public.is_user_subscription_active(auth.uid())
  );

CREATE POLICY "Active subscribers can delete their pets" ON public.pets
  FOR DELETE USING (
    auth.uid() = user_id AND public.is_user_subscription_active(auth.uid())
  );

-- Apply similar policies to other pet-related tables
-- Care instructions
DROP POLICY IF EXISTS "Users can view their pet care instructions" ON public.care_instructions;
DROP POLICY IF EXISTS "Users can insert their pet care instructions" ON public.care_instructions;
DROP POLICY IF EXISTS "Users can update their pet care instructions" ON public.care_instructions;
DROP POLICY IF EXISTS "Users can delete their pet care instructions" ON public.care_instructions;

CREATE POLICY "Active subscribers can access care instructions" ON public.care_instructions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = care_instructions.pet_id 
        AND pets.user_id = auth.uid() 
        AND public.is_user_subscription_active(auth.uid())
    )
  );

-- Pet photos
DROP POLICY IF EXISTS "Users can view their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can insert their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can update their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can delete their pet photos" ON public.pet_photos;

CREATE POLICY "Active subscribers can access pet photos" ON public.pet_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = pet_photos.pet_id 
        AND pets.user_id = auth.uid() 
        AND public.is_user_subscription_active(auth.uid())
    )
  );

-- 12. Add validation trigger for status transitions
CREATE OR REPLACE FUNCTION public.validate_status_transition()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  -- Set timestamps based on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'grace' THEN
        NEW.payment_failed_at = COALESCE(NEW.payment_failed_at, now());
        NEW.grace_period_end = COALESCE(NEW.grace_period_end, now() + interval '14 days');
      WHEN 'suspended' THEN
        NEW.suspended_at = COALESCE(NEW.suspended_at, now());
      WHEN 'canceled' THEN
        NEW.canceled_at = COALESCE(NEW.canceled_at, now());
      WHEN 'active' THEN
        IF OLD.status IN ('grace', 'suspended') THEN
          NEW.reactivated_at = COALESCE(NEW.reactivated_at, now());
        END IF;
      ELSE
        -- No special handling for other statuses
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS validate_status_transition_trigger ON public.subscribers;
CREATE TRIGGER validate_status_transition_trigger
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_status_transition();