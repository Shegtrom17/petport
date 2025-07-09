
-- Create a storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet_pdfs', 'pet_pdfs', true);

-- Create policy to allow users to insert their own pet PDFs
CREATE POLICY "Users can upload their pet PDFs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'pet_pdfs' AND 
  (storage.foldername(name))[1] IN (
    SELECT pets.id::text FROM pets WHERE pets.user_id = auth.uid()
  )
);

-- Create policy to allow public read access to PDFs
CREATE POLICY "PDFs are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'pet_pdfs');

-- Create policy to allow users to update their own pet PDFs
CREATE POLICY "Users can update their pet PDFs" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'pet_pdfs' AND 
  (storage.foldername(name))[1] IN (
    SELECT pets.id::text FROM pets WHERE pets.user_id = auth.uid()
  )
);

-- Create policy to allow users to delete their own pet PDFs
CREATE POLICY "Users can delete their pet PDFs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'pet_pdfs' AND 
  (storage.foldername(name))[1] IN (
    SELECT pets.id::text FROM pets WHERE pets.user_id = auth.uid()
  )
);
