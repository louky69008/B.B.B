revoke select on public.parties from public, anon, authenticated;

grant select (
  id, host_id, title, description, city, starts_at, status,
  is_paid, price_cents, max_participants, practices, full_chill_out,
  rules, warnings, created_at, updated_at
) on public.parties to authenticated;

revoke execute on function public.get_party_private_details(uuid) from public, anon;
grant execute on function public.get_party_private_details(uuid) to authenticated;

-- Resolve party membership outside the participant SELECT policy to avoid RLS recursion.
create function public.can_view_party_members(_party_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.parties as party
    where party.id = _party_id and party.host_id = (select auth.uid())
  ) or exists (
    select 1 from public.party_participants as participant
    where participant.party_id = _party_id and participant.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.can_view_party_members(uuid) from public, anon;
grant execute on function public.can_view_party_members(uuid) to authenticated;

drop policy if exists "Participants and host view participants" on public.party_participants;
create policy "Participants and host view participants"
  on public.party_participants for select to authenticated
  using (public.can_view_party_members(party_id));
