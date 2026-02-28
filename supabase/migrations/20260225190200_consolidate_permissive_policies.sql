-- Migration: Consolidate Multiple Permissive Policies
-- This migration addresses the "Multiple Permissive Policies" linter warnings.

BEGIN;

-- ==========================================
-- 1. professional_events
-- ==========================================
-- Split 'ALL' into specific actions to avoid overlap with SELECT policy
DROP POLICY IF EXISTS "professional_events_manage_policy" ON public.professional_events;
CREATE POLICY "professional_events_modify_policy" ON public.professional_events
FOR ALL TO public
USING ((select auth.uid()) = created_by)
WITH CHECK ((select auth.uid()) = created_by);

-- The 'professional_events_select_policy' already exists and handles all select cases.
-- Actually, the linter says BOTH professional_events_manage_policy and professional_events_select_policy are active for SELECT.
-- By using FOR ALL, manage_policy includes SELECT. Let's change manage_policy to INSERT, UPDATE, DELETE.

DROP POLICY IF EXISTS "professional_events_modify_policy" ON public.professional_events;
CREATE POLICY "professional_events_insert_policy" ON public.professional_events FOR INSERT TO public WITH CHECK ((select auth.uid()) = created_by);
CREATE POLICY "professional_events_update_policy" ON public.professional_events FOR UPDATE TO public USING ((select auth.uid()) = created_by);
CREATE POLICY "professional_events_delete_policy" ON public.professional_events FOR DELETE TO public USING ((select auth.uid()) = created_by);


-- ==========================================
-- 2. vault_access_requests
-- ==========================================
-- Consolidate SELECT
DROP POLICY IF EXISTS "Owners can view vault requests for their properties" ON public.vault_access_requests;
DROP POLICY IF EXISTS "Professionals can view vault requests for them" ON public.vault_access_requests;
DROP POLICY IF EXISTS "Users can view own vault access requests" ON public.vault_access_requests;

CREATE POLICY "vault_access_requests_select_policy" ON public.vault_access_requests
FOR SELECT TO public
USING (
  ((select auth.uid()) = requester_id) OR
  (EXISTS (SELECT 1 FROM properties WHERE (properties.id)::text = vault_access_requests.property_id AND properties.user_id = (select auth.uid()))) OR
  (EXISTS (SELECT 1 FROM professionals WHERE professionals.id = vault_access_requests.professional_id AND professionals.user_id = (select auth.uid())))
);

-- Consolidate UPDATE
DROP POLICY IF EXISTS "Professionals can update vault requests for them" ON public.vault_access_requests;
DROP POLICY IF EXISTS "Users can update own vault access requests" ON public.vault_access_requests;

CREATE POLICY "vault_access_requests_update_policy" ON public.vault_access_requests
FOR UPDATE TO public
USING (
  ((select auth.uid()) = requester_id) OR
  (EXISTS (SELECT 1 FROM professionals WHERE professionals.id = vault_access_requests.professional_id AND professionals.user_id = (select auth.uid())))
);


-- ==========================================
-- 3. vault_buyer_access
-- ==========================================
-- Consolidate SELECT
DROP POLICY IF EXISTS "Buyers can view own access requests" ON public.vault_buyer_access;
DROP POLICY IF EXISTS "Owners can view requests for their properties" ON public.vault_buyer_access;

CREATE POLICY "vault_buyer_access_select_policy" ON public.vault_buyer_access
FOR SELECT TO public
USING (
  ((select auth.uid()) = buyer_id) OR
  ((select auth.uid()) = owner_id)
);

-- Consolidate UPDATE
DROP POLICY IF EXISTS "Buyers can update own requests" ON public.vault_buyer_access;
DROP POLICY IF EXISTS "Owners can update requests for their properties" ON public.vault_buyer_access;

CREATE POLICY "vault_buyer_access_update_policy" ON public.vault_buyer_access
FOR UPDATE TO public
USING (
  ((select auth.uid()) = buyer_id) OR
  ((select auth.uid()) = owner_id)
);


-- ==========================================
-- 4. vault_documents
-- ==========================================
-- Consolidate SELECT
DROP POLICY IF EXISTS "Authenticated users can view vault docs of active properties" ON public.vault_documents;
DROP POLICY IF EXISTS "Buyers with paid access can view vault documents" ON public.vault_documents;
DROP POLICY IF EXISTS "Professionals can view vault documents with granted access" ON public.vault_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON public.vault_documents;

CREATE POLICY "vault_documents_select_policy" ON public.vault_documents
FOR SELECT TO public
USING (
  ((select auth.uid()) = user_id) OR
  ((select auth.uid()) IS NOT NULL AND (EXISTS (SELECT 1 FROM properties WHERE properties.id = vault_documents.property_id AND properties.status = 'active'::text))) OR
  (EXISTS (SELECT 1 FROM vault_buyer_access vba WHERE vba.property_id = vault_documents.property_id AND vba.buyer_id = (select auth.uid()) AND vba.status = 'paid'::text)) OR
  (EXISTS (SELECT 1 FROM vault_access_requests var JOIN professionals p ON p.id = var.professional_id WHERE var.status = 'granted'::text AND p.user_id = (select auth.uid()) AND var.property_id = (vault_documents.property_id)::text))
);


-- ==========================================
-- 5. visit_bookings
-- ==========================================
-- Consolidate SELECT
DROP POLICY IF EXISTS "Sellers can view their visit bookings" ON public.visit_bookings;
DROP POLICY IF EXISTS "Visitors can view own bookings" ON public.visit_bookings;

CREATE POLICY "visit_bookings_select_policy" ON public.visit_bookings
FOR SELECT TO public
USING (
  ((select auth.uid()) = visitor_id) OR
  ((select auth.uid()) = seller_id)
);

COMMIT;
