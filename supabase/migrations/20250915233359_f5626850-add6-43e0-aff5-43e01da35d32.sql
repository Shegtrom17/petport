-- Phase 2: Implement First Pet Free Feature with Refined Logic (Final)
-- Transaction with all changes for first_pet_free functionality
-- Timestamp: 2025-01-15 - Enable new users to create one free pet

BEGIN;

-- 1. Create settings table for feature flags
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert the first_pet_free flag
INSERT INTO public.settings (key, value, description) 
VALUES ('first_pet_free', true, 'Allow new users to create one free pet without subscription')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on settings (admin-only access, no policies = default deny)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 2. Add performance index for pet counting
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);

-- 3. Update get_user_pet_limit function with hardened logic
CREATE OR REPLACE FUNCTION public.get_user_pet_limit(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH sub AS (
    SELECT MAX(pet_limit + COALESCE(additional_pets,0)) AS total_limit
    FROM public.subscribers
    WHERE user_id = user_uuid
      AND (
        COALESCE(subscribed, false) = true
        OR status IN ('active','grace')
      )
  ),
  cfg AS (
    SELECT COALESCE(
      (SELECT value FROM public.settings WHERE key = 'first_pet_free' LIMIT 1),
      true  -- default if row missing
    ) AS first_pet_free
  )
  SELECT
    COALESCE((SELECT total_limit FROM sub),
             CASE WHEN (SELECT first_pet_free FROM cfg) THEN 1 ELSE 0 END);
$$;

-- 4. Update can_user_add_pet function with hardened logic
CREATE OR REPLACE FUNCTION public.can_user_add_pet(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT (SELECT COUNT(*) FROM public.pets p WHERE p.user_id = user_uuid)
       < (SELECT public.get_user_pet_limit(user_uuid));
$$;

-- 5. Replace restrictive RLS policies with ownership-based ones

-- Ensure RLS is enabled on pets table (safe no-op if already enabled)
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Active users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can delete their own pets" ON public.pets;

-- SELECT: owners can view their pets (no subscription required)
CREATE POLICY "pets_select_own" ON public.pets
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- UPDATE: owners can update their pets (no subscription required)
CREATE POLICY "pets_update_own" ON public.pets
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: owners can delete their pets (no subscription required)
CREATE POLICY "pets_delete_own" ON public.pets
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- INSERT: capacity gate only (subscription or first_pet_free)
CREATE POLICY "pets_insert_within_limit" ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND public.can_user_add_pet(auth.uid())
);

-- 6. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_pet_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_add_pet(uuid) TO authenticated;

COMMIT;