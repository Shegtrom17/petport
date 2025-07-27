-- Update RLS policies to allow public access to missing pets based only on is_missing = true

-- Drop existing public access policies that require is_public
DROP POLICY IF EXISTS "Allow public read access to missing pets" ON public.lost_pet_data;
DROP POLICY IF EXISTS "Allow public read access to missing pets with public profiles" ON public.lost_pet_data;
DROP POLICY IF EXISTS "Allow public read access to public pets" ON public.pets;

-- Create new simplified policies for missing pet access
CREATE POLICY "Allow public read access to missing pets" 
ON public.lost_pet_data 
FOR SELECT 
USING (is_missing = true);

-- Allow public access to basic pet info when missing
CREATE POLICY "Allow public read access to missing pet info" 
ON public.pets 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lost_pet_data 
  WHERE lost_pet_data.pet_id = pets.id 
  AND lost_pet_data.is_missing = true
));

-- Allow public access to pet photos when missing
CREATE POLICY "Allow public read access to missing pet photos" 
ON public.pet_photos 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lost_pet_data 
  WHERE lost_pet_data.pet_id = pet_photos.pet_id 
  AND lost_pet_data.is_missing = true
));

-- Allow public access to emergency contacts when missing
CREATE POLICY "Allow public read access to missing pet contacts" 
ON public.contacts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lost_pet_data 
  WHERE lost_pet_data.pet_id = contacts.pet_id 
  AND lost_pet_data.is_missing = true
));

-- Ensure documents remain private (no public access policy)
-- Ensure other sensitive data remains protected (no additional public access)

-- Update the pet to be missing for testing
UPDATE public.lost_pet_data 
SET is_missing = true 
WHERE pet_id = '356a0002-3f84-43da-9cdb-34b6a7a0d9f9';