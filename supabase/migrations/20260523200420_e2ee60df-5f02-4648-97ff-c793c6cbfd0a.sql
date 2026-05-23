
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
