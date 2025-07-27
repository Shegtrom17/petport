-- Fix infinite recursion in RLS policies by dropping problematic policies and recreating them properly

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Allow public read access to missing pets" ON public.lost_pet_data;
DROP POLICY IF EXISTS "Allow public read access to missing pet info" ON public.pets;
DROP POLICY IF EXISTS "Allow public read access to missing pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Allow public read access to missing pet contacts" ON public.contacts;

-- Recreate simpler public access policies without recursion
-- For lost_pet_data: direct access when missing
CREATE POLICY "Public access to missing pet data" 
ON public.lost_pet_data 
FOR SELECT 
USING (is_missing = true);

-- For pets: allow public access when there's lost_pet_data that is missing
-- Use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_pet_missing(pet_uuid uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.lost_pet_data 
    WHERE pet_id = pet_uuid AND is_missing = true
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now create policies using the function
CREATE POLICY "Public access to missing pet basic info" 
ON public.pets 
FOR SELECT 
USING (public.is_pet_missing(id));

CREATE POLICY "Public access to missing pet photos" 
ON public.pet_photos 
FOR SELECT 
USING (public.is_pet_missing(pet_id));

CREATE POLICY "Public access to missing pet contacts" 
ON public.contacts 
FOR SELECT 
USING (public.is_pet_missing(pet_id));