-- Function to prevent corruption of stripe_customer_id
CREATE OR REPLACE FUNCTION prevent_stripe_customer_id_corruption()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to set stripe_customer_id to NULL
  IF NEW.stripe_customer_id IS NULL AND OLD.stripe_customer_id IS NOT NULL THEN
    -- And the status indicates an active subscription
    IF NEW.status IN ('active', 'grace') OR (OLD.status IN ('active', 'grace')) THEN
      RAISE EXCEPTION 'Cannot set stripe_customer_id to NULL for user_id=% with status=%. This would corrupt the subscription record.', 
        NEW.user_id, NEW.status
      USING HINT = 'Check the edge function logic - it should not overwrite stripe_customer_id when a valid customer exists';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run before updates
DROP TRIGGER IF EXISTS protect_stripe_customer_id ON subscribers;
CREATE TRIGGER protect_stripe_customer_id
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_stripe_customer_id_corruption();