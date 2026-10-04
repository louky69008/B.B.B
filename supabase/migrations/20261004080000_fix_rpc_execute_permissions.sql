-- Keep privileged helpers unavailable to anonymous callers while allowing
-- authenticated application calls and trusted server-side diagnostics.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_ultra(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_ultra(uuid) TO authenticated, service_role;

-- Ask PostgREST to refresh function privileges and signatures immediately.
NOTIFY pgrst, 'reload schema';
