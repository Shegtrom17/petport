-- Fix RLS policies for pets table - remove subscription dependency from UPDATE
DROP POLICY IF EXISTS "pets_update_when_active" ON public.pets;

-- Create new UPDATE policy for pets that only checks ownership
CREATE POLICY "Users can update their own pets" 
ON public.pets 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix RLS policies for medical table - remove subscription dependency
DROP POLICY IF EXISTS "Active users can update their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Active users can insert their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Active users can delete their pet medical data" ON public.medical;
DROP POLICY IF EXISTS "Active users can view their pet medical data" ON public.medical;

-- Create simplified RLS policies for medical that only check pet ownership
CREATE POLICY "Users can view their pet medical data" 
ON public.medical 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = medical.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their pet medical data" 
ON public.medical 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = medical.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pet medical data" 
ON public.medical 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = medical.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their pet medical data" 
ON public.medical 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = medical.pet_id 
    AND pets.user_id = auth.uid()
  )
);