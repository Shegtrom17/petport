-- Reason: User is stuck on "No pets found" because current RLS policy on pets requires active subscription (is_user_subscription_active). UI testMode bypass doesn't affect DB, so SELECT returns 0 rows. Fix by allowing owners to SELECT their own pets regardless of subscription status.

BEGIN;

-- Drop the subscription-gated SELECT policy on pets if it exists
DROP POLICY IF EXISTS "pets_select_when_active" ON public.pets;

-- Create an owner-only SELECT policy (keeps privacy, removes subscription gate for reads)
CREATE POLICY "Users can view their own pets"
ON public.pets
FOR SELECT
USING (user_id = auth.uid());

COMMIT;