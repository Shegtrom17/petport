-- Create storage bucket for story photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-photos',
  'story-photos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
);

-- RLS policies for story-photos bucket
CREATE POLICY "Anyone can view story photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-photos');

CREATE POLICY "Pet owners can upload story photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-photos' 
  AND auth.uid() IN (
    SELECT user_id FROM pets WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Pet owners can update their story photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-photos'
  AND auth.uid() IN (
    SELECT user_id FROM pets WHERE id = (storage.foldername(name))[1]::uuid
  )
);

CREATE POLICY "Pet owners can delete their story photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-photos'
  AND auth.uid() IN (
    SELECT user_id FROM pets WHERE id = (storage.foldername(name))[1]::uuid
  )
);
