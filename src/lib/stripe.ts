import { supabase } from '@/integrations/supabase/client';

export interface CreateCheckoutParams {
    mode: 'subscription' | 'payment';
    priceId?: string; // For subscriptions (legacy)
    productKey?: string; // New: identify product by key
    billingPeriod?: 'monthly' | 'yearly'; // New: for plans
    vaultRequestId?: string; // For one-time payments
    successUrl?: string;
    cancelUrl?: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
    try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
            body: params,
        });

        if (error) throw error;

        return data as { url: string; sessionId: string };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

// Plan price IDs - these should match your Stripe dashboard
export const STRIPE_PRICES = {
    START_MONTHLY: 'price_1T4ivSPouTBk2CwULArTZiVF',
    START_YEARLY: 'price_1T4izwPouTBk2CwUJgJppQW9',
    PRO_MONTHLY: 'price_1T4iz2PouTBk2CwU1YLleFNq',
    PRO_YEARLY: 'price_1T4izZPouTBk2CwU4pviaxDL',
};

export async function subscribeToPlan(planType: 'start' | 'pro', billingPeriod: 'monthly' | 'yearly') {
    // We now pass the productKey and billingPeriod
    // The edge function will use this to pick the correct Stripe Price ID
    const result = await createCheckoutSession({
        mode: 'subscription',
        productKey: planType,
        billingPeriod,
        successUrl: `${window.location.origin}/pagamentos/sucesso?session_id={CHECKOUT_SESSION_ID}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        cancelUrl: `${window.location.origin}/pagamentos/cancelado?retry_url=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    });

    if (result.url) {
        window.location.href = result.url;
    }

    return result;
}

export async function purchaseVaultAccess(vaultRequestId: string) {
    const result = await createCheckoutSession({
        mode: 'payment',
        vaultRequestId,
        successUrl: `${window.location.origin}/pagamentos/sucesso?session_id={CHECKOUT_SESSION_ID}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        cancelUrl: `${window.location.origin}/pagamentos/cancelado?retry_url=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    });

    // Redirect to Stripe Checkout
    if (result.url) {
        window.location.href = result.url;
    }

    return result;
}

export async function purchaseAddon(propertyId: string, addonKey: string) {
    const result = await createCheckoutSession({
        mode: 'payment',
        productKey: addonKey,
        successUrl: `${window.location.origin}/pagamentos/sucesso?session_id={CHECKOUT_SESSION_ID}&from=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        cancelUrl: `${window.location.origin}/pagamentos/cancelado?retry_url=${encodeURIComponent(window.location.pathname + window.location.search)}`,
    });

    if (result.url) {
        window.location.href = result.url;
    }

    return result;
}

export async function createPortalSession() {
    try {
        const { data, error } = await supabase.functions.invoke('create-portal-session', {
            body: {},
        });

        if (error) throw error;

        if (data?.url) {
            window.location.href = data.url;
        }

        return data as { url: string };
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw error;
    }
}
