
-- Fix search_path on remaining functions
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.bump_conv_last_message()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$ BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;

-- Trigger functions don't need to be callable by API users
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_conv_last_message() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies; authenticated users need EXECUTE
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
