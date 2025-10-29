-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily gift renewal reminder job (runs at 10 AM UTC every day)
SELECT cron.schedule(
  'send-gift-renewal-reminders',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/send-gift-renewal-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);