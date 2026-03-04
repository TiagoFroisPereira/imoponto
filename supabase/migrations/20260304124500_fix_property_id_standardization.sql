-- Standardize property_id columns to UUID across messaging and booking tables
-- This fix resolves the "text = uuid" type mismatch errors

-- 0. DROP ALL DEPENDENTS
DROP VIEW IF EXISTS view_conversation_details;

-- Potential blockers (Policies)
DROP POLICY IF EXISTS "vault_access_requests_select_policy" ON vault_access_requests;
DROP POLICY IF EXISTS "vault_documents_select_policy" ON vault_documents;
DROP POLICY IF EXISTS "Users can view own or shared documents" ON storage.objects;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

DROP POLICY IF EXISTS "Users can view proposals for their properties" ON property_proposals;
DROP POLICY IF EXISTS "Users can create proposals for their properties" ON property_proposals;
DROP POLICY IF EXISTS "Users can update proposals for their properties" ON property_proposals;
DROP POLICY IF EXISTS "Users can delete pending proposals for their properties" ON property_proposals;

DROP POLICY IF EXISTS "Users can view addons for their own properties" ON property_addons;
DROP POLICY IF EXISTS "Users can insert addons for their own properties" ON property_addons;

-- 1. Standardize conversations table
ALTER TABLE conversations 
ALTER COLUMN property_id TYPE UUID USING (
  CASE 
    WHEN property_id IS NULL OR property_id = '' OR property_id IN ('none', 'service-request', 'null') THEN NULL 
    ELSE property_id::UUID 
  END
);

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_property_id_fkey;
ALTER TABLE conversations ADD CONSTRAINT conversations_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

-- 2. Standardize visit_bookings table
ALTER TABLE visit_bookings 
ALTER COLUMN property_id TYPE UUID USING (
  CASE 
    WHEN property_id IS NULL OR property_id = '' OR property_id IN ('none', 'service-request', 'null') THEN NULL 
    ELSE property_id::UUID 
  END
);
ALTER TABLE visit_bookings DROP CONSTRAINT IF EXISTS visit_bookings_property_id_fkey;
ALTER TABLE visit_bookings ADD CONSTRAINT visit_bookings_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

-- 3. Standardize vault_access_requests table
ALTER TABLE vault_access_requests 
ALTER COLUMN property_id TYPE UUID USING (
  CASE 
    WHEN property_id IS NULL OR property_id = '' OR property_id IN ('none', 'service-request', 'null') THEN NULL 
    ELSE property_id::UUID 
  END
);
ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_property_id_fkey;
ALTER TABLE vault_access_requests ADD CONSTRAINT vault_access_requests_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL;

-- 4. Fix vault_access_requests.vault_document_id
ALTER TABLE vault_access_requests 
ALTER COLUMN vault_document_id TYPE UUID USING (
  CASE 
    WHEN vault_document_id IS NULL OR vault_document_id = '' THEN NULL 
    ELSE vault_document_id::UUID 
  END
);
ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_vault_document_id_fkey;
ALTER TABLE vault_access_requests ADD CONSTRAINT vault_access_requests_vault_document_id_fkey 
FOREIGN KEY (vault_document_id) REFERENCES vault_documents(id) ON DELETE CASCADE;

-- 5. RE-CREATE VIEW (FIXED COLUMN NAME)
CREATE VIEW view_conversation_details AS
SELECT 
    c.*,
    p.title as property_title,
    p.image_url as property_image
FROM conversations c
LEFT JOIN properties p ON c.property_id = p.id;

-- 6. RE-CREATE POLICIES (optimized without string casts where possible)

CREATE POLICY "vault_access_requests_select_policy" ON vault_access_requests
FOR SELECT USING (
  (auth.uid() = requester_id) OR
  EXISTS (SELECT 1 FROM properties WHERE properties.id = vault_access_requests.property_id AND properties.user_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM professionals WHERE professionals.id = vault_access_requests.professional_id AND professionals.user_id = auth.uid())
);

CREATE POLICY "vault_documents_select_policy" ON vault_documents
FOR SELECT USING (
  (auth.uid() = user_id) OR
  (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM properties WHERE properties.id = vault_documents.property_id AND properties.status = 'active'::text)) OR
  EXISTS (SELECT 1 FROM vault_buyer_access vba WHERE vba.property_id = vault_documents.property_id AND vba.buyer_id = auth.uid() AND vba.status = 'paid'::text) OR
  EXISTS (SELECT 1 FROM vault_access_requests var JOIN professionals p ON p.id = var.professional_id WHERE var.status = 'granted'::text AND p.user_id = auth.uid() AND var.property_id = vault_documents.property_id)
);

CREATE POLICY "Users can view own or shared documents" ON storage.objects
FOR SELECT USING (
  (bucket_id = 'vault-documents'::text) AND (
    (auth.uid()::text = (storage.foldername(name))[1]) OR 
    EXISTS (SELECT 1 FROM vault_access_requests var JOIN professionals p ON p.id = var.professional_id WHERE var.property_id::text = (storage.foldername(p.name))[2] AND p.user_id = auth.uid() AND var.status = 'granted'::text) OR 
    EXISTS (SELECT 1 FROM vault_buyer_access vba WHERE vba.property_id::text = (storage.foldername(objects.name))[2] AND vba.buyer_id = auth.uid() AND vba.status = 'paid'::text)
  )
);

CREATE POLICY "profiles_select_policy" ON profiles
FOR SELECT USING (
  (auth.uid() = id) OR
  (auth.uid() IS NOT NULL AND (is_event_creator_of(auth.uid(), id) OR are_co_participants(auth.uid(), id) OR EXISTS (SELECT 1 FROM vault_buyer_access vba JOIN properties p ON p.id = vba.property_id WHERE vba.buyer_id = profiles.id AND p.user_id = auth.uid() AND vba.status = 'paid'::text) OR EXISTS (SELECT 1 FROM conversations c WHERE (c.seller_id = auth.uid() AND c.buyer_id = profiles.id) OR (c.buyer_id = auth.uid() AND c.seller_id = profiles.id))))
);

-- Proposal policies
CREATE POLICY "Users can view proposals for their properties" ON property_proposals
FOR SELECT USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_proposals.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "Users can create proposals for their properties" ON property_proposals
FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM properties WHERE properties.id = property_proposals.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "Users can update proposals for their properties" ON property_proposals
FOR UPDATE USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_proposals.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "Users can delete pending proposals for their properties" ON property_proposals
FOR DELETE USING (status = 'pending'::text AND EXISTS (SELECT 1 FROM properties WHERE properties.id = property_proposals.property_id AND properties.user_id = auth.uid()));

-- Addon policies
CREATE POLICY "Users can view addons for their own properties" ON property_addons
FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_addons.property_id AND properties.user_id = auth.uid()));

CREATE POLICY "Users can insert addons for their own properties" ON property_addons
FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_addons.property_id AND properties.user_id = auth.uid()));
