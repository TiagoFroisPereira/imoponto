
-- Table for buyer vault access requests
CREATE TABLE public.vault_buyer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  payment_amount NUMERIC NOT NULL DEFAULT 10.00,
  message TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_buyer_access ENABLE ROW LEVEL SECURITY;

-- Buyers can create their own requests
CREATE POLICY "Buyers can create own access requests"
ON public.vault_buyer_access FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Buyers can view their own requests
CREATE POLICY "Buyers can view own access requests"
ON public.vault_buyer_access FOR SELECT
USING (auth.uid() = buyer_id);

-- Owners can view requests for their properties
CREATE POLICY "Owners can view requests for their properties"
ON public.vault_buyer_access FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can update requests for their properties (approve/reject)
CREATE POLICY "Owners can update requests for their properties"
ON public.vault_buyer_access FOR UPDATE
USING (auth.uid() = owner_id);

-- Buyers can update own requests (for payment status)
CREATE POLICY "Buyers can update own requests"
ON public.vault_buyer_access FOR UPDATE
USING (auth.uid() = buyer_id);

-- Trigger for updated_at
CREATE TRIGGER update_vault_buyer_access_updated_at
BEFORE UPDATE ON public.vault_buyer_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Allow buyers with paid access to view vault documents
CREATE POLICY "Buyers with paid access can view vault documents"
ON public.vault_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vault_buyer_access vba
    WHERE vba.property_id = vault_documents.property_id
      AND vba.buyer_id = auth.uid()
      AND vba.status = 'paid'
  )
);
