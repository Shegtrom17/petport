# Gift Scheduling Cron Job Setup

## Overview
This document contains the SQL commands to set up the daily cron job that automatically sends scheduled gifts.

## Prerequisites
1. Enable the `pg_cron` and `pg_net` extensions in your Supabase project
2. The `send-scheduled-gifts` edge function must be deployed

## Setup Instructions

### Step 1: Enable Extensions
Run this SQL in the Supabase SQL Editor:

```sql
-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Enable pg_net for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

### Step 2: Create Cron Job
Run this SQL to create the daily cron job (runs at 9 AM UTC every day):

```sql
-- Schedule the send-scheduled-gifts function to run daily at 9 AM UTC
SELECT cron.schedule(
  'send-scheduled-gifts-daily',
  '0 9 * * *', -- Runs at 9:00 AM UTC every day
  $$
  SELECT
    net.http_post(
        url:='https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/send-scheduled-gifts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify Cron Job
Check that the cron job was created successfully:

```sql
-- View all scheduled cron jobs
SELECT * FROM cron.job;
```

### Step 4: Test the Function Manually (Optional)
Before waiting for the cron job to run, you can test the function manually:

```sql
-- Manually trigger the send-scheduled-gifts function
SELECT
  net.http_post(
      url:='https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/send-scheduled-gifts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54"}'::jsonb,
      body:='{}'::jsonb
  );
```

## Managing the Cron Job

### View Cron Job Status
```sql
SELECT * FROM cron.job WHERE jobname = 'send-scheduled-gifts-daily';
```

### Unschedule/Delete Cron Job
```sql
SELECT cron.unschedule('send-scheduled-gifts-daily');
```

### Update Cron Schedule
If you want to change the schedule (e.g., run at a different time):

```sql
-- First, unschedule the old job
SELECT cron.unschedule('send-scheduled-gifts-daily');

-- Then create a new one with a different schedule
-- Example: Run at 6 AM UTC instead
SELECT cron.schedule(
  'send-scheduled-gifts-daily',
  '0 6 * * *', -- 6:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://dxghbhujugsfmaecilrq.supabase.co/functions/v1/send-scheduled-gifts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2hiaHVqdWdzZm1hZWNpbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODg1NjMsImV4cCI6MjA2NzU2NDU2M30.7ASbHSWCyyTuPnhY8t0iI_lZXbBrmQLEYXIAuw_Be54"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Cron Schedule Format
The cron schedule uses standard cron syntax: `minute hour day month day_of_week`

Common examples:
- `0 9 * * *` - 9 AM UTC every day
- `0 6 * * *` - 6 AM UTC every day
- `0 12 * * *` - 12 PM UTC every day
- `0 0 * * *` - Midnight UTC every day
- `0 */6 * * *` - Every 6 hours

## Time Zone Considerations
- Cron jobs run in **UTC time**
- 9 AM UTC = 1 AM PST / 4 AM EST / 10 AM CET
- Consider your target audience's time zone when setting the schedule
- For US customers, 9 AM UTC (1 AM PST) means gifts arrive early morning on the scheduled date

## Monitoring
You can monitor the cron job execution in the Supabase Dashboard:
1. Go to Database → Cron Jobs
2. Check the "Last Run" and "Next Run" times
3. View execution logs in the Edge Functions logs for `send-scheduled-gifts`

## Troubleshooting

### Cron job not running
1. Check if `pg_cron` extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
2. Verify the cron job exists: `SELECT * FROM cron.job;`
3. Check edge function logs for errors

### Gifts not being sent
1. Manually test the edge function to verify it works
2. Check the `scheduled_gifts` table for gifts with status='scheduled' and today's date
3. Review edge function logs for any error messages
4. Verify email service (Postmark) is configured correctly

## Security Notes
- The cron job uses the **anon key** (public key) which is safe to use in this context
- The `send-scheduled-gifts` edge function should have proper RLS policies
- The function only sends gifts scheduled for today, preventing unauthorized sends
