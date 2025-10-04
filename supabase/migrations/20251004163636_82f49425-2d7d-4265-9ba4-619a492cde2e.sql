-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily referral approval job at 2 AM UTC
SELECT cron.schedule(
  'approve-yearly-referrals',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/approve-referrals',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54"}'::jsonb,
    body := '{"cron": true}'::jsonb
  ) AS request_id;
  $$
);
