
-- 1. Fix party_participants broken self-join policy
DROP POLICY IF EXISTS "Participants and host view participants" ON public.party_participants;
CREATE POLICY "Participants and host view participants"
ON public.party_participants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.parties p
    WHERE p.id = party_participants.party_id
      AND (
        p.host_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.party_participants pp2
          WHERE pp2.party_id = party_participants.party_id
            AND pp2.user_id = auth.uid()
        )
      )
  )
);

-- 2. Enforce anonymous_mode on profiles SELECT
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users view visible profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR anonymous_mode = false
);

-- 3. Protect party sensitive columns (access_code, address, floor)
-- Revoke column-level SELECT from public roles; reads of these columns
-- must go through the secure RPC below.
REVOKE SELECT (access_code, address, floor) ON public.parties FROM anon, authenticated;
GRANT SELECT (
  id, host_id, title, description, city, starts_at, status,
  is_paid, price_cents, max_participants, practices, full_chill_out,
  rules, warnings, created_at, updated_at
) ON public.parties TO authenticated;

CREATE OR REPLACE FUNCTION public.get_party_private_details(_party_id uuid)
RETURNS TABLE(address text, floor text, access_code text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.parties p
    WHERE p.id = _party_id
      AND (
        p.host_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.party_participants pp
          WHERE pp.party_id = _party_id AND pp.user_id = auth.uid()
        )
      )
  ) THEN
    RETURN QUERY
      SELECT p.address, p.floor, p.access_code
      FROM public.parties p
      WHERE p.id = _party_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_party_private_details(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_party_private_details(uuid) TO authenticated;

-- 4. Remove subscription self-INSERT/UPDATE (privilege escalation)
DROP POLICY IF EXISTS "Users insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;
-- SELECT stays so users can see their own tier; writes happen via service role only.

-- 5. Restrict storage listing on profile-photos bucket (CDN URL access still works)
DROP POLICY IF EXISTS "Profile photos are publicly viewable" ON storage.objects;
CREATE POLICY "Owners can list own profile photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 6. Revoke anon EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.delete_my_account() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

-- 7. Lock down realtime.messages (Broadcast/Presence) — app uses postgres_changes only
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read own conversation channels" ON realtime.messages;
CREATE POLICY "Authenticated can read own conversation channels"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Notification channel: notif-<user_id>
  realtime.topic() = 'notif-' || auth.uid()::text
  OR
  -- Per-conversation channel: messages:<conversation_id>
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE 'messages:' || c.id::text = realtime.topic()
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Authenticated can broadcast on own channels" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast on own channels"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = 'notif-' || auth.uid()::text
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE 'messages:' || c.id::text = realtime.topic()
      AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
  )
);
