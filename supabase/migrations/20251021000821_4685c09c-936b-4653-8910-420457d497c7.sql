-- Create contact_messages table for email relay audit trail
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip_address TEXT,
  page_type TEXT NOT NULL CHECK (page_type IN ('missing', 'profile', 'resume', 'care', 'gallery')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender_email ON public.contact_messages(sender_email, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_ip ON public.contact_messages(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_pet_id ON public.contact_messages(pet_id, created_at);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Pet owners can view messages about their pets
CREATE POLICY "Pet owners can view messages about their pets"
  ON public.contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = contact_messages.pet_id 
      AND pets.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policies - only edge function can write
COMMENT ON TABLE public.contact_messages IS 'Audit trail for email relay messages sent via send-relay-email edge function';