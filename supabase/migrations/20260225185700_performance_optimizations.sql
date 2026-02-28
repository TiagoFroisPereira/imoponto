-- Migration: Performance Optimizations
-- Phase 1: Missing Indexes for Foreign Keys
-- Phase 3: RLS Optimization & Consolidation

BEGIN;

-- ==========================================
-- PHASE 1: Missing Indexes for Foreign Keys
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_contact_requests_professional_id ON public.contact_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_property_id ON public.contact_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_user_id ON public.contact_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_property_id ON public.notifications(property_id);
CREATE INDEX IF NOT EXISTS idx_professional_events_property_id ON public.professional_events(property_id);
CREATE INDEX IF NOT EXISTS idx_professional_relationships_property_id ON public.professional_relationships(property_id);
CREATE INDEX IF NOT EXISTS idx_professional_reviews_user_id ON public.professional_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_property_proposals_property_id ON public.property_proposals(property_id);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_user_id ON public.sms_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_access_requests_professional_id ON public.vault_access_requests(professional_id);
CREATE INDEX IF NOT EXISTS idx_vault_access_requests_requester_id ON public.vault_access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_vault_buyer_access_property_id ON public.vault_buyer_access(property_id);
CREATE INDEX IF NOT EXISTS idx_vault_consent_acceptances_property_id ON public.vault_consent_acceptances(property_id);
CREATE INDEX IF NOT EXISTS idx_vault_documents_property_id ON public.vault_documents(property_id);

-- ==========================================
-- PHASE 3: RLS Optimization & Consolidation
-- ==========================================

-- 1. profiles (Consolidate 5 SELECT policies)
DROP POLICY IF EXISTS "Event creators can view profiles of their event participants" ON public.profiles;
DROP POLICY IF EXISTS "Event participants can view co-participant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owners can view profiles of vault buyers" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of conversation participants" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO public
USING (
  ((select auth.uid()) = id) OR
  ((select auth.uid()) IS NOT NULL AND (
    is_event_creator_of((select auth.uid()), id) OR
    are_co_participants((select auth.uid()), id) OR
    (EXISTS ( SELECT 1 FROM (vault_buyer_access vba JOIN properties p ON ((p.id = vba.property_id))) WHERE ((vba.buyer_id = profiles.id) AND (p.user_id = (select auth.uid())) AND (vba.status = 'paid'::text)))) OR
    (EXISTS ( SELECT 1 FROM conversations c WHERE (((c.seller_id = (select auth.uid())) AND (c.buyer_id = profiles.id)) OR ((c.buyer_id = (select auth.uid())) AND (c.seller_id = profiles.id)))))
  ))
);

-- profiles (Optimize INSERT/UPDATE)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO public WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING ((select auth.uid()) = id);


-- 2. contact_requests (Consolidate SELECT and UPDATE)
DROP POLICY IF EXISTS "Users can view own contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Professionals can view contact requests for them" ON public.contact_requests;

CREATE POLICY "contact_requests_select_policy" ON public.contact_requests
FOR SELECT TO public
USING (
  ((select auth.uid()) = user_id) OR
  (EXISTS (SELECT 1 FROM professionals WHERE professionals.id = contact_requests.professional_id AND professionals.user_id = (select auth.uid())))
);

DROP POLICY IF EXISTS "Users can update own contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Professionals can update contact requests for them" ON public.contact_requests;

CREATE POLICY "contact_requests_update_policy" ON public.contact_requests
FOR UPDATE TO public
USING (
  ((select auth.uid()) = user_id) OR
  (EXISTS (SELECT 1 FROM professionals WHERE professionals.id = contact_requests.professional_id AND professionals.user_id = (select auth.uid())))
);

-- contact_requests (Optimize INSERT)
DROP POLICY IF EXISTS "Users can create contact requests" ON public.contact_requests;
CREATE POLICY "Users can create contact requests" ON public.contact_requests FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);


-- 3. professionals (Consolidate & Optimize)
DROP POLICY IF EXISTS "Authenticated users can view active and complete professionals" ON public.professionals;
DROP POLICY IF EXISTS "Users can view own professional profile" ON public.professionals;

CREATE POLICY "professionals_select_policy" ON public.professionals
FOR SELECT TO public
USING (
  ((select auth.uid()) = user_id) OR
  ((select auth.uid()) IS NOT NULL AND (is_active = true) AND (profile_completed = true))
);

DROP POLICY IF EXISTS "Users can create own professional profile" ON public.professionals;
CREATE POLICY "Users can create own professional profile" ON public.professionals FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Professionals can update own profile" ON public.professionals;
CREATE POLICY "Professionals can update own profile" ON public.professionals FOR UPDATE TO public USING ((select auth.uid()) = user_id);


-- 4. properties (Consolidate & Optimize)
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Users can view own properties" ON public.properties;

CREATE POLICY "properties_select_policy" ON public.properties
FOR SELECT TO public
USING (
  (status = 'active'::text) OR ((select auth.uid()) = user_id)
);

DROP POLICY IF EXISTS "Users can create own properties" ON public.properties;
CREATE POLICY "Users can create own properties" ON public.properties FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own properties" ON public.properties;
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own properties" ON public.properties;
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE TO public USING ((select auth.uid()) = user_id);


-- 5. professional_events (Consolidate & Optimize)
DROP POLICY IF EXISTS "Creators can manage own events" ON public.professional_events;
DROP POLICY IF EXISTS "Participants can view shared events" ON public.professional_events;

CREATE POLICY "professional_events_select_policy" ON public.professional_events
FOR SELECT TO public
USING (((select auth.uid()) = created_by) OR is_event_participant((select auth.uid()), id));

CREATE POLICY "professional_events_manage_policy" ON public.professional_events
FOR ALL TO public
USING ((select auth.uid()) = created_by)
WITH CHECK ((select auth.uid()) = created_by);


-- 6. professional_event_participants (Consolidate & Optimize)
DROP POLICY IF EXISTS "Event creators can manage participants" ON public.professional_event_participants;
DROP POLICY IF EXISTS "Users can view own participations" ON public.professional_event_participants;
DROP POLICY IF EXISTS "Users can update own confirmation" ON public.professional_event_participants;

CREATE POLICY "professional_event_participants_select_policy" ON public.professional_event_participants
FOR SELECT TO public
USING (
  ((select auth.uid()) = user_id) OR
  (event_id IN (SELECT get_user_event_ids((select auth.uid()))))
);

CREATE POLICY "professional_event_participants_update_policy" ON public.professional_event_participants
FOR UPDATE TO public
USING (
  ((select auth.uid()) = user_id) OR
  (event_id IN (SELECT get_user_event_ids((select auth.uid()))))
);

CREATE POLICY "professional_event_participants_delete_policy" ON public.professional_event_participants
FOR DELETE TO public
USING (event_id IN (SELECT get_user_event_ids((select auth.uid()))));

CREATE POLICY "professional_event_participants_insert_policy" ON public.professional_event_participants
FOR INSERT TO public
WITH CHECK (event_id IN (SELECT get_user_event_ids((select auth.uid()))));


-- 7. messages (Optimize)
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations" ON public.messages
FOR SELECT TO public
USING (EXISTS ( SELECT 1 FROM conversations WHERE ((conversations.id = messages.conversation_id) AND ((conversations.seller_id = (select auth.uid())) OR (conversations.buyer_id = (select auth.uid()))))));

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON public.messages;
CREATE POLICY "Users can send messages in their conversations" ON public.messages
FOR INSERT TO public
WITH CHECK (((select auth.uid()) = sender_id) AND (EXISTS ( SELECT 1 FROM conversations WHERE ((conversations.id = messages.conversation_id) AND ((conversations.seller_id = (select auth.uid())) OR (conversations.buyer_id = (select auth.uid())))))));

DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE TO public USING ((select auth.uid()) = sender_id);


-- 8. conversations (Optimize)
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO public WITH CHECK (((select auth.uid()) = buyer_id) OR ((select auth.uid()) = seller_id));

DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE TO public USING (((select auth.uid()) = seller_id) OR ((select auth.uid()) = buyer_id));


-- 9. favorites (Optimize)
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own favorites" ON public.favorites;
CREATE POLICY "Users can create own favorites" ON public.favorites FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites" ON public.favorites FOR DELETE TO public USING ((select auth.uid()) = user_id);


-- 10. notifications (Optimize)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO public USING ((select auth.uid()) = user_id);


-- 11. professional_reviews (Optimize)
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.professional_reviews;
CREATE POLICY "Authenticated users can create reviews" ON public.professional_reviews FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.professional_reviews;
CREATE POLICY "Users can update own reviews" ON public.professional_reviews FOR UPDATE TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.professional_reviews;
CREATE POLICY "Users can delete own reviews" ON public.professional_reviews FOR DELETE TO public USING ((select auth.uid()) = user_id);


-- 12. vault_access_requests (Optimize)
DROP POLICY IF EXISTS "Users can view own vault access requests" ON public.vault_access_requests;
CREATE POLICY "Users can view own vault access requests" ON public.vault_access_requests FOR SELECT TO public USING ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Owners can view vault requests for their properties" ON public.vault_access_requests;
CREATE POLICY "Owners can view vault requests for their properties" ON public.vault_access_requests FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM properties WHERE (((properties.id)::text = vault_access_requests.property_id) AND (properties.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Professionals can view vault requests for them" ON public.vault_access_requests;
CREATE POLICY "Professionals can view vault requests for them" ON public.vault_access_requests FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM professionals WHERE ((professionals.id = vault_access_requests.professional_id) AND (professionals.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Users can create vault access requests" ON public.vault_access_requests;
CREATE POLICY "Users can create vault access requests" ON public.vault_access_requests FOR INSERT TO public WITH CHECK ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Users can update own vault access requests" ON public.vault_access_requests;
CREATE POLICY "Users can update own vault access requests" ON public.vault_access_requests FOR UPDATE TO public USING ((select auth.uid()) = requester_id);

DROP POLICY IF EXISTS "Professionals can update vault requests for them" ON public.vault_access_requests;
CREATE POLICY "Professionals can update vault requests for them" ON public.vault_access_requests FOR UPDATE TO public USING (EXISTS ( SELECT 1 FROM professionals WHERE ((professionals.id = vault_access_requests.professional_id) AND (professionals.user_id = (select auth.uid())))));


-- 13. vault_documents (Optimize)
DROP POLICY IF EXISTS "Users can view own documents" ON public.vault_documents;
CREATE POLICY "Users can view own documents" ON public.vault_documents FOR SELECT TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Professionals can view vault documents with granted access" ON public.vault_documents;
CREATE POLICY "Professionals can view vault documents with granted access" ON public.vault_documents FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM (vault_access_requests var JOIN professionals p ON ((p.id = var.professional_id))) WHERE ((var.status = 'granted'::text) AND (p.user_id = (select auth.uid())) AND (var.property_id = (vault_documents.property_id)::text))));

DROP POLICY IF EXISTS "Authenticated users can view vault docs of active properties" ON public.vault_documents;
CREATE POLICY "Authenticated users can view vault docs of active properties" ON public.vault_documents FOR SELECT TO public USING (((select auth.uid()) IS NOT NULL) AND (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = vault_documents.property_id) AND (properties.status = 'active'::text)))));

DROP POLICY IF EXISTS "Buyers with paid access can view vault documents" ON public.vault_documents;
CREATE POLICY "Buyers with paid access can view vault documents" ON public.vault_documents FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM vault_buyer_access vba WHERE ((vba.property_id = vault_documents.property_id) AND (vba.buyer_id = (select auth.uid())) AND (vba.status = 'paid'::text))));

DROP POLICY IF EXISTS "Users can create own documents" ON public.vault_documents;
CREATE POLICY "Users can create own documents" ON public.vault_documents FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.vault_documents;
CREATE POLICY "Users can update own documents" ON public.vault_documents FOR UPDATE TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.vault_documents;
CREATE POLICY "Users can delete own documents" ON public.vault_documents FOR DELETE TO public USING ((select auth.uid()) = user_id);


-- 14. visit_bookings (Optimize)
DROP POLICY IF EXISTS "Visitors can view own bookings" ON public.visit_bookings;
CREATE POLICY "Visitors can view own bookings" ON public.visit_bookings FOR SELECT TO public USING ((select auth.uid()) = visitor_id);

DROP POLICY IF EXISTS "Sellers can view their visit bookings" ON public.visit_bookings;
CREATE POLICY "Sellers can view their visit bookings" ON public.visit_bookings FOR SELECT TO public USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Authenticated users can create visit bookings" ON public.visit_bookings;
CREATE POLICY "Authenticated users can create visit bookings" ON public.visit_bookings FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = visitor_id);

DROP POLICY IF EXISTS "Sellers can update their visit bookings" ON public.visit_bookings;
CREATE POLICY "Sellers can update their visit bookings" ON public.visit_bookings FOR UPDATE TO public USING ((select auth.uid()) = seller_id);


-- 15. visit_availability (Optimize)
DROP POLICY IF EXISTS "Sellers can create availability" ON public.visit_availability;
CREATE POLICY "Sellers can create availability" ON public.visit_availability FOR INSERT TO public WITH CHECK ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Sellers can update own availability" ON public.visit_availability;
CREATE POLICY "Sellers can update own availability" ON public.visit_availability FOR UPDATE TO public USING ((select auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Sellers can delete own availability" ON public.visit_availability;
CREATE POLICY "Sellers can delete own availability" ON public.visit_availability FOR DELETE TO public USING ((select auth.uid()) = seller_id);


-- 16. vault_buyer_access (Optimize)
DROP POLICY IF EXISTS "Buyers can create own access requests" ON public.vault_buyer_access;
CREATE POLICY "Buyers can create own access requests" ON public.vault_buyer_access FOR INSERT TO public WITH CHECK ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Buyers can view own access requests" ON public.vault_buyer_access;
CREATE POLICY "Buyers can view own access requests" ON public.vault_buyer_access FOR SELECT TO public USING ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Owners can view requests for their properties" ON public.vault_buyer_access;
CREATE POLICY "Owners can view requests for their properties" ON public.vault_buyer_access FOR SELECT TO public USING ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Buyers can update own requests" ON public.vault_buyer_access;
CREATE POLICY "Buyers can update own requests" ON public.vault_buyer_access FOR UPDATE TO public USING ((select auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Owners can update requests for their properties" ON public.vault_buyer_access;
CREATE POLICY "Owners can update requests for their properties" ON public.vault_buyer_access FOR UPDATE TO public USING ((select auth.uid()) = owner_id);


-- 17. property_proposals (Optimize)
DROP POLICY IF EXISTS "Users can view proposals for their properties" ON public.property_proposals;
CREATE POLICY "Users can view proposals for their properties" ON public.property_proposals FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_proposals.property_id) AND (properties.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Users can create proposals for their properties" ON public.property_proposals;
CREATE POLICY "Users can create proposals for their properties" ON public.property_proposals FOR INSERT TO public WITH CHECK (((select auth.uid()) = user_id) AND (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_proposals.property_id) AND (properties.user_id = (select auth.uid()))))));

DROP POLICY IF EXISTS "Users can update proposals for their properties" ON public.property_proposals;
CREATE POLICY "Users can update proposals for their properties" ON public.property_proposals FOR UPDATE TO public USING (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_proposals.property_id) AND (properties.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Users can delete pending proposals for their properties" ON public.property_proposals;
CREATE POLICY "Users can delete pending proposals for their properties" ON public.property_proposals FOR DELETE TO public USING ((status = 'pending'::text) AND (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_proposals.property_id) AND (properties.user_id = (select auth.uid()))))));


-- 18. professional_relationships (Optimize)
DROP POLICY IF EXISTS "Users can view their relationships" ON public.professional_relationships;
CREATE POLICY "Users can view their relationships" ON public.professional_relationships FOR SELECT TO public USING (((select auth.uid()) = user_id) OR (EXISTS ( SELECT 1 FROM professionals WHERE ((professionals.id = professional_relationships.professional_id) AND (professionals.user_id = (select auth.uid()))))));

DROP POLICY IF EXISTS "Professionals can create relationships" ON public.professional_relationships;
CREATE POLICY "Professionals can create relationships" ON public.professional_relationships FOR INSERT TO public WITH CHECK (EXISTS ( SELECT 1 FROM professionals WHERE ((professionals.id = professional_relationships.professional_id) AND (professionals.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Professionals can update their relationships" ON public.professional_relationships;
CREATE POLICY "Professionals can update their relationships" ON public.professional_relationships FOR UPDATE TO public USING (EXISTS ( SELECT 1 FROM professionals WHERE ((professionals.id = professional_relationships.professional_id) AND (professionals.user_id = (select auth.uid())))));


-- 19. professional_legal_acceptances (Optimize)
DROP POLICY IF EXISTS "Users can view own legal acceptances" ON public.professional_legal_acceptances;
CREATE POLICY "Users can view own legal acceptances" ON public.professional_legal_acceptances FOR SELECT TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Service role can insert legal acceptances" ON public.professional_legal_acceptances;
CREATE POLICY "Service role can insert legal acceptances" ON public.professional_legal_acceptances FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);


-- 20. user_legal_acceptances (Optimize)
DROP POLICY IF EXISTS "Users can view own legal acceptance" ON public.user_legal_acceptances;
CREATE POLICY "Users can view own legal acceptance" ON public.user_legal_acceptances FOR SELECT TO public USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own legal acceptance" ON public.user_legal_acceptances;
CREATE POLICY "Users can insert own legal acceptance" ON public.user_legal_acceptances FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);


-- 21. vault_consent_acceptances (Optimize)
DROP POLICY IF EXISTS "Users can create own vault consent" ON public.vault_consent_acceptances;
CREATE POLICY "Users can create own vault consent" ON public.vault_consent_acceptances FOR INSERT TO public WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own vault consent" ON public.vault_consent_acceptances;
CREATE POLICY "Users can view own vault consent" ON public.vault_consent_acceptances FOR SELECT TO public USING ((select auth.uid()) = user_id);


-- 22. property_addons (Optimize)
DROP POLICY IF EXISTS "Users can view addons for their own properties" ON public.property_addons;
CREATE POLICY "Users can view addons for their own properties" ON public.property_addons FOR SELECT TO authenticated USING (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_addons.property_id) AND (properties.user_id = (select auth.uid())))));

DROP POLICY IF EXISTS "Users can insert addons for their own properties" ON public.property_addons;
CREATE POLICY "Users can insert addons for their own properties" ON public.property_addons FOR INSERT TO authenticated WITH CHECK (EXISTS ( SELECT 1 FROM properties WHERE ((properties.id = property_addons.property_id) AND (properties.user_id = (select auth.uid())))));


-- 23. sms_notifications (Optimize)
DROP POLICY IF EXISTS "Users can view own sms notifications" ON public.sms_notifications;
CREATE POLICY "Users can view own sms notifications" ON public.sms_notifications FOR SELECT TO public USING ((select auth.uid()) = user_id);

COMMIT;
