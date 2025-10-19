-- Clean up orphaned records before adding foreign key
DELETE FROM public.certifications 
WHERE pet_id NOT IN (SELECT id FROM public.pets);

-- Add foreign key constraint for certifications
ALTER TABLE public.certifications
ADD CONSTRAINT certifications_pet_id_fkey 
FOREIGN KEY (pet_id) 
REFERENCES public.pets(id) 
ON DELETE CASCADE;