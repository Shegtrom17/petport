
-- Fix the pet pass ID generation function to be more robust
CREATE OR REPLACE FUNCTION public.generate_pet_pass_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 0;
  base_count INTEGER;
BEGIN
  -- Get the base count for this year
  SELECT COUNT(*) INTO base_count 
  FROM public.pets 
  WHERE created_at >= date_trunc('year', current_date);
  
  -- Generate initial pet pass ID with incremented count
  new_id := 'PP-' || to_char(current_date, 'YYYY') || '-' || 
            LPAD((base_count + 1)::text, 3, '0');
  
  -- Check if ID already exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.pets WHERE pet_pass_id = new_id) LOOP
    counter := counter + 1;
    new_id := 'PP-' || to_char(current_date, 'YYYY') || '-' || 
              LPAD((base_count + 1 + counter)::text, 3, '0');
  END LOOP;
  
  NEW.pet_pass_id = new_id;
  RETURN NEW;
END;
$$;

-- Also ensure the trigger is properly set up
DROP TRIGGER IF EXISTS pets_pet_pass_id_trigger ON public.pets;

CREATE TRIGGER pets_pet_pass_id_trigger
  BEFORE INSERT ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_pet_pass_id();
