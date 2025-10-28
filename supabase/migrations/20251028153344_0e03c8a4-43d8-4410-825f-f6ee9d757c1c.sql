-- Create story_updates table for pet story posts
CREATE TABLE IF NOT EXISTS public.story_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  story_text TEXT NOT NULL,
  photo_url TEXT,
  author_name TEXT,
  ip_address TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_story_updates_pet_id ON public.story_updates(pet_id);
CREATE INDEX IF NOT EXISTS idx_story_updates_created_at ON public.story_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_updates_visible ON public.story_updates(pet_id, is_visible, created_at DESC);

-- Enable RLS
ALTER TABLE public.story_updates ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible stories for public pets
CREATE POLICY "Anyone can view visible story updates"
  ON public.story_updates
  FOR SELECT
  USING (
    is_visible = true 
    AND EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = story_updates.pet_id 
      AND pets.is_public = true
    )
  );

-- Anyone can post stories for public pets (Phase 1: anonymous posting allowed)
CREATE POLICY "Anyone can insert story updates for public pets"
  ON public.story_updates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = story_updates.pet_id 
      AND pets.is_public = true
    )
  );

-- Pet owners can view all stories (including hidden ones)
CREATE POLICY "Owners can view all their pet story updates"
  ON public.story_updates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = story_updates.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Pet owners can moderate (hide/show) stories
CREATE POLICY "Owners can moderate story updates"
  ON public.story_updates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = story_updates.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Pet owners can delete stories
CREATE POLICY "Owners can delete story updates"
  ON public.story_updates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = story_updates.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_story_updates_updated_at
  BEFORE UPDATE ON public.story_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();