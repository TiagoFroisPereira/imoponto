-- Migration: Messaging Architectural Refactor
-- Created: 2026-03-04
-- Purpose: Optimize inbox performance and move archiving to conversation level (per-user)

-- 1. Add columns to conversations for per-user archiving
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS is_archived_by_buyer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived_by_seller BOOLEAN DEFAULT false;

-- 2. Add message_type to messages to distinguish between service inquiries, scheduling, etc.
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'buyer_to_seller';

-- 3. Create optimized view for inbox fetching
-- This view joins properties to get titles and images without denormalization
-- It also aggregates the last message info and unread counts to avoid N+1 queries in the frontend
CREATE OR REPLACE VIEW public.view_conversation_details AS
SELECT 
    c.id,
    c.property_id,
    p.title as property_title,
    p.image_url as property_image,
    c.seller_id,
    c.buyer_id,
    c.last_message_at,
    c.is_read_by_seller,
    c.is_read_by_buyer,
    c.is_archived_by_seller,
    c.is_archived_by_buyer,
    c.created_at,
    c.updated_at,
    -- Get the last message as a JSON object
    (
        SELECT jsonb_build_object(
            'id', m.id,
            'content', m.content,
            'sender_id', m.sender_id,
            'created_at', m.created_at,
            'message_type', m.message_type
        )
        FROM public.messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message,
    -- Get unread counts (Buyer perspective)
    (
        SELECT COUNT(*)::INTEGER
        FROM public.messages m
        WHERE m.conversation_id = c.id 
          AND m.is_read = false 
          AND m.sender_id = c.seller_id
    ) as unread_count_buyer,
    -- Get unread counts (Seller perspective)
    (
        SELECT COUNT(*)::INTEGER
        FROM public.messages m
        WHERE m.conversation_id = c.id 
          AND m.is_read = false 
          AND m.sender_id = c.buyer_id
    ) as unread_count_seller
FROM 
    public.conversations c
LEFT JOIN 
    public.properties p ON c.property_id::uuid = p.id;

-- Ensure RLS is configured for the view
-- Permissions are granted to authenticated and anonymous users
GRANT SELECT ON public.view_conversation_details TO authenticated;
GRANT SELECT ON public.view_conversation_details TO anon;

-- 4. Conversations RLS Policies
-- Enable participants to view and update their own conversations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' AND policyname = 'Users can view own conversations'
    ) THEN
        CREATE POLICY "Users can view own conversations" ON public.conversations
        FOR SELECT
        USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' AND policyname = 'Users can update own conversations'
    ) THEN
        CREATE POLICY "Users can update own conversations" ON public.conversations
        FOR UPDATE
        USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
        WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
    END IF;
END $$;
