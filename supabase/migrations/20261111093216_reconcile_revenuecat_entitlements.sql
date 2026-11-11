alter table public.subscriptions add column revenuecat_checked_at timestamptz;

create function public.reconcile_revenuecat_entitlement(
  _user_id uuid,
  _tier text,
  _expires_at timestamptz,
  _checked_at timestamptz
)
returns void
language sql
set search_path = ''
as $$
  insert into public.subscriptions (user_id, tier, expires_at, updated_at, revenuecat_checked_at)
  select _user_id, _tier, _expires_at, now(), _checked_at
  where exists (select 1 from public.profiles where id = _user_id)
  on conflict (user_id) do update
    set tier = excluded.tier,
        expires_at = excluded.expires_at,
        updated_at = excluded.updated_at,
        revenuecat_checked_at = excluded.revenuecat_checked_at
  where subscriptions.revenuecat_checked_at is null
     or subscriptions.revenuecat_checked_at <= excluded.revenuecat_checked_at;
$$;

revoke execute on function public.reconcile_revenuecat_entitlement(uuid, text, timestamptz, timestamptz)
  from public, anon, authenticated;
grant execute on function public.reconcile_revenuecat_entitlement(uuid, text, timestamptz, timestamptz)
  to service_role;
