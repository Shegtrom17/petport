// Supabase client configuration for PetPort
// Updated to use cookie-based session persistence (fixes iOS Safari/PWA blank screen issue)

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://dxghbhujugsfmaecilrq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54";

// ⚠️ IMPORTANT CHANGE: Removed `storage: localStorage`
// Supabase will now fall back to secure cookies automatically

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // helps handle redirects / OAuth flows
      storageKey: "supabase.auth.token", // optional custom cookie key
    },
  }
);