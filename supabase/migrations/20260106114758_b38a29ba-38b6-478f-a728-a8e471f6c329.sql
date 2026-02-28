-- Add is_archived column to messages table for archive functionality
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- Add message_type to distinguish message origins (buyer_to_seller, scheduling, professional_contact)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'buyer_to_seller';

-- Add property_title to conversations for better display
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS property_title text;

-- Create index for faster archived message queries
CREATE INDEX IF NOT EXISTS idx_messages_archived ON public.messages(is_archived);

-- Create index for message types
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);