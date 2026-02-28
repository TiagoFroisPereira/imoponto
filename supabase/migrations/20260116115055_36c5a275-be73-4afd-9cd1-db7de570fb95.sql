-- Create a security definer function to get professional contact info
-- Only returns contact details if user has made a contact request
CREATE OR REPLACE FUNCTION public.get_professional_contact(prof_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_access boolean;
  contact_info jsonb;
BEGIN
  -- Check if user has a contact request for this professional
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

-- Create a view for public professional info (without sensitive contact details)
CREATE OR REPLACE VIEW public.professionals_public AS
SELECT 
  id,
  user_id,
  category,
  price_from,
  years_experience,
  is_verified,
  is_active,
  created_at,
  updated_at,
  profile_completed,
  name,
  avatar_url,
  bio,
  service_type,
  location,  -- City/region is OK to show
  specialization
  -- Excluding: email, phone, address, geographic_area (sensitive)
FROM public.professionals
WHERE is_active = true AND profile_completed = true;

-- Grant access to the view for authenticated users
GRANT SELECT ON public.professionals_public TO authenticated;