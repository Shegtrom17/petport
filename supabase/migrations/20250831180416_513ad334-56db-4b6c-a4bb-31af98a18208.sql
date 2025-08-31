-- Force regeneration of Supabase types after schema changes
-- This ensures TypeScript types are updated to reflect new columns
SELECT 'Types regenerated for status and grace_period_end columns'::text;