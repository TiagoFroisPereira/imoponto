import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        console.log(`Received event: ${event.type}`)

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                await handleCheckoutCompleted(session)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionUpdated(subscription)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                await handleSubscriptionDeleted(subscription)
                break
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice
                await handleInvoicePaymentSucceeded(invoice)
                break
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice
                await handleInvoicePaymentFailed(invoice)
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error('Webhook error:', errorMessage)
        return new Response(`Webhook Error: ${errorMessage}`, { status: 400 })
    }
})

async function getSupabase() {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
}

async function getProductInfo(supabase: any, key?: string, priceId?: string) {
    if (!key && !priceId) return null

    let query = supabase.from('plans_addons').select('*')
    if (key) {
        query = query.eq('key', key)
    } else {
        query = query.or(`stripe_price_id.eq.${priceId},stripe_yearly_price_id.eq.${priceId}`)
    }

    const { data } = await query.single()
    return data
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const supabase = await getSupabase()
    const userId = session.metadata?.user_id
    const customerId = session.customer as string
    const productKey = session.metadata?.product_key
    const propertyId = session.metadata?.property_id
    const vaultRequestId = session.metadata?.vault_request_id

    if (!userId) {
        console.error('No user_id in session metadata')
        return
    }

    // 1. Fetch Product Info
    const product = await getProductInfo(supabase, productKey)

    // 2. Handle Subscription Checkout
    if (session.mode === 'subscription') {
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        // If we didn't get product via key, try via priceId
        const subscriptionProduct = product || await getProductInfo(supabase, undefined, priceId)
        const planName = subscriptionProduct?.key || 'free'

        const { error } = await supabase
            .from('profiles')
            .update({
                plan: planName,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)

        if (error) {
            console.error('Error updating profile:', error)
        } else {
            console.log(`Updated user ${userId} to plan ${planName}`)
            await sendConfirmationEmail(supabase, userId, session, `Plano ${planName.toUpperCase()}`)
        }
    }

    // 3. Handle One-time Payment (vault access or addons)
    if (session.mode === 'payment') {
        console.log(`Processing one-time payment: productKey=${productKey}, propertyId=${propertyId}, vaultRequestId=${vaultRequestId}`)

        // 3a. Generic Addon Insertion (if product type is addon)
        if (propertyId && product?.type === 'addon') {
            const { error: addonError } = await supabase
                .from('property_addons')
                .insert({
                    property_id: propertyId,
                    addon_type: product.key,
                    expires_at: product.key === 'promotion'
                        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        : null
                })

            if (addonError) console.error('Error inserting property addon:', addonError)
            else console.log(`Successfully added addon ${product.key} to property ${propertyId}`)
        }
        // 3b. Fallback for known legacy addons not in DB yet (optional, but safer)
        else if (propertyId && productKey && ['extra_photos', 'video', 'promotion'].includes(productKey)) {
            await supabase.from('property_addons').insert({
                property_id: propertyId,
                addon_type: productKey,
                expires_at: productKey === 'promotion' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
            })
        }

        // 3c. Handle Vault Access Request
        if (vaultRequestId) {
            const { data: profRequest } = await supabase
                .from('vault_access_requests')
                .update({ status: 'paid', payment_status: 'paid' })
                .eq('id', vaultRequestId)
                .select()

            if (!profRequest || profRequest.length === 0) {
                await supabase.from('vault_buyer_access')
                    .update({ status: 'paid', payment_status: 'paid' })
                    .eq('id', vaultRequestId)
            }
        }

        // Send confirmation email
        let serviceName = product?.name || 'Serviço ImoPonto'
        if (vaultRequestId) serviceName = 'Acesso ao Cofre Digital'

        await sendConfirmationEmail(supabase, userId, session, serviceName)
    }
}

async function sendConfirmationEmail(supabase: any, userId: string, session: any, serviceName: string) {
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('email, full_name, notification_settings')
        .eq('id', userId)
        .single()

    const settings = userProfile?.notification_settings as any;
    if (userProfile?.email && settings?.payment_receipt !== false) {
        await supabase.from('email_queue').insert({
            recipient_email: userProfile.email,
            template_key: 'payment_receipt',
            template_data: {
                userName: userProfile.full_name || 'Cliente',
                serviceName: serviceName,
                amount: `${(session.amount_total! / 100).toFixed(2)}€`,
                date: new Date().toLocaleDateString('pt-PT'),
                transactionId: session.id
            }
        })
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const supabase = await getSupabase()
    const customerId = subscription.customer as string

    await supabase
        .from('profiles')
        .update({
            subscription_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', customerId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const supabase = await getSupabase()
    const customerId = subscription.customer as string

    await supabase
        .from('profiles')
        .update({
            plan: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.customer_email) return

    const supabase = await getSupabase()
    const priceId = invoice.lines.data[0]?.price?.id
    const product = await getProductInfo(supabase, undefined, priceId)

    const { data: userProfile } = await supabase
        .from('profiles')
        .select('notification_settings')
        .eq('email', invoice.customer_email)
        .single()

    const settings = userProfile?.notification_settings as any;
    if (settings?.payment_receipt !== false) {
        await supabase.from('email_queue').insert({
            recipient_email: invoice.customer_email,
            template_key: 'payment_receipt',
            template_data: {
                userName: invoice.customer_name || 'Cliente',
                serviceName: product?.name || 'Renovação de Subscrição',
                amount: `${(invoice.amount_paid / 100).toFixed(2)}€`,
                date: new Date().toLocaleDateString('pt-PT'),
                transactionId: invoice.id
            }
        })
    }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const supabase = await getSupabase()
    const customerId = invoice.customer as string

    await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)
}
