
-- 1. Add missing columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"welcome": true, "messages": true, "visit_requests": true, "payment_receipt": true, "property_published": true, "professional_replies": true}'::jsonb;

ALTER TABLE public.property_addons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.sms_notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- 2. Ensure supporting extensions
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 3. Re-create missing business logic functions

CREATE OR REPLACE FUNCTION public.check_notification_preference(user_id uuid, setting_key text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  settings jsonb;
BEGIN
  SELECT notification_settings INTO settings FROM public.profiles WHERE id = user_id;
  IF settings IS NULL THEN RETURN true; END IF;
  RETURN COALESCE((settings->>setting_key)::boolean, true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_event_ids(check_user_id uuid)
RETURNS TABLE(id uuid)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id FROM professional_events WHERE created_by = check_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_event_creator_of(creator_uid uuid, participant_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_events pe
    JOIN professional_event_participants pep ON pep.event_id = pe.id
    WHERE pe.created_by = creator_uid AND pep.user_id = participant_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.are_co_participants(user1_uid uuid, user2_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_event_participants p1
    JOIN professional_event_participants p2 ON p1.event_id = p2.event_id
    WHERE p1.user_id = user1_uid AND p2.user_id = user2_uid
  );
$$;

CREATE OR REPLACE FUNCTION public.is_event_participant(check_user_id uuid, check_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professional_event_participants
    WHERE user_id = check_user_id AND event_id = check_event_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_participant_event_ids(check_user_id uuid)
RETURNS TABLE(event_id uuid)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT event_id FROM professional_event_participants WHERE user_id = check_user_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_visit_confirmed_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' AND NEW.visitor_email IS NOT NULL THEN
    INSERT INTO public.email_queue (recipient_email, template_key, template_data)
    VALUES (
      NEW.visitor_email,
      'visit_scheduled',
      jsonb_build_object(
        'userName', NEW.visitor_name,
        'propertyTitle', (SELECT title FROM public.properties WHERE id::text = NEW.property_id LIMIT 1),
        'date', to_char(NEW.scheduled_date, 'DD/MM/YYYY'),
        'time', NEW.scheduled_time::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_visit_request_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  seller_record record;
BEGIN
  SELECT email, full_name, id INTO seller_record FROM public.profiles WHERE id = NEW.seller_id;

  IF seller_record.email IS NOT NULL AND public.check_notification_preference(seller_record.id, 'visit_requests') THEN
    INSERT INTO public.email_queue (recipient_email, template_key, template_data)
    VALUES (
      seller_record.email,
      'visit_request',
      jsonb_build_object(
        'sellerName', COALESCE(seller_record.full_name, 'Proprietário'),
        'visitorName', NEW.visitor_name,
        'propertyTitle', (SELECT title FROM public.properties WHERE id::text = NEW.property_id LIMIT 1),
        'date', to_char(NEW.scheduled_date, 'DD/MM/YYYY'),
        'time', NEW.scheduled_time::text
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_professional_reply_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  user_record record;
  prof_name text;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'responded' THEN
    SELECT email, full_name, id INTO user_record FROM public.profiles WHERE id = NEW.user_id;
    SELECT name INTO prof_name FROM public.professionals WHERE id = NEW.professional_id;

    IF user_record.email IS NOT NULL AND public.check_notification_preference(user_record.id, 'professional_replies') THEN
      INSERT INTO public.email_queue (recipient_email, template_key, template_data)
      VALUES (
        user_record.email,
        'professional_reply',
        jsonb_build_object(
          'userName', COALESCE(user_record.full_name, 'Utilizador'),
          'professionalName', COALESCE(prof_name, 'O Profissional'),
          'propertyTitle', (SELECT title FROM public.properties WHERE id = NEW.property_id LIMIT 1),
          'messagePreview', left(NEW.message, 100)
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_message_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  recipient_record record;
  sender_name text;
  prop_title text;
  conv_record record;
BEGIN
  SELECT * INTO conv_record FROM public.conversations WHERE id = NEW.conversation_id;
  
  IF NEW.sender_id = conv_record.buyer_id THEN
    SELECT email, full_name, id INTO recipient_record FROM public.profiles WHERE id = conv_record.seller_id;
    SELECT full_name INTO sender_name FROM public.profiles WHERE id = conv_record.buyer_id;
  ELSE
    SELECT email, full_name, id INTO recipient_record FROM public.profiles WHERE id = conv_record.buyer_id;
    SELECT full_name INTO sender_name FROM public.profiles WHERE id = conv_record.seller_id;
  END IF;

  IF recipient_record.email IS NOT NULL AND public.check_notification_preference(recipient_record.id, 'messages') THEN
    SELECT title INTO prop_title FROM public.properties WHERE id::text = conv_record.property_id LIMIT 1;
    
    INSERT INTO public.email_queue (recipient_email, template_key, template_data)
    VALUES (
      recipient_record.email,
      'contact_form',
      jsonb_build_object(
        'userName', COALESCE(recipient_record.full_name, 'Utilizador'),
        'name', COALESCE(sender_name, 'Interessado'),
        'propertyTitle', COALESCE(prop_title, 'Imóvel'),
        'message', NEW.content,
        'subject', 'Nova mensagem sobre o seu imóvel'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_profile_welcome()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.check_notification_preference(NEW.id, 'welcome') THEN
    INSERT INTO public.email_queue (recipient_email, template_key, template_data)
    VALUES (NEW.email, 'welcome', jsonb_build_object('userName', COALESCE(NEW.full_name, 'Utilizador')));
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_property_published_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  owner_record record;
BEGIN
  IF (OLD.status IS NULL OR OLD.status != 'published') AND NEW.status = 'published' THEN
    SELECT email, full_name, id INTO owner_record FROM public.profiles WHERE id = NEW.user_id;

    IF owner_record.email IS NOT NULL AND public.check_notification_preference(owner_record.id, 'property_published') THEN
      INSERT INTO public.email_queue (recipient_email, template_key, template_data)
      VALUES (
        owner_record.email,
        'property_published',
        jsonb_build_object(
          'userName', COALESCE(owner_record.full_name, 'Proprietário'),
          'propertyTitle', NEW.title,
          'propertyId', NEW.id::text,
          'price', ltrim(to_char(NEW.price, '999,999,999€')),
          'location', NEW.location
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_professional_contact(prof_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  has_access boolean;
  contact_info jsonb;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.contact_requests 
    WHERE professional_id = prof_id 
      AND user_id = auth.uid()
  ) INTO has_access;
  
  IF has_access THEN
    SELECT jsonb_build_object(
      'email', email,
      'phone', phone
    ) INTO contact_info
    FROM public.professionals WHERE id = prof_id;
    
    RETURN contact_info;
  END IF;
  
  RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_email_queue_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM
    extensions.net_http_post(
      url := 'https://jbhpjwiranqqivvvtqme.supabase.co/functions/v1/email-worker',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiaHBqd2lyYW5xcWl2dnZ0cW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwOTE2MDksImV4cCI6MjA4MTY2NzYwOX0.7ik67nbnp0uU0Sf-cyuqLk-USvTk7teNZcloODhG5wY"}'::jsonb,
      body := jsonb_build_object('record', row_to_json(NEW))::jsonb
    );
  RETURN NEW;
END;
$$;

-- 4. Re-create missing triggers

DROP TRIGGER IF EXISTS on_visit_booking_request ON public.visit_bookings;
CREATE TRIGGER on_visit_booking_request
  AFTER INSERT ON public.visit_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_visit_request_email();

DROP TRIGGER IF EXISTS on_visit_booking_confirmed ON public.visit_bookings;
CREATE TRIGGER on_visit_booking_confirmed
  AFTER UPDATE ON public.visit_bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_visit_confirmed_email();

DROP TRIGGER IF EXISTS on_professional_contact_responded ON public.contact_requests;
CREATE TRIGGER on_professional_contact_responded
  AFTER UPDATE ON public.contact_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_professional_reply_email();

DROP TRIGGER IF EXISTS on_new_message_notification ON public.messages;
CREATE TRIGGER on_new_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_email();

DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_welcome();

DROP TRIGGER IF EXISTS on_property_status_published ON public.properties;
CREATE TRIGGER on_property_status_published
  AFTER UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_property_published_email();

DROP TRIGGER IF EXISTS on_email_queue_insert ON public.email_queue;
CREATE TRIGGER on_email_queue_insert
  AFTER INSERT ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_queue_insert();
