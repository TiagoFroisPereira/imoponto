-- Remove overly permissive RLS policies that pose security risks

-- Drop the problematic "System can..." policies on professional_relationships
-- These allow ANY authenticated user to create/update relationships
DROP POLICY IF EXISTS "System can create relationships" ON public.professional_relationships;
DROP POLICY IF EXISTS "System can update relationships" ON public.professional_relationships;

-- Drop the overly permissive "Service role" policy on sms_notifications
-- Service role bypasses RLS anyway, so this policy is unnecessary and dangerous
DROP POLICY IF EXISTS "Service role can manage sms notifications" ON public.sms_notifications;