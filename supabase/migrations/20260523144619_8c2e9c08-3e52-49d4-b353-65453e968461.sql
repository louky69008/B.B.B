
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE INDEX idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON public.blocks(blocked_id);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see blocks involving them"
  ON public.blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

CREATE POLICY "Users create own blocks"
  ON public.blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users delete own blocks"
  ON public.blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

-- When a block is created, remove existing likes/matches in both directions
CREATE OR REPLACE FUNCTION public.handle_new_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.likes
  WHERE (liker_id = NEW.blocker_id AND liked_id = NEW.blocked_id)
     OR (liker_id = NEW.blocked_id AND liked_id = NEW.blocker_id);

  DELETE FROM public.matches
  WHERE (user1_id = NEW.blocker_id AND user2_id = NEW.blocked_id)
     OR (user1_id = NEW.blocked_id AND user2_id = NEW.blocker_id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_block_created
AFTER INSERT ON public.blocks
FOR EACH ROW EXECUTE FUNCTION public.handle_new_block();
