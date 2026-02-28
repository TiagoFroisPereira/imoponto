-- Add subscription and payment tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'start', 'pro')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamp with time zone;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.plan IS 'User subscription plan: free, start (Destaque), or pro (Premium)';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.profiles.subscription_current_period_end IS 'When the current subscription period ends';