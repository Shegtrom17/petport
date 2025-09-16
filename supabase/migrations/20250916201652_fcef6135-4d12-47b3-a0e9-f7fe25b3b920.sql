-- First, let's check what subscription_status values are allowed and add missing ones
DO $$ 
BEGIN
  -- Add 'inactive' to subscription_status enum if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumtypid = 'subscription_status'::regtype 
    AND enumlabel = 'inactive'
  ) THEN
    ALTER TYPE subscription_status ADD VALUE 'inactive';
  END IF;
END $$;

-- Create the process_webhook_event function for idempotency
CREATE OR REPLACE FUNCTION public.process_webhook_event(
  _stripe_event_id TEXT,
  _event_type TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_new_event BOOLEAN := FALSE;
BEGIN
  -- Try to insert the event, return false if it already exists
  INSERT INTO public.webhook_events (event_id, event_type)
  VALUES (_stripe_event_id, _event_type)
  ON CONFLICT (event_id) DO NOTHING;
  
  -- Check if the insert actually happened
  GET DIAGNOSTICS is_new_event = ROW_COUNT;
  
  RETURN is_new_event > 0;
END;
$$;

-- Create the update_subscriber_status function
CREATE OR REPLACE FUNCTION public.update_subscriber_status(
  _user_id UUID,
  _status subscription_status,
  _reactivated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _canceled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _payment_failed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  _grace_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscribers (
    user_id, 
    status, 
    email,
    reactivated_at,
    canceled_at,
    payment_failed_at,
    grace_period_end,
    updated_at
  )
  SELECT 
    _user_id,
    _status,
    COALESCE(auth.email(), 'unknown@email.com'),
    _reactivated_at,
    _canceled_at,
    _payment_failed_at,
    _grace_period_end,
    NOW()
  FROM auth.users
  WHERE auth.users.id = _user_id
  ON CONFLICT (user_id) DO UPDATE SET
    status = _status,
    reactivated_at = COALESCE(_reactivated_at, subscribers.reactivated_at),
    canceled_at = COALESCE(_canceled_at, subscribers.canceled_at),
    payment_failed_at = COALESCE(_payment_failed_at, subscribers.payment_failed_at),
    grace_period_end = COALESCE(_grace_period_end, subscribers.grace_period_end),
    updated_at = NOW();
END;
$$;