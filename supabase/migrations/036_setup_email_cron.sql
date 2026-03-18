-- ============================================
-- SETUP EMAIL REPORTS CRON JOB
-- ============================================
-- Uses Supabase pg_cron to trigger email reports every minute

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Create function to call the API endpoint
CREATE OR REPLACE FUNCTION trigger_email_reports()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response http_response;
BEGIN
  -- Call the Vercel API endpoint
  SELECT * INTO response
  FROM http((
    'GET',
    'https://wihi-asia-inventory-system.vercel.app/api/cron/send-reports',
    ARRAY[http_header('Content-Type', 'application/json')],
    'application/json',
    ''
  )::http_request);
  
  -- Log the response
  RAISE NOTICE 'Email cron status: %, body: %', response.status, response.content;
END;
$$;

-- Schedule the cron job to run every minute
-- Format: '* * * * *' = every minute
SELECT cron.schedule(
  'email-reports-every-minute',  -- Job name
  '* * * * *',                    -- Every minute
  $$SELECT trigger_email_reports()$$
);

-- View all scheduled jobs
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('email-reports-every-minute');
