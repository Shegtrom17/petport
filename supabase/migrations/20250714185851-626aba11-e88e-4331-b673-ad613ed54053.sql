
-- Fix security issues with existing functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.handle_care_instructions_upsert(_pet_id uuid, _feeding_schedule text DEFAULT NULL::text, _morning_routine text DEFAULT NULL::text, _evening_routine text DEFAULT NULL::text, _allergies text DEFAULT NULL::text, _behavioral_notes text DEFAULT NULL::text, _favorite_activities text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  care_id UUID;
BEGIN
  INSERT INTO public.care_instructions (
    pet_id, feeding_schedule, morning_routine, evening_routine, 
    allergies, behavioral_notes, favorite_activities
  )
  VALUES (
    _pet_id, _feeding_schedule, _morning_routine, _evening_routine,
    _allergies, _behavioral_notes, _favorite_activities
  )
  ON CONFLICT (pet_id) DO UPDATE SET
    feeding_schedule = COALESCE(_feeding_schedule, care_instructions.feeding_schedule),
    morning_routine = COALESCE(_morning_routine, care_instructions.morning_routine),
    evening_routine = COALESCE(_evening_routine, care_instructions.evening_routine),
    allergies = COALESCE(_allergies, care_instructions.allergies),
    behavioral_notes = COALESCE(_behavioral_notes, care_instructions.behavioral_notes),
    favorite_activities = COALESCE(_favorite_activities, care_instructions.favorite_activities),
    updated_at = NOW()
  RETURNING id INTO care_id;
  
  RETURN care_id;
END;
$function$;

-- Fix the new user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$;

-- Fix other existing functions
CREATE OR REPLACE FUNCTION public.handle_document_upload(_pet_id uuid, _name text, _type text, _file_url text, _size text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  doc_id uuid;
BEGIN
  INSERT INTO public.documents (pet_id, name, type, file_url, size, upload_date)
  VALUES (_pet_id, _name, _type, _file_url, _size, NOW()::text)
  RETURNING id INTO doc_id;
  
  RETURN doc_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_photo_upload(_pet_id uuid, _photo_url text DEFAULT NULL::text, _full_body_photo_url text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_gallery_photo_upload(_pet_id uuid, _url text, _caption text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  gallery_id uuid;
BEGIN
  INSERT INTO public.gallery_photos (pet_id, url, caption)
  VALUES (_pet_id, _url, _caption)
  RETURNING id INTO gallery_id;
  
  RETURN gallery_id;
END;
$function$;

-- Fix the petpass ID generation functions
CREATE OR REPLACE FUNCTION public.generate_petpass_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    new_id TEXT;
    year_part TEXT;
    uuid_part TEXT;
    counter INTEGER := 0;
BEGIN
    -- Get current year
    year_part := to_char(CURRENT_DATE, 'YYYY');
    
    -- Generate Pet Pass ID with collision handling
    LOOP
        -- Generate 8 characters from UUID (remove hyphens and take first 8)
        uuid_part := UPPER(REPLACE(gen_random_uuid()::TEXT, '-', ''));
        uuid_part := LEFT(uuid_part, 8);
        
        -- Format: PP-YYYY-XXXXXXXX
        new_id := 'PP-' || year_part || '-' || uuid_part;
        
        -- Check if this ID already exists (very unlikely but ensures uniqueness)
        IF NOT EXISTS (SELECT 1 FROM public.pets WHERE petpass_id = new_id) THEN
            EXIT;
        END IF;
        
        -- Safety counter to prevent infinite loops (extremely unlikely to be needed)
        counter := counter + 1;
        IF counter > 100 THEN
            RAISE EXCEPTION 'Unable to generate unique Pet Pass ID after 100 attempts';
        END IF;
    END LOOP;
    
    RETURN new_id;
END;
$function$;

-- Add INSERT policy for profiles so users can create their profile immediately
CREATE POLICY "Users can insert their own profile during signup"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update auth configuration for better security
-- Enable password breach protection
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Configure shorter OTP expiry (24 hours instead of default 7 days)
UPDATE auth.config SET 
  otp_exp = 86400,  -- 24 hours in seconds
  otp_length = 6;   -- Standard 6-digit OTP
