-- Fix the function security issue
CREATE OR REPLACE FUNCTION public.is_pet_missing(pet_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lost_pet_data 
    WHERE pet_id = pet_uuid AND is_missing = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;