import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'No Authorization header' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        })

        const { data: { user }, error: authError } = await userClient.auth.getUser()

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const adminClient = createClient(supabaseUrl, supabaseServiceKey)
        const body = await req.json()
        const { mode, priceId, vaultRequestId, successUrl, cancelUrl } = body

        const { data: profile } = await adminClient
            .from('profiles')
            .select('full_name, phone, stripe_customer_id')
            .eq('id', user.id)
            .single()

        let customerId = profile?.stripe_customer_id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: profile?.full_name || undefined,
                phone: profile?.phone || undefined,
                metadata: { supabase_user_id: user.id },
            })
            customerId = customer.id
            await adminClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
        }

        // Define payment methods based on mode
        // Multibanco is only for one-time payments
        const paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
            mode === 'subscription'
                ? ['card'] // Simplest for subscriptions
                : ['card', 'multibanco', 'mb_way'];

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            payment_method_types: paymentMethods,
            locale: 'pt',
            success_url: successUrl || `${req.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.get('origin')}/payment/canceled`,
            metadata: { user_id: user.id },
        }

        if (mode === 'subscription') {
            sessionConfig.mode = 'subscription'
            sessionConfig.line_items = [{ price: priceId, quantity: 1 }]
            sessionConfig.subscription_data = {
                metadata: { user_id: user.id },
            }
        } else if (mode === 'payment') {
            sessionConfig.mode = 'payment'
            sessionConfig.line_items = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Acesso ao Cofre Digital',
                            description: 'Acesso único aos documentos do imóvel',
                        },
                        unit_amount: 1000,
                    },
                    quantity: 1,
                },
            ]
            sessionConfig.metadata.vault_request_id = vaultRequestId
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        return new Response(
            JSON.stringify({ url: session.url, sessionId: session.id }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('Function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
