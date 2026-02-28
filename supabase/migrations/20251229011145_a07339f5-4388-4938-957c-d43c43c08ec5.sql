-- Create table to store seller-defined visit availability
CREATE TABLE public.visit_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  available_date DATE NOT NULL,
  time_slots TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, available_date)
);

-- Enable RLS
ALTER TABLE public.visit_availability ENABLE ROW LEVEL SECURITY;

-- Sellers can manage their own availability
CREATE POLICY "Sellers can create availability"
ON public.visit_availability FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own availability"
ON public.visit_availability FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own availability"
ON public.visit_availability FOR DELETE
USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view availability"
ON public.visit_availability FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_visit_availability_updated_at
BEFORE UPDATE ON public.visit_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for visit_availability
ALTER PUBLICATION supabase_realtime ADD TABLE public.visit_availability;