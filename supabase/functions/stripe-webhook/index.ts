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

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const userId = session.metadata?.user_id
    const customerId = session.customer as string

    if (!userId) {
        console.error('No user_id in session metadata')
        return
    }

    // Handle subscription checkout
    if (session.mode === 'subscription') {
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        // Map price ID to plan name
        const priceId = subscription.items.data[0]?.price.id
        const planMap: Record<string, string> = {
            [Deno.env.get('STRIPE_PRICE_START_MONTHLY') ?? '']: 'start',
            [Deno.env.get('STRIPE_PRICE_START_YEARLY') ?? '']: 'start',
            [Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') ?? '']: 'pro',
            [Deno.env.get('STRIPE_PRICE_PRO_YEARLY') ?? '']: 'pro',
        }

        const plan = planMap[priceId] || 'free'

        const { error } = await supabase
            .from('profiles')
            .update({
                plan,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: subscription.status,
                subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)

        if (error) {
            console.error('Error updating profile:', error)
        } else {
            console.log(`Updated user ${userId} to plan ${plan}`)

            // Send payment confirmation email
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('email, full_name, notification_settings')
                .eq('id', userId)
                .single()

            const settings = userProfile?.notification_settings as any;
            const canSend = settings?.payment_receipt !== false;

            if (userProfile?.email && canSend) {
                await supabase.from('email_queue').insert({
                    recipient_email: userProfile.email,
                    template_key: 'payment_receipt',
                    template_data: {
                        userName: userProfile.full_name || 'Cliente',
                        serviceName: `Plano ${plan.toUpperCase()}`,
                        amount: `${(session.amount_total! / 100).toFixed(2)}€`,
                        date: new Date().toLocaleDateString('pt-PT'),
                        transactionId: session.id
                    }
                })
            }
        }
    }

    // Handle one-time payment (vault access)
    if (session.mode === 'payment') {
        const vaultRequestId = session.metadata?.vault_request_id

        if (vaultRequestId) {
            const { error } = await supabase
                .from('vault_access_requests')
                .update({
                    status: 'paid',
                    payment_status: 'paid',
                })
                .eq('id', vaultRequestId)

            if (error) {
                console.error('Error updating vault request:', error)
            } else {
                console.log(`Vault access granted for request ${vaultRequestId}`)

                // Send confirmation for one-time payment
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('email, full_name, notification_settings')
                    .eq('id', userId)
                    .single()

                const settings = userProfile?.notification_settings as any;
                const canSend = settings?.payment_receipt !== false;

                if (userProfile?.email && canSend) {
                    await supabase.from('email_queue').insert({
                        recipient_email: userProfile.email,
                        template_key: 'payment_receipt',
                        template_data: {
                            userName: userProfile.full_name || 'Cliente',
                            serviceName: 'Acesso ao Vault de Documentos',
                            amount: `${(session.amount_total! / 100).toFixed(2)}€`,
                            date: new Date().toLocaleDateString('pt-PT'),
                            transactionId: session.id
                        }
                    })
                }
            }
        }
    }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const customerId = subscription.customer as string

    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_status: subscription.status,
            subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_customer_id', customerId)

    if (error) {
        console.error('Error updating subscription status:', error)
    }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const customerId = subscription.customer as string

    const { error } = await supabase
        .from('profiles')
        .update({
            plan: 'free',
            subscription_status: 'canceled',
            stripe_subscription_id: null,
        })
        .eq('stripe_customer_id', customerId)

    if (error) {
        console.error('Error reverting to free plan:', error)
    } else {
        console.log(`Subscription canceled for customer ${customerId}, reverted to free plan`)
    }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Payment succeeded for invoice ${invoice.id}`)

    if (invoice.customer_email) {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check preferences
        const { data: userProfile } = await supabase
            .from('profiles')
            .select('notification_settings')
            .eq('email', invoice.customer_email)
            .single()

        const settings = userProfile?.notification_settings as any;
        const canSend = settings?.payment_receipt !== false;

        if (canSend) {
            await supabase.from('email_queue').insert({
                recipient_email: invoice.customer_email,
                template_key: 'payment_receipt',
                template_data: {
                    userName: invoice.customer_name || 'Cliente',
                    serviceName: 'Renovação de Subscrição',
                    amount: `${(invoice.amount_paid / 100).toFixed(2)}€`,
                    date: new Date().toLocaleDateString('pt-PT'),
                    transactionId: invoice.id
                }
            })
        }
    }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const customerId = invoice.customer as string

    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_status: 'past_due',
        })
        .eq('stripe_customer_id', customerId)

    if (error) {
        console.error('Error updating payment failed status:', error)
    } else {
        console.log(`Payment failed for customer ${customerId}`)
    }
}
