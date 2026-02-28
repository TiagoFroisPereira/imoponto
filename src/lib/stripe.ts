import { supabase } from '@/integrations/supabase/client';

export interface CreateCheckoutParams {
    mode: 'subscription' | 'payment';
    priceId?: string; // For subscriptions
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
    const priceMap = {
        start_monthly: STRIPE_PRICES.START_MONTHLY,
        start_yearly: STRIPE_PRICES.START_YEARLY,
        pro_monthly: STRIPE_PRICES.PRO_MONTHLY,
        pro_yearly: STRIPE_PRICES.PRO_YEARLY,
    };

    const priceId = priceMap[`${planType}_${billingPeriod}`];

    if (!priceId) {
        throw new Error('Invalid plan configuration');
    }

    const result = await createCheckoutSession({
        mode: 'subscription',
        priceId,
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/planos`,
    });

    // Redirect to Stripe Checkout
    if (result.url) {
        window.location.href = result.url;
    }

    return result;
}

export async function purchaseVaultAccess(vaultRequestId: string) {
    const result = await createCheckoutSession({
        mode: 'payment',
        vaultRequestId,
        successUrl: `${window.location.origin}/painel-profissional?vault_access=success`,
        cancelUrl: `${window.location.origin}/painel-profissional`,
    });

    // Redirect to Stripe Checkout
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
