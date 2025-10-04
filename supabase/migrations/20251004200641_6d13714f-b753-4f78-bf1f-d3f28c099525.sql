-- Add INSERT policy for pets table so users can create their own pets
CREATE POLICY "Users can insert their own pets"
ON public.pets
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());