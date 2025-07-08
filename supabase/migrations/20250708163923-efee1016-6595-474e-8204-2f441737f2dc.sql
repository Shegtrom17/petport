
-- Create a function to handle file uploads and create document records
CREATE OR REPLACE FUNCTION public.handle_document_upload(
  _pet_id uuid,
  _name text,
  _type text,
  _file_url text,
  _size text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  doc_id uuid;
BEGIN
  INSERT INTO public.documents (pet_id, name, type, file_url, size, upload_date)
  VALUES (_pet_id, _name, _type, _file_url, _size, NOW()::text)
  RETURNING id INTO doc_id;
  
  RETURN doc_id;
END;
$$;

-- Create a function to handle photo uploads
CREATE OR REPLACE FUNCTION public.handle_photo_upload(
  _pet_id uuid,
  _photo_url text DEFAULT NULL,
  _full_body_photo_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photo_id uuid;
BEGIN
  INSERT INTO public.pet_photos (pet_id, photo_url, full_body_photo_url)
  VALUES (_pet_id, _photo_url, _full_body_photo_url)
  ON CONFLICT (pet_id) DO UPDATE SET
    photo_url = COALESCE(_photo_url, pet_photos.photo_url),
    full_body_photo_url = COALESCE(_full_body_photo_url, pet_photos.full_body_photo_url),
    updated_at = NOW()
  RETURNING id INTO photo_id;
  
  RETURN photo_id;
END;
$$;

-- Create a function to handle gallery photo uploads
CREATE OR REPLACE FUNCTION public.handle_gallery_photo_upload(
  _pet_id uuid,
  _url text,
  _caption text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  gallery_id uuid;
BEGIN
  INSERT INTO public.gallery_photos (pet_id, url, caption)
  VALUES (_pet_id, _url, _caption)
  RETURNING id INTO gallery_id;
  
  RETURN gallery_id;
END;
$$;
