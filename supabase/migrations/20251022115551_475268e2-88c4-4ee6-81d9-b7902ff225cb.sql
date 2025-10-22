-- Add delete policy for pet sightings so owners can delete sighting reports
CREATE POLICY "Pet owners can delete sightings"
ON pet_sightings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = pet_sightings.pet_id
    AND pets.user_id = auth.uid()
  )
);