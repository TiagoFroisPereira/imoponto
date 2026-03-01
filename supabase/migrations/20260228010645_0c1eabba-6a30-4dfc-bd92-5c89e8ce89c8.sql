
ALTER TABLE public.professional_legal_acceptances
  ADD COLUMN credit_reg_banco_portugal BOOLEAN DEFAULT false,
  ADD COLUMN credit_reg_active BOOLEAN DEFAULT false,
  ADD COLUMN credit_scope_authorized BOOLEAN DEFAULT false,
  ADD COLUMN credit_insurance_rc BOOLEAN DEFAULT false,
  ADD COLUMN credit_autonomy BOOLEAN DEFAULT false,
  ADD COLUMN credit_dl_compliance BOOLEAN DEFAULT false;
