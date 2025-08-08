-- Allow public to view care instructions for public pets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'care_instructions' 
      AND policyname = 'Public access to public pet care instructions'
  ) THEN
    CREATE POLICY "Public access to public pet care instructions"
    ON public.care_instructions
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id = care_instructions.pet_id 
          AND pets.is_public = true
      )
    );
  END IF;
END $$;

-- Allow public to view contacts for public pets (in addition to missing-pet policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'contacts' 
      AND policyname = 'Public access to public pet contacts'
  ) THEN
    CREATE POLICY "Public access to public pet contacts"
    ON public.contacts
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id = contacts.pet_id 
          AND pets.is_public = true
      )
    );
  END IF;
END $$;
