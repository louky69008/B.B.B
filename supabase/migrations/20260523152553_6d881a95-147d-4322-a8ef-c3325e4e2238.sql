-- 1) Track age gate / explicit content acceptance on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_gate_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS explicit_content_acknowledged_at timestamptz;

-- 2) RPC : delete_my_account
-- Supprime toutes les données applicatives de l'utilisateur courant.
-- La suppression du compte auth.users elle-même se fait via une server function admin
-- (cf. src/lib/account.functions.ts) car SECURITY DEFINER ne peut pas appeler auth.admin proprement.
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Messages dans conversations privées
  DELETE FROM public.messages WHERE sender_id = uid;
  DELETE FROM public.messages
    WHERE conversation_id IN (
      SELECT id FROM public.conversations WHERE user1_id = uid OR user2_id = uid
    );

  -- Matches & conversations
  DELETE FROM public.matches WHERE user1_id = uid OR user2_id = uid;
  DELETE FROM public.conversations WHERE user1_id = uid OR user2_id = uid;

  -- Likes & blocks
  DELETE FROM public.likes  WHERE liker_id   = uid OR liked_id   = uid;
  DELETE FROM public.blocks WHERE blocker_id = uid OR blocked_id = uid;

  -- Soirées appart' : participations, requêtes, messages, soirées hébergées
  DELETE FROM public.party_participants WHERE user_id = uid;
  DELETE FROM public.party_requests     WHERE requester_id = uid;
  DELETE FROM public.party_messages     WHERE sender_id = uid;
  DELETE FROM public.party_messages
    WHERE party_id IN (SELECT id FROM public.parties WHERE host_id = uid);
  DELETE FROM public.party_participants
    WHERE party_id IN (SELECT id FROM public.parties WHERE host_id = uid);
  DELETE FROM public.party_requests
    WHERE party_id IN (SELECT id FROM public.parties WHERE host_id = uid);
  DELETE FROM public.parties WHERE host_id = uid;

  -- Reports émis par l'utilisateur
  DELETE FROM public.reports WHERE reporter_id = uid;

  -- Abonnements, rôles, photos, profil
  DELETE FROM public.subscriptions   WHERE user_id = uid;
  DELETE FROM public.user_roles      WHERE user_id = uid;
  DELETE FROM public.profile_photos  WHERE user_id = uid;
  DELETE FROM public.profiles        WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM public;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;