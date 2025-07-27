-- Add RLS policy for public missing pet access
CREATE POLICY "Allow public read access to missing pets with public profiles"
ON public.lost_pet_data
FOR SELECT
USING (
  is_missing = true 
  AND EXISTS (
    SELECT 1 FROM pets 
    WHERE pets.id = lost_pet_data.pet_id 
    AND pets.is_public = true
  )
);