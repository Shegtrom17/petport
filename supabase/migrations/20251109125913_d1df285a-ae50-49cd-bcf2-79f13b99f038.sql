-- Add additional_pets column to scheduled_gifts table
ALTER TABLE public.scheduled_gifts 
ADD COLUMN additional_pets INTEGER NOT NULL DEFAULT 0;

-- Add additional_pets column to gift_memberships table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gift_memberships' 
    AND column_name = 'additional_pets'
  ) THEN
    ALTER TABLE public.gift_memberships 
    ADD COLUMN additional_pets INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add validation trigger for additional_pets (must be between 0 and 19)
CREATE OR REPLACE FUNCTION validate_additional_pets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.additional_pets < 0 OR NEW.additional_pets > 19 THEN
    RAISE EXCEPTION 'additional_pets must be between 0 and 19';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_scheduled_gifts_additional_pets
  BEFORE INSERT OR UPDATE ON public.scheduled_gifts
  FOR EACH ROW
  EXECUTE FUNCTION validate_additional_pets();

CREATE TRIGGER validate_gift_memberships_additional_pets
  BEFORE INSERT OR UPDATE ON public.gift_memberships
  FOR EACH ROW
  EXECUTE FUNCTION validate_additional_pets();