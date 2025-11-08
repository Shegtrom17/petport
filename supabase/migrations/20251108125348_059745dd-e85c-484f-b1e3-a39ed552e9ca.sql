-- Allow anyone to submit reviews for public pets
CREATE POLICY "Anyone can submit reviews for public pets"
ON public.reviews
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets
    WHERE pets.id = reviews.pet_id
    AND pets.is_public = true
  )
);