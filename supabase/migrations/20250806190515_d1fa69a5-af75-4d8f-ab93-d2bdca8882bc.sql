-- Add public access policies for public pets' related data

-- Gallery photos public access for public pets
CREATE POLICY "Public access to public pet galleries" 
ON public.gallery_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = gallery_photos.pet_id 
    AND pets.is_public = true
  )
);

-- Training data public access for public pets
CREATE POLICY "Public access to public pet training" 
ON public.training 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = training.pet_id 
    AND pets.is_public = true
  )
);

-- Travel locations public access for public pets
CREATE POLICY "Public access to public pet travel" 
ON public.travel_locations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = travel_locations.pet_id 
    AND pets.is_public = true
  )
);

-- Reviews public access for public pets
CREATE POLICY "Public access to public pet reviews" 
ON public.reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = reviews.pet_id 
    AND pets.is_public = true
  )
);

-- Professional data public access for public pets
CREATE POLICY "Public access to public pet professional data" 
ON public.professional_data 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = professional_data.pet_id 
    AND pets.is_public = true
  )
);

-- Achievements public access for public pets
CREATE POLICY "Public access to public pet achievements" 
ON public.achievements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = achievements.pet_id 
    AND pets.is_public = true
  )
);

-- Experiences public access for public pets
CREATE POLICY "Public access to public pet experiences" 
ON public.experiences 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = experiences.pet_id 
    AND pets.is_public = true
  )
);

-- Medical data public access for public pets (for alerts/basic info)
CREATE POLICY "Public access to public pet medical alerts" 
ON public.medical 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = medical.pet_id 
    AND pets.is_public = true
  )
);

-- Certifications public access for public pets
CREATE POLICY "Public access to public pet certifications" 
ON public.certifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = certifications.pet_id 
    AND pets.is_public = true
  )
);

-- Map pins public access for public pets
CREATE POLICY "Public access to public pet map pins" 
ON public.map_pins 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = map_pins.pet_id 
    AND pets.is_public = true
  )
);

-- Public access to public pets themselves (update existing policy)
CREATE POLICY "Public access to public pets" 
ON public.pets 
FOR SELECT 
USING (is_public = true);