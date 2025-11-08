-- Create review responses table
CREATE TABLE IF NOT EXISTS public.review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- Public can view responses for public pet reviews
CREATE POLICY "Anyone can view responses to public pet reviews"
ON public.review_responses
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.reviews r
    JOIN public.pets p ON p.id = r.pet_id
    WHERE r.id = review_responses.review_id
    AND p.is_public = true
  )
);

-- Pet owners can insert responses to reviews on their pets
CREATE POLICY "Pet owners can respond to reviews"
ON public.review_responses
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reviews r
    JOIN public.pets p ON p.id = r.pet_id
    WHERE r.id = review_responses.review_id
    AND p.user_id = auth.uid()
  )
);

-- Pet owners can update their responses
CREATE POLICY "Pet owners can update their responses"
ON public.review_responses
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.reviews r
    JOIN public.pets p ON p.id = r.pet_id
    WHERE r.id = review_responses.review_id
    AND p.user_id = auth.uid()
  )
);

-- Pet owners can delete their responses
CREATE POLICY "Pet owners can delete their responses"
ON public.review_responses
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.reviews r
    JOIN public.pets p ON p.id = r.pet_id
    WHERE r.id = review_responses.review_id
    AND p.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_review_responses_updated_at
BEFORE UPDATE ON public.review_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();