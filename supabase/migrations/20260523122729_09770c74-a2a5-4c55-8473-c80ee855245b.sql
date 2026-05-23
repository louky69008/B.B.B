
-- PARTIES
CREATE TABLE public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  access_code TEXT,
  floor TEXT,
  city TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  price_cents INTEGER,
  rules TEXT DEFAULT '',
  warnings TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open', -- open | full | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view parties"
  ON public.parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hosts create parties"
  ON public.parties FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update own parties"
  ON public.parties FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Hosts delete own parties"
  ON public.parties FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE TRIGGER parties_touch_updated_at
  BEFORE UPDATE ON public.parties
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PARTY REQUESTS
CREATE TABLE public.party_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (party_id, requester_id)
);

ALTER TABLE public.party_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requester and host can view requests"
  ON public.party_requests FOR SELECT TO authenticated USING (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.host_id = auth.uid())
  );
CREATE POLICY "Users create own requests"
  ON public.party_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requester cancels own, host updates status"
  ON public.party_requests FOR UPDATE TO authenticated USING (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.host_id = auth.uid())
  );

CREATE TRIGGER party_requests_touch_updated_at
  BEFORE UPDATE ON public.party_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PARTY PARTICIPANTS
CREATE TABLE public.party_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (party_id, user_id)
);

ALTER TABLE public.party_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants and host view participants"
  ON public.party_participants FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND (p.host_id = auth.uid()
            OR EXISTS (SELECT 1 FROM public.party_participants pp WHERE pp.party_id = party_id AND pp.user_id = auth.uid())))
  );
CREATE POLICY "Host adds participants"
  ON public.party_participants FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.host_id = auth.uid())
  );
CREATE POLICY "Participant leaves or host removes"
  ON public.party_participants FOR DELETE TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_id AND p.host_id = auth.uid())
  );

-- PARTY MESSAGES (group chat)
CREATE TABLE public.party_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.party_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view group messages"
  ON public.party_messages FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.party_participants pp WHERE pp.party_id = party_messages.party_id AND pp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_messages.party_id AND p.host_id = auth.uid())
  );
CREATE POLICY "Participants send group messages"
  ON public.party_messages FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.party_participants pp WHERE pp.party_id = party_messages.party_id AND pp.user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.parties p WHERE p.id = party_messages.party_id AND p.host_id = auth.uid())
    )
  );

CREATE INDEX idx_parties_starts_at ON public.parties(starts_at);
CREATE INDEX idx_party_messages_party ON public.party_messages(party_id, created_at);
CREATE INDEX idx_party_requests_party ON public.party_requests(party_id);
