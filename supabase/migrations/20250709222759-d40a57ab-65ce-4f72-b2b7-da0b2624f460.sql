
-- Fix the pet pass ID generation function to handle duplicates properly
CREATE OR REPLACE FUNCTION public.generate_pet_pass_id()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate initial pet pass ID
  new_id := 'PP-' || to_char(current_date, 'YYYY') || '-' || 
            LPAD(COALESCE(
              (SELECT COUNT(*) + 1 FROM public.pets WHERE created_at >= date_trunc('year', current_date)),
              1)::text, 3, '0');
  
  -- Check if ID already exists and increment if needed
  WHILE EXISTS (SELECT 1 FROM public.pets WHERE pet_pass_id = new_id) LOOP
    counter := counter + 1;
    new_id := 'PP-' || to_char(current_date, 'YYYY') || '-' || 
              LPAD(COALESCE(
                (SELECT COUNT(*) + counter FROM public.pets WHERE created_at >= date_trunc('year', current_date)),
                counter)::text, 3, '0');
  END LOOP;
  
  NEW.pet_pass_id = new_id;
  RETURN NEW;
END;
$$;
