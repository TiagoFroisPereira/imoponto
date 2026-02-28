-- Add chat_enabled field to profiles
ALTER TABLE public.profiles 
ADD COLUMN chat_enabled boolean DEFAULT true;

-- Create conversations table for internal chat
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id text NOT NULL,
  seller_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  last_message_at timestamp with time zone DEFAULT now(),
  is_read_by_seller boolean DEFAULT false,
  is_read_by_buyer boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS for conversations - users can only see conversations they're part of
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- RLS for messages
CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations 
  WHERE conversations.id = messages.conversation_id 
  AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
));

CREATE POLICY "Users can send messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.seller_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);

CREATE POLICY "Users can update own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Create visit bookings table
CREATE TABLE public.visit_bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id text NOT NULL,
  seller_id uuid NOT NULL,
  visitor_id uuid NOT NULL,
  visitor_name text NOT NULL,
  visitor_phone text NOT NULL,
  visitor_email text,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for visit_bookings
ALTER TABLE public.visit_bookings ENABLE ROW LEVEL SECURITY;

-- RLS for visit_bookings
CREATE POLICY "Sellers can view their visit bookings"
ON public.visit_bookings
FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can create visit bookings"
ON public.visit_bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sellers can update their visit bookings"
ON public.visit_bookings
FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Visitors can view own bookings"
ON public.visit_bookings
FOR SELECT
USING (auth.uid() = visitor_id);

-- Triggers for updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visit_bookings_updated_at
BEFORE UPDATE ON public.visit_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;