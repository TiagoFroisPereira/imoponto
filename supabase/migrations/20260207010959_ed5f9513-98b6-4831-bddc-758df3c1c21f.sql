-- Add terms_accepted column to professional_legal_acceptances table
ALTER TABLE public.professional_legal_acceptances 
ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.professional_legal_acceptances.terms_accepted IS 'Indicates if the professional accepted the terms of service during registration';