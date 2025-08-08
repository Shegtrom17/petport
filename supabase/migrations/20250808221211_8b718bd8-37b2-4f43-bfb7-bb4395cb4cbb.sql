-- Allow public to view care instructions for public pets
CREATE POLICY IF NOT EXISTS "Public access to public pet care instructions"
ON public.care_instructions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = care_instructions.pet_id 
      AND pets.is_public = true
  )
);

-- Allow public to view contacts for public pets (in addition to missing-pet policy)
CREATE POLICY IF NOT EXISTS "Public access to public pet contacts"
ON public.contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = contacts.pet_id 
      AND pets.is_public = true
  )
);
