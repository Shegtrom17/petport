
-- First, let's drop the existing trigger if it exists and recreate it properly
DROP TRIGGER IF EXISTS pets_pet_pass_id_trigger ON public.pets;

-- Create the trigger to automatically generate pet pass IDs on insert
CREATE TRIGGER pets_pet_pass_id_trigger
  BEFORE INSERT ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_pet_pass_id();

-- Also, let's make sure the pet_pass_id column allows NULL initially so the trigger can set it
ALTER TABLE public.pets ALTER COLUMN pet_pass_id DROP NOT NULL;
