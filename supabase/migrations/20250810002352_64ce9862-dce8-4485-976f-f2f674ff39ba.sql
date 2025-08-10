-- Step 1: Create subscription management tables with proper RLS

-- Create orders table for tracking one-time payments
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL,             -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',       -- pending, paid, failed
  product_type TEXT DEFAULT 'pet_slot', -- pet_slot, premium, etc
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert orders" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update orders" ON public.orders
  FOR UPDATE
  USING (true);

-- Update subscribers table to track additional pet purchases
ALTER TABLE public.subscribers 
  ADD COLUMN IF NOT EXISTS additional_pets_purchased INTEGER DEFAULT 0;

-- Create updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();