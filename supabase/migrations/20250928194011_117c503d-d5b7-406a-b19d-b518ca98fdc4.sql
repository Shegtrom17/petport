-- Fix RLS policies for pet_photos table
DROP POLICY IF EXISTS "Users can view photos of their pets" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can upload photos to their pets" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can update photos of their pets" ON public.pet_photos;
DROP POLICY IF EXISTS "Users can delete photos of their pets" ON public.pet_photos;

-- Create simplified RLS policies for pet_photos that don't depend on subscription status
CREATE POLICY "Users can view photos of their own pets" 
ON public.pet_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_photos.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload photos to their own pets" 
ON public.pet_photos 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_photos.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update photos of their own pets" 
ON public.pet_photos 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_photos.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete photos of their own pets" 
ON public.pet_photos 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_photos.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Fix RLS policies for documents table
DROP POLICY IF EXISTS "Users can view documents of their pets" ON public.documents;
DROP POLICY IF EXISTS "Users can upload documents to their pets" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents of their pets" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents of their pets" ON public.documents;

-- Create simplified RLS policies for documents that don't depend on subscription status
CREATE POLICY "Users can view documents of their own pets" 
ON public.documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = documents.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents to their own pets" 
ON public.documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = documents.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents of their own pets" 
ON public.documents 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = documents.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents of their own pets" 
ON public.documents 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = documents.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Keep existing public access policies for public sharing unchanged
-- These policies allow public access when pets are marked as public
CREATE POLICY "Public access to photos of public pets" 
ON public.pet_photos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = pet_photos.pet_id 
    AND pets.is_public = true
  )
);

CREATE POLICY "Public access to documents of public pets" 
ON public.documents 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = documents.pet_id 
    AND pets.is_public = true
  )
);