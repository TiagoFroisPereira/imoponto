
-- Add missing columns to vault_buyer_access (idempotent)
ALTER TABLE public.vault_buyer_access 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false;
