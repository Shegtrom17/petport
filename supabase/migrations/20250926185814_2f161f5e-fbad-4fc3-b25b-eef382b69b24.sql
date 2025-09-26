-- Fix RLS policies to allow profile creation for new users
-- Drop existing restrictive INSERT policy for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policy for profile creation
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update subscription check function
CREATE OR REPLACE FUNCTION public.is_user_subscription_active(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN user_uuid IS NULL THEN false

    -- Allow newly created users (within 30 minutes) to access without subscription
    WHEN EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = user_uuid 
      AND created_at > (now() - interval '30 minutes')
    ) THEN true

    -- If user has active subscription, allow access
    WHEN EXISTS (
      SELECT 1 FROM public.subscribers 
      WHERE user_id = user_uuid 
      AND (
        status = 'active' 
        OR (status = 'grace' AND (grace_period_end IS NULL OR grace_period_end > now()))
      )
    ) THEN true

    -- Otherwise, block access (production default)
    ELSE false
  END;
$$;