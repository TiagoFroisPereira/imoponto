-- Functions for in-app notifications via triggers

-- 1. Function to handle message notifications
CREATE OR REPLACE FUNCTION public.handle_message_in_app_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_property_id UUID;
    v_property_title TEXT;
    v_sender_name TEXT;
BEGIN
    -- Get conversation and property details
    SELECT c.property_id, p.title, 
           CASE WHEN NEW.sender_id = c.buyer_id THEN c.seller_id ELSE c.buyer_id END
    INTO v_property_id, v_property_title, v_recipient_id
    FROM public.conversations c
    LEFT JOIN public.properties p ON c.property_id = p.id
    WHERE c.id = NEW.conversation_id;

    -- Get sender name
    SELECT full_name INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;

    -- Insert in-app notification
    INSERT INTO public.notifications (
        user_id,
        property_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        v_recipient_id,
        v_property_id,
        'message',
        'Nova mensagem!',
        CASE 
            WHEN v_property_title IS NOT NULL THEN 'Recebeu uma nova mensagem sobre "' || v_property_title || '"'
            ELSE 'Recebeu uma nova mensagem'
        END,
        jsonb_build_object(
            'sender_id', NEW.sender_id,
            'sender_name', COALESCE(v_sender_name, 'Alguém'),
            'conversation_id', NEW.conversation_id,
            'preview', left(NEW.content, 100)
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to handle visit booking notifications
CREATE OR REPLACE FUNCTION public.handle_visit_booking_in_app_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_property_title TEXT;
BEGIN
    -- Get property title
    SELECT title INTO v_property_title FROM public.properties WHERE id = NEW.property_id;

    -- Insert in-app notification for the seller
    INSERT INTO public.notifications (
        user_id,
        property_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        NEW.seller_id,
        NEW.property_id,
        'visit_booking',
        CASE WHEN NEW.scheduled_date IS NOT NULL AND NEW.scheduled_time IS NOT NULL THEN 'Nova visita agendada!' ELSE 'Solicitação de visita' END,
        CASE 
            WHEN NEW.scheduled_date IS NOT NULL AND NEW.scheduled_time IS NOT NULL THEN 
                COALESCE(NEW.visitor_name, 'Alguém') || ' agendou uma visita para "' || COALESCE(v_property_title, 'o seu imóvel') || '" no dia ' || to_char(NEW.scheduled_date, 'DD/MM/YYYY') || ' às ' || NEW.scheduled_time::text
            ELSE 
                COALESCE(NEW.visitor_name, 'Alguém') || ' solicitou um agendamento de visita para "' || COALESCE(v_property_title, 'o seu imóvel') || '"'
        END,
        jsonb_build_object(
            'visitor_name', NEW.visitor_name,
            'visitor_phone', NEW.visitor_phone,
            'visitor_email', NEW.visitor_email,
            'booking_id', NEW.id,
            'scheduled_date', NEW.scheduled_date,
            'scheduled_time', NEW.scheduled_time
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to handle professional vault access requests
CREATE OR REPLACE FUNCTION public.handle_vault_access_request_in_app_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_owner_id UUID;
    v_property_title TEXT;
    v_professional_name TEXT;
    v_professional_user_id UUID;
BEGIN
    -- Get property owner and title
    SELECT user_id, title INTO v_owner_id, v_property_title 
    FROM public.properties WHERE id = NEW.property_id;

    -- Get professional details
    SELECT name, user_id INTO v_professional_name, v_professional_user_id 
    FROM public.professionals WHERE id = NEW.professional_id;

    -- 1. Notify property owner (professional added)
    IF v_owner_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            property_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            v_owner_id,
            NEW.property_id,
            'professional_added',
            'Profissional adicionado ao cofre!',
            'O profissional ' || COALESCE(v_professional_name, 'Um profissional') || ' foi adicionado ao cofre do imóvel "' || COALESCE(v_property_title, 'o seu imóvel') || '"',
            jsonb_build_object(
                'professional_id', NEW.professional_id,
                'professional_name', v_professional_name,
                'requester_id', NEW.requester_id
            )
        );
    END IF;

    -- 2. Notify professional (new request)
    IF v_professional_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            property_id,
            type,
            title,
            message,
            metadata
        ) VALUES (
            v_professional_user_id,
            NEW.property_id,
            'new_vault_access_request',
            'Novo pedido de acesso ao cofre!',
            'Recebeu um pedido de acesso ao cofre digital do imóvel "' || COALESCE(v_property_title, 'o seu imóvel') || '"',
            jsonb_build_object(
                'requester_id', NEW.requester_id,
                'property_id', NEW.property_id
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to handle buyer vault access requests
CREATE OR REPLACE FUNCTION public.handle_buyer_vault_access_in_app_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_property_title TEXT;
    v_buyer_name TEXT;
BEGIN
    -- Get property title
    SELECT title INTO v_property_title FROM public.properties WHERE id = NEW.property_id;

    -- Get buyer details
    SELECT full_name INTO v_buyer_name FROM public.profiles WHERE id = NEW.buyer_id;

    -- Notify owner
    INSERT INTO public.notifications (
        user_id,
        property_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        NEW.owner_id,
        NEW.property_id,
        'buyer_vault_request',
        'Pedido de acesso ao cofre!',
        COALESCE(v_buyer_name, 'Um potencial comprador') || ' solicitou acesso ao cofre digital do imóvel "' || COALESCE(v_property_title, 'o seu imóvel') || '"',
        jsonb_build_object(
            'buyer_id', NEW.buyer_id,
            'buyer_name', v_buyer_name,
            'request_type', 'buyer_vault_access'
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retention/Cleanup function
CREATE OR REPLACE FUNCTION public.delete_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete read notifications older than 30 days
    DELETE FROM public.notifications
    WHERE is_read = true
    AND created_at < NOW() - INTERVAL '30 days';

    -- Delete unread notifications older than 90 days
    DELETE FROM public.notifications
    WHERE is_read = false
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Messages
DROP TRIGGER IF EXISTS on_message_in_app_notification ON public.messages;
CREATE TRIGGER on_message_in_app_notification
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_message_in_app_notification();

-- Visit Bookings
DROP TRIGGER IF EXISTS on_visit_booking_in_app_notification ON public.visit_bookings;
CREATE TRIGGER on_visit_booking_in_app_notification
AFTER INSERT ON public.visit_bookings
FOR EACH ROW EXECUTE FUNCTION public.handle_visit_booking_in_app_notification();

-- Vault Access Requests (Professionals)
DROP TRIGGER IF EXISTS on_vault_access_request_in_app_notification ON public.vault_access_requests;
CREATE TRIGGER on_vault_access_request_in_app_notification
AFTER INSERT ON public.vault_access_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_vault_access_request_in_app_notification();

-- Vault Buyer Access
DROP TRIGGER IF EXISTS on_buyer_vault_access_in_app_notification ON public.vault_buyer_access;
CREATE TRIGGER on_buyer_vault_access_in_app_notification
AFTER INSERT ON public.vault_buyer_access
FOR EACH ROW EXECUTE FUNCTION public.handle_buyer_vault_access_in_app_notification();
