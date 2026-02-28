-- Create table to store professional legal acceptances (audit log)
CREATE TABLE public.professional_legal_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE,
  category_selected text NOT NULL,
  insurance_declaration_accepted boolean DEFAULT false,
  autonomy_declaration_1_accepted boolean NOT NULL DEFAULT false,
  autonomy_declaration_2_accepted boolean NOT NULL DEFAULT false,
  terms_version text NOT NULL DEFAULT '1.0',
  ip_address text,
  user_agent text,
  accepted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_legal_acceptances ENABLE ROW LEVEL SECURITY;

-- Only the system can insert (via service role), users can view their own
CREATE POLICY "Users can view own legal acceptances"
  ON public.professional_legal_acceptances
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert legal acceptances
CREATE POLICY "Service role can insert legal acceptances"
  ON public.professional_legal_acceptances
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for quick lookups
CREATE INDEX idx_legal_acceptances_user_id ON public.professional_legal_acceptances(user_id);
CREATE INDEX idx_legal_acceptances_professional_id ON public.professional_legal_acceptances(professional_id);