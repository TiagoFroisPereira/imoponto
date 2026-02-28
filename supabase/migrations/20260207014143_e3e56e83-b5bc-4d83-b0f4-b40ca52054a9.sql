-- Create vault consent acceptances table for audit logging
CREATE TABLE public.vault_consent_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- Individual declarations
  declaration_responsibility_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_no_validation_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_professional_validation_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_access_responsibility_accepted BOOLEAN NOT NULL DEFAULT false,
  declaration_terms_accepted BOOLEAN NOT NULL DEFAULT false,
  
  -- Audit fields
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  terms_version TEXT NOT NULL DEFAULT '1.0',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one consent per user per property
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE public.vault_consent_acceptances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create own vault consent"
  ON public.vault_consent_acceptances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own vault consent"
  ON public.vault_consent_acceptances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_vault_consent_user_property ON public.vault_consent_acceptances(user_id, property_id);