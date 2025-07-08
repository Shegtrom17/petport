
-- Add unique constraint on pet_id in pet_photos table to fix the ON CONFLICT issue
ALTER TABLE public.pet_photos ADD CONSTRAINT pet_photos_pet_id_key UNIQUE (pet_id);
