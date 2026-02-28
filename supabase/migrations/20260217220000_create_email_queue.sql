-- Create a centralized email queue table
CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email text NOT NULL,
  template_key text NOT NULL,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
  error_message text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (for contact form etc)
-- Note: In a production environment, you might want to restrict this further 
-- or use a service-role key from the backend.
CREATE POLICY "Allow public insert to email queue"
ON public.email_queue
FOR INSERT
WITH CHECK (true);

-- Only service role or admins should be able to view/update
CREATE POLICY "Restricted access to email queue"
ON public.email_queue
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_email_queue_updated_at
BEFORE UPDATE ON public.email_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
