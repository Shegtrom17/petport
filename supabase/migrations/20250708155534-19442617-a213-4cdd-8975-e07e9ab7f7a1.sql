
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users profiles table that will be populated when users sign up
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  breed TEXT,
  species TEXT,
  age TEXT,
  weight TEXT,
  microchip_id TEXT,
  pet_pass_id TEXT UNIQUE,
  bio TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  vet_contact TEXT,
  emergency_contact TEXT,
  second_emergency_contact TEXT,
  pet_caretaker TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create medical table
CREATE TABLE public.medical (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  medical_alert BOOLEAN DEFAULT false NOT NULL,
  medical_conditions TEXT,
  medications TEXT[],
  last_vaccination TEXT,
  medical_emergency_document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create photos table
CREATE TABLE public.pet_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  full_body_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create professional data table
CREATE TABLE public.professional_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  badges TEXT[],
  support_animal_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create experience table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  activity TEXT NOT NULL,
  contact TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create training table
CREATE TABLE public.training (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  course TEXT NOT NULL,
  facility TEXT,
  phone TEXT,
  completed TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_contact TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  text TEXT,
  date TEXT,
  location TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create travel locations table
CREATE TABLE public.travel_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  code TEXT,
  date_visited TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  size TEXT,
  upload_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pet_photos', 'pet_photos', true);

-- Create storage bucket for pet documents
INSERT INTO storage.buckets (id, name, public) VALUES ('pet_documents', 'pet_documents', true);

-- Function to auto-generate PetPass ID on pet creation
CREATE OR REPLACE FUNCTION generate_pet_pass_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.pet_pass_id = 'PP-' || to_char(current_date, 'YYYY') || '-' || 
                    LPAD(COALESCE(
                      (SELECT COUNT(*) + 1 FROM public.pets WHERE created_at >= date_trunc('year', current_date)),
                      1)::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_pet_pass_id
BEFORE INSERT ON public.pets
FOR EACH ROW
EXECUTE FUNCTION generate_pet_pass_id();

-- Function to automatically create profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for each table
-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Pets policies
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can view their pet contacts"
  ON public.contacts FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = contacts.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet contacts"
  ON public.contacts FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet contacts"
  ON public.contacts FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = contacts.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet contacts"
  ON public.contacts FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = contacts.pet_id) = auth.uid());

-- Medical policies
CREATE POLICY "Users can view their pet medical data"
  ON public.medical FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = medical.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet medical data"
  ON public.medical FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet medical data"
  ON public.medical FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = medical.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet medical data"
  ON public.medical FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = medical.pet_id) = auth.uid());

-- Similar policies for all other tables
-- Pet Photos policies
CREATE POLICY "Users can view their pet photos"
  ON public.pet_photos FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = pet_photos.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet photos"
  ON public.pet_photos FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet photos"
  ON public.pet_photos FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = pet_photos.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet photos"
  ON public.pet_photos FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = pet_photos.pet_id) = auth.uid());

-- Gallery Photos policies
CREATE POLICY "Users can view their gallery photos"
  ON public.gallery_photos FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = gallery_photos.pet_id) = auth.uid());

CREATE POLICY "Users can insert their gallery photos"
  ON public.gallery_photos FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their gallery photos"
  ON public.gallery_photos FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = gallery_photos.pet_id) = auth.uid());

CREATE POLICY "Users can delete their gallery photos"
  ON public.gallery_photos FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = gallery_photos.pet_id) = auth.uid());

-- Professional Data policies
CREATE POLICY "Users can view their pet professional data"
  ON public.professional_data FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = professional_data.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet professional data"
  ON public.professional_data FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet professional data"
  ON public.professional_data FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = professional_data.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet professional data"
  ON public.professional_data FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = professional_data.pet_id) = auth.uid());

-- Experiences policies
CREATE POLICY "Users can view their pet experiences"
  ON public.experiences FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = experiences.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet experiences"
  ON public.experiences FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet experiences"
  ON public.experiences FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = experiences.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet experiences"
  ON public.experiences FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = experiences.pet_id) = auth.uid());

-- Achievements policies
CREATE POLICY "Users can view their pet achievements"
  ON public.achievements FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = achievements.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet achievements"
  ON public.achievements FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet achievements"
  ON public.achievements FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = achievements.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet achievements"
  ON public.achievements FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = achievements.pet_id) = auth.uid());

-- Training policies
CREATE POLICY "Users can view their pet training"
  ON public.training FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = training.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet training"
  ON public.training FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet training"
  ON public.training FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = training.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet training"
  ON public.training FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = training.pet_id) = auth.uid());

-- Reviews policies
CREATE POLICY "Users can view their pet reviews"
  ON public.reviews FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = reviews.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet reviews"
  ON public.reviews FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet reviews"
  ON public.reviews FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = reviews.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet reviews"
  ON public.reviews FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = reviews.pet_id) = auth.uid());

-- Travel Locations policies
CREATE POLICY "Users can view their pet travel locations"
  ON public.travel_locations FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = travel_locations.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet travel locations"
  ON public.travel_locations FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet travel locations"
  ON public.travel_locations FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = travel_locations.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet travel locations"
  ON public.travel_locations FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = travel_locations.pet_id) = auth.uid());

-- Documents policies
CREATE POLICY "Users can view their pet documents"
  ON public.documents FOR SELECT
  USING ((SELECT user_id FROM public.pets WHERE id = documents.pet_id) = auth.uid());

CREATE POLICY "Users can insert their pet documents"
  ON public.documents FOR INSERT
  WITH CHECK ((SELECT user_id FROM public.pets WHERE id = pet_id) = auth.uid());

CREATE POLICY "Users can update their pet documents"
  ON public.documents FOR UPDATE
  USING ((SELECT user_id FROM public.pets WHERE id = documents.pet_id) = auth.uid());

CREATE POLICY "Users can delete their pet documents"
  ON public.documents FOR DELETE
  USING ((SELECT user_id FROM public.pets WHERE id = documents.pet_id) = auth.uid());

-- Storage bucket policies for pet photos
CREATE POLICY "Anyone can read pet photos" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet_photos');

CREATE POLICY "Authenticated users can upload pet photos" 
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet_photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pet photos" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pet_photos' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own pet photos" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pet_photos' AND auth.uid() = owner);

-- Storage bucket policies for pet documents
CREATE POLICY "Anyone can read pet documents" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet_documents');

CREATE POLICY "Authenticated users can upload pet documents" 
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet_documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pet documents" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pet_documents' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own pet documents" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pet_documents' AND auth.uid() = owner);
