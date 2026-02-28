-- Add updated_at column to tables that are missing it (where updates make sense)
ALTER TABLE public.property_addons 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE public.sms_notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create triggers for automatic updated_at on all tables that need it
-- (The update_updated_at_column function already exists)

-- property_addons trigger
DROP TRIGGER IF EXISTS update_property_addons_updated_at ON public.property_addons;
CREATE TRIGGER update_property_addons_updated_at
BEFORE UPDATE ON public.property_addons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- sms_notifications trigger
DROP TRIGGER IF EXISTS update_sms_notifications_updated_at ON public.sms_notifications;
CREATE TRIGGER update_sms_notifications_updated_at
BEFORE UPDATE ON public.sms_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure triggers exist for all other tables that have updated_at
DROP TRIGGER IF EXISTS update_property_proposals_updated_at ON public.property_proposals;
CREATE TRIGGER update_property_proposals_updated_at
BEFORE UPDATE ON public.property_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
CREATE TRIGGER update_professionals_updated_at
BEFORE UPDATE ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_reviews_updated_at ON public.professional_reviews;
CREATE TRIGGER update_professional_reviews_updated_at
BEFORE UPDATE ON public.professional_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vault_access_requests_updated_at ON public.vault_access_requests;
CREATE TRIGGER update_vault_access_requests_updated_at
BEFORE UPDATE ON public.vault_access_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_visit_bookings_updated_at ON public.visit_bookings;
CREATE TRIGGER update_visit_bookings_updated_at
BEFORE UPDATE ON public.visit_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_professional_relationships_updated_at ON public.professional_relationships;
CREATE TRIGGER update_professional_relationships_updated_at
BEFORE UPDATE ON public.professional_relationships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON public.contact_requests;
CREATE TRIGGER update_contact_requests_updated_at
BEFORE UPDATE ON public.contact_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vault_documents_updated_at ON public.vault_documents;
CREATE TRIGGER update_vault_documents_updated_at
BEFORE UPDATE ON public.vault_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_visit_availability_updated_at ON public.visit_availability;
CREATE TRIGGER update_visit_availability_updated_at
BEFORE UPDATE ON public.visit_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();