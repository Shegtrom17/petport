-- 1) Tighten RLS policies: restrict writes to orders and subscribers
-- Orders: drop permissive insert/update policies; keep select-own
DROP POLICY IF EXISTS "System can insert orders" ON public.orders;
DROP POLICY IF EXISTS "System can update orders" ON public.orders;

-- Subscribers: drop permissive insert/update policies; keep select-own
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- 2) Add validation triggers (use triggers instead of CHECK constraints)

-- Orders: amount >= 0, quantity >= 0
CREATE OR REPLACE FUNCTION public.validate_orders_values()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.amount < 0 THEN
    RAISE EXCEPTION 'orders.amount must be >= 0';
  END IF;

  IF NEW.quantity IS NOT NULL AND NEW.quantity < 0 THEN
    RAISE EXCEPTION 'orders.quantity must be >= 0';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_orders_values ON public.orders;
CREATE TRIGGER validate_orders_values
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_orders_values();

-- Subscribers: non-negative numeric fields
CREATE OR REPLACE FUNCTION public.validate_subscribers_values()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.pet_limit < 0 THEN
    RAISE EXCEPTION 'subscribers.pet_limit must be >= 0';
  END IF;

  IF NEW.additional_pets < 0 THEN
    RAISE EXCEPTION 'subscribers.additional_pets must be >= 0';
  END IF;

  IF NEW.additional_pets_purchased IS NOT NULL AND NEW.additional_pets_purchased < 0 THEN
    RAISE EXCEPTION 'subscribers.additional_pets_purchased must be >= 0';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_subscribers_values ON public.subscribers;
CREATE TRIGGER validate_subscribers_values
BEFORE INSERT OR UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.validate_subscribers_values();

-- 3) Auto-update updated_at on UPDATE using existing function public.update_updated_at_column()
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_subscribers_updated_at ON public.subscribers;
CREATE TRIGGER set_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Helpful indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers (user_id);