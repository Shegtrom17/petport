-- Fix RLS policies for achievements table - remove subscription dependency
DROP POLICY IF EXISTS "Active users can view their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Active users can insert their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Active users can update their pet achievements" ON public.achievements;
DROP POLICY IF EXISTS "Active users can delete their pet achievements" ON public.achievements;

-- Create simplified RLS policies for achievements that only check pet ownership
CREATE POLICY "Users can view their pet achievements" 
ON public.achievements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = achievements.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their pet achievements" 
ON public.achievements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = achievements.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pet achievements" 
ON public.achievements 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = achievements.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their pet achievements" 
ON public.achievements 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = achievements.pet_id 
    AND pets.user_id = auth.uid()
  )
);

-- Fix RLS policies for reviews table - remove subscription dependency  
DROP POLICY IF EXISTS "Active users can view their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Active users can insert their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Active users can update their pet reviews" ON public.reviews;
DROP POLICY IF EXISTS "Active users can delete their pet reviews" ON public.reviews;

-- Create simplified RLS policies for reviews that only check pet ownership
CREATE POLICY "Users can view their pet reviews" 
ON public.reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = reviews.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their pet reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = reviews.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their pet reviews" 
ON public.reviews 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = reviews.pet_id 
    AND pets.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their pet reviews" 
ON public.reviews 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.pets 
    WHERE pets.id = reviews.pet_id 
    AND pets.user_id = auth.uid()
  )
);