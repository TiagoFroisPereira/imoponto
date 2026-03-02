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
        const { mode, priceId: initialPriceId, productKey, billingPeriod, vaultRequestId, propertyId, quantity, metadata, successUrl, cancelUrl } = body

        let priceId = initialPriceId

        // If productKey is provided, fetch the priceId and type from the database
        if (productKey && !priceId) {
            const { data: product, error: dbError } = await adminClient
                .from('plans_addons')
                .select('stripe_price_id, stripe_yearly_price_id, type')
                .eq('key', productKey)
                .single()

            if (dbError || !product) {
                console.error('Error fetching product from DB:', dbError)
                throw new Error(`Product mapping not found for: ${productKey}`)
            }

            // Select the correct price ID based on billing period
            priceId = billingPeriod === 'yearly' ? product.stripe_yearly_price_id : product.stripe_price_id

            // Fallback to monthly if yearly not found
            if (!priceId) {
                priceId = product.stripe_price_id || product.stripe_yearly_price_id
            }

            if (!priceId) throw new Error(`Stripe price not configured for: ${productKey}${billingPeriod ? ` (${billingPeriod})` : ''}`)

            // Automatically determine mode from product type if not explicitly overridden to something valid
            // If it's a plan, it MUST be a subscription. If it's an addon, it's a one-time payment.
            const resolvedMode = product.type === 'plan' ? 'subscription' : 'payment'

            // Log for debugging
            console.log(`Resolved mode for ${productKey}: ${resolvedMode} (Product type: ${product.type})`)

            // Update the mode to match the product type
            var finalMode: 'payment' | 'subscription' = resolvedMode
        } else {
            var finalMode: 'payment' | 'subscription' = (mode as any) || 'payment'
        }

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
        const paymentMethods: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
            finalMode === 'subscription'
                ? ['card']
                : ['card', 'multibanco', 'mb_way'];

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            customer: customerId,
            payment_method_types: paymentMethods,
            mode: finalMode as any,
            locale: 'pt',
            success_url: successUrl || `${req.headers.get('origin')}/pagamentos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl || `${req.headers.get('origin')}/pagamentos/cancelado`,
            metadata: {
                user_id: user.id,
                property_id: propertyId,
                product_key: productKey,
                ...metadata
            },
        }

        // Add line items
        if (priceId) {
            sessionConfig.line_items = [{ price: priceId, quantity: quantity || 1 }]
        } else if (finalMode === 'payment') {
            // Fallback for professional access where we might not have a priceId yet?
            // Actually we should always have a priceId now, but keeping as safety.
            sessionConfig.line_items = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: productKey === 'vault_access' ? 'Acesso ao Cofre Digital' : 'Serviço ImoPonto',
                            description: 'Pagamento único de serviço',
                        },
                        unit_amount: 1000,
                    },
                    quantity: quantity || 1,
                },
            ]
        }

        if (finalMode === 'subscription') {
            sessionConfig.subscription_data = {
                metadata: {
                    user_id: user.id,
                    property_id: propertyId,
                    product_key: productKey,
                    ...metadata
                },
            }
        } else {
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
