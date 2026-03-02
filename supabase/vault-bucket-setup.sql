-- Run this in your Supabase SQL Editor to manually create the 'vault-documents' bucket
-- and set up the necessary RLS policies.

-- 1. Create storage bucket for vault documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-documents',
  'vault-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. RLS policies for vault-documents bucket
-- Delete existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own documents" ON storage.objects;

-- Users can upload their own documents (folder structure: user_id/property_id/file)
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own documents OR shared documents OR if they are admins
CREATE POLICY "Users can view own or shared documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault-documents' 
  AND (
    -- 1. Owner of the document
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- 2. Professional with granted access to the property's vault
    EXISTS (
      SELECT 1 FROM public.vault_access_requests var
      JOIN public.professionals p ON p.id = var.professional_id
      WHERE var.property_id::text = (storage.foldername(name))[2]
      AND p.user_id = auth.uid()
      AND var.status = 'granted'
    )
    OR
    -- 3. Buyer with paid access to the property's vault
    EXISTS (
      SELECT 1 FROM public.vault_buyer_access vba
      WHERE vba.property_id::text = (storage.foldername(name))[2]
      AND vba.buyer_id = auth.uid()
      AND vba.status = 'paid'
    )
  )
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vault-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vault-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
