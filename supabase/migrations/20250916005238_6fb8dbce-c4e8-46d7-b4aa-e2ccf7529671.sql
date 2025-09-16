BEGIN;

-- 0) Perf index (safe no-op if already present)
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);

-- 1) Pet limit
CREATE OR REPLACE FUNCTION public.get_user_pet_limit(user_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  WITH sub AS (
    SELECT MAX(pet_limit + COALESCE(additional_pets,0)) AS total_limit
    FROM public.subscribers
    WHERE user_id = user_uuid
      AND (COALESCE(subscribed, false) = true OR status IN ('active','grace'))
  )
  SELECT
    COALESCE(
      (SELECT total_limit FROM sub),
      CASE
        WHEN public.is_user_subscription_active(user_uuid) THEN 1
        ELSE 0
      END
    );
$$;

-- 2) Capacity check
CREATE OR REPLACE FUNCTION public.can_user_add_pet(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT (SELECT COUNT(*) FROM public.pets p WHERE p.user_id = user_uuid)
       < (SELECT public.get_user_pet_limit(user_uuid));
$$;

-- 3) Enforce paywall via RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pets_select_own" ON public.pets;
DROP POLICY IF EXISTS "pets_update_own" ON public.pets;
DROP POLICY IF EXISTS "pets_delete_own" ON public.pets;
DROP POLICY IF EXISTS "pets_insert_within_limit" ON public.pets;
DROP POLICY IF EXISTS "Active users can insert their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can view their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can update their own pets" ON public.pets;
DROP POLICY IF EXISTS "Active users can delete their own pets" ON public.pets;

CREATE POLICY "pets_select_when_active"
ON public.pets FOR SELECT TO authenticated
USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "pets_update_when_active"
ON public.pets FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()))
WITH CHECK (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "pets_delete_when_active"
ON public.pets FOR DELETE TO authenticated
USING (user_id = auth.uid() AND public.is_user_subscription_active(auth.uid()));

CREATE POLICY "pets_insert_when_active_within_limit"
ON public.pets FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND public.is_user_subscription_active(auth.uid())
  AND public.can_user_add_pet(auth.uid())
);

-- 4) Grants (needed for RLS to call these)
GRANT EXECUTE ON FUNCTION public.get_user_pet_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user_add_pet(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_subscription_active(uuid) TO authenticated;

COMMIT;