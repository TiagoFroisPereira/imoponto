-- Create storage bucket for vault documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-documents',
  'vault-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- RLS policies for vault-documents bucket
-- Users can upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vault-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vault-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
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

-- Add category column to vault_documents for document classification
ALTER TABLE public.vault_documents 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'outros';

-- Add expiry_date for document validity
ALTER TABLE public.vault_documents 
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Enable realtime for visit_bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_bookings;