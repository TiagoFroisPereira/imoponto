-- Update handle_new_user function to automatically record legal acceptance
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

  -- Insert into user_legal_acceptances
  -- We assume that because the user just signed up via the registration form,
  -- they have already accepted the terms and conditions checkbox there.
  INSERT INTO public.user_legal_acceptances (
    user_id,
    terms_version,
    user_agent
  )
  VALUES (
    NEW.id,
    '1.0',
    'Accepted during registration process'
  )
  ON CONFLICT ON CONSTRAINT user_legal_acceptances_user_id_key DO NOTHING;

  RETURN NEW;
END;
$function$;
