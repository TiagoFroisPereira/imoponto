
CREATE TABLE public.waitlist_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  interests text[] NOT NULL DEFAULT '{}',
  source text DEFAULT 'auth_waitlist',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_subscribers_email_idx ON public.waitlist_subscribers (email);

ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert to waitlist" ON public.waitlist_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view waitlist" ON public.waitlist_subscribers
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
