-- Drop old subscription-dependent RLS policies from documents table
DROP POLICY IF EXISTS "Active users can delete their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Active users can insert their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Active users can update their pet documents" ON public.documents;
DROP POLICY IF EXISTS "Active users can view their pet documents" ON public.documents;

-- Drop old subscription-dependent RLS policies from pet_photos table
DROP POLICY IF EXISTS "Active users can delete their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Active users can insert their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Active users can update their pet photos" ON public.pet_photos;
DROP POLICY IF EXISTS "Active users can view their pet photos" ON public.pet_photos;

-- Drop old subscription-dependent RLS policies from pets table
DROP POLICY IF EXISTS "pets_delete_when_active" ON public.pets;
DROP POLICY IF EXISTS "pets_insert_when_active_within_limit" ON public.pets;