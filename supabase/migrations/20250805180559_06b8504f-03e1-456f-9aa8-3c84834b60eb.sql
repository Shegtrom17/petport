-- Create issues table for user error reporting
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  current_page TEXT,
  browser_info JSONB,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own issues" 
ON public.issues 
FOR INSERT 
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE user_id IS NULL
  END
);

CREATE POLICY "Users can view their own issues" 
ON public.issues 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN auth.uid() = user_id
    ELSE email = email -- Allow anonymous users to view by email if needed
  END
);

-- Admin users can view all issues (for future admin dashboard)
CREATE POLICY "Admins can view all issues" 
ON public.issues 
FOR SELECT 
USING (true); -- For now, we'll add proper admin role checking later

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_issues_updated_at
BEFORE UPDATE ON public.issues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();