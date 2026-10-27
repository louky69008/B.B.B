
CREATE TABLE public.profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos visible to authenticated" ON public.profile_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own photos" ON public.profile_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own photos" ON public.profile_photos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own photos" ON public.profile_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id uuid NOT NULL,
  liked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (liker_id, liked_id)
);
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see likes involving them" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = liker_id OR auth.uid() = liked_id);
CREATE POLICY "Users create own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = liker_id);
CREATE POLICY "Users delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = liker_id);

CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  conversation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own matches" ON public.matches FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reciprocal_exists boolean;
  a uuid; b uuid;
  conv_id uuid;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.likes WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id) INTO reciprocal_exists;
  IF reciprocal_exists THEN
    IF NEW.liker_id < NEW.liked_id THEN a := NEW.liker_id; b := NEW.liked_id;
    ELSE a := NEW.liked_id; b := NEW.liker_id; END IF;
    SELECT id INTO conv_id FROM public.conversations WHERE user1_id = a AND user2_id = b;
    IF conv_id IS NULL THEN
      INSERT INTO public.conversations (user1_id, user2_id) VALUES (a, b) RETURNING id INTO conv_id;
    END IF;
    INSERT INTO public.matches (user1_id, user2_id, conversation_id) VALUES (a, b, conv_id)
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_like_created AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_like();

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('free','basic_lite','monthly','premium','ultra','day_pass')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.profiles ADD COLUMN anonymous_mode boolean NOT NULL DEFAULT false;
