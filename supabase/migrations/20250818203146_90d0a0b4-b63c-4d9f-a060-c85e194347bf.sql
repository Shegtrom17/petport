-- Create storage bucket for shared PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('shared_exports', 'shared_exports', false);

-- Create RLS policies for shared exports bucket
CREATE POLICY "Users can view their own shared exports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'shared_exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own shared exports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shared_exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own shared exports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'shared_exports' AND auth.uid()::text = (storage.foldername(name))[1]);