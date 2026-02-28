-- Create storage policies for vault-documents bucket
-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload their own vault documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vault-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own vault documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vault-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own vault documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vault-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own vault documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vault-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to documents marked as public in vault_documents table
CREATE POLICY "Public can view public vault documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vault-documents' AND 
  EXISTS (
    SELECT 1 FROM vault_documents vd
    WHERE vd.file_url LIKE '%' || storage.objects.name || '%'
    AND vd.is_public = true
  )
);

-- Add category column if not exists (for document organization)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vault_documents' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE vault_documents ADD COLUMN category text DEFAULT 'outros';
  END IF;
END $$;

-- Add expiry_date column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vault_documents' 
    AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE vault_documents ADD COLUMN expiry_date date;
  END IF;
END $$;