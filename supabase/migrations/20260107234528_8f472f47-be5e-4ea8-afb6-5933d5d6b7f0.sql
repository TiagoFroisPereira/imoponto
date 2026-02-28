-- Create proposals table for property sale wizard step 2
CREATE TABLE public.property_proposals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    deadline TEXT NOT NULL,
    requires_financing BOOLEAN NOT NULL DEFAULT false,
    has_written_proposal BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_proposals ENABLE ROW LEVEL SECURITY;

-- Users can view their own proposals (property owner)
CREATE POLICY "Users can view proposals for their properties"
ON public.property_proposals
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_proposals.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Users can create proposals for their properties
CREATE POLICY "Users can create proposals for their properties"
ON public.property_proposals
FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_proposals.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Users can update proposals for their properties
CREATE POLICY "Users can update proposals for their properties"
ON public.property_proposals
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_proposals.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Users can delete proposals for their properties (only pending ones)
CREATE POLICY "Users can delete pending proposals for their properties"
ON public.property_proposals
FOR DELETE
USING (
    status = 'pending' AND
    EXISTS (
        SELECT 1 FROM public.properties 
        WHERE properties.id = property_proposals.property_id 
        AND properties.user_id = auth.uid()
    )
);

-- Create trigger for updated_at
CREATE TRIGGER update_property_proposals_updated_at
BEFORE UPDATE ON public.property_proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();