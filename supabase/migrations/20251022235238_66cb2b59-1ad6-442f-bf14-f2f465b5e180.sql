-- Add DELETE policy for pets table so users can delete their own pets
CREATE POLICY "Users can delete their own pets"
ON pets
FOR DELETE
USING (user_id = auth.uid());