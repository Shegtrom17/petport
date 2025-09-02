-- Create og-images bucket for Open Graph images
INSERT INTO storage.buckets (id, name, public) VALUES ('og-images', 'og-images', true);

-- Create policy for public read access to og-images bucket
CREATE POLICY "Public read access for og-images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'og-images');