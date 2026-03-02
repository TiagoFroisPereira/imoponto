
-- Trigger function to handle waitlist emails
CREATE OR REPLACE FUNCTION public.handle_waitlist_signup_notification()
RETURNS TRIGGER AS $$
DECLARE
  template_data_json jsonb;
BEGIN
  -- Prepare template data
  template_data_json := jsonb_build_object(
    'email', NEW.email,
    'interest_types', NEW.interests,
    'source', NEW.source
  );

  -- Admin notification
  INSERT INTO public.email_queue (
    recipient_email,
    template_key,
    template_data,
    status
  ) VALUES (
    'info@imoponto.pt',
    'waitlist_signup',
    template_data_json,
    'pending'
  );

  -- User confirmation
  INSERT INTO public.email_queue (
    recipient_email,
    template_key,
    template_data,
    status
  ) VALUES (
    NEW.email,
    'waitlist_confirmation',
    template_data_json,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_waitlist_signup
  AFTER INSERT ON public.waitlist_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_waitlist_signup_notification();
