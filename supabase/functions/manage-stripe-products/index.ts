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
        if (!authHeader) throw new Error('No Authorization header')

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Check if user is admin
        const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
            global: { headers: { Authorization: authHeader } },
        })
        const { data: { user } } = await userClient.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single()

        if (!roleData) throw new Error('Only admins can sync products with Stripe')

        const body = await req.json()
        const { productKey } = body

        if (!productKey) throw new Error('Product key is required')

        // Fetch product from DB
        const { data: product, error: dbError } = await supabase
            .from('plans_addons')
            .select('*')
            .eq('key', productKey)
            .single()

        if (dbError || !product) throw new Error(`Product not found in database: ${productKey}`)

        // 1. Find or create Stripe Product
        let stripeProductId: string | undefined

        // Try to find by name/metadata first to avoid duplicates if stripe_price_id is lost
        const products = await stripe.products.list({ limit: 100 })
        const existingProduct = products.data.find(p => p.metadata.product_key === productKey || p.name === product.name)

        if (existingProduct) {
            stripeProductId = existingProduct.id
            // Update product details if needed
            await stripe.products.update(stripeProductId, {
                description: product.description,
                metadata: { product_key: productKey }
            })
        } else {
            const newProduct = await stripe.products.create({
                name: product.name,
                description: product.description,
                metadata: { product_key: productKey }
            })
            stripeProductId = newProduct.id
        }

        // 2. Create Stripe Price(s)
        const unitAmount = Math.round(product.price * 100)

        let stripePriceId: string | undefined
        let stripeYearlyPriceId: string | undefined

        // Create main price
        const price = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: unitAmount,
            currency: 'eur',
            recurring: product.type === 'plan' ? { interval: 'month' } : undefined,
            metadata: { product_key: productKey, type: 'regular' }
        })
        stripePriceId = price.id

        // Create yearly price if it's a plan and has yearly price
        if (product.type === 'plan' && product.yearly_price > 0) {
            const yearlyAmount = Math.round(product.yearly_price * 100)
            const yearlyPrice = await stripe.prices.create({
                product: stripeProductId,
                unit_amount: yearlyAmount,
                currency: 'eur',
                recurring: { interval: 'year' },
                metadata: { product_key: productKey, type: 'yearly' }
            })
            stripeYearlyPriceId = yearlyPrice.id
        }

        // 3. Update DB with new IDs
        const { error: updateError } = await supabase
            .from('plans_addons')
            .update({
                stripe_price_id: stripePriceId,
                stripe_yearly_price_id: stripeYearlyPriceId,
                updated_at: new Date().toISOString()
            })
            .eq('key', productKey)

        if (updateError) throw updateError

        return new Response(
            JSON.stringify({
                success: true,
                stripe_price_id: stripePriceId,
                stripe_yearly_price_id: stripeYearlyPriceId
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Function error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
