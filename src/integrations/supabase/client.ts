// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dxghbhujugsfmaecilrq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});