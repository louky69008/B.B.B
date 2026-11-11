drop policy "Requester cancels own, host updates status" on public.party_requests;
drop policy "Host adds participants" on public.party_participants;
drop policy "Users create own requests" on public.party_requests;

create policy "Members request access to open parties"
  on public.party_requests for insert to authenticated
  with check (
    auth.uid() = requester_id and status = 'pending'
    and exists (
      select 1 from public.parties
      where id = party_id and host_id <> auth.uid()
        and status = 'open' and starts_at > now()
    )
  );

create function public.decide_party_request(_request_id uuid, _accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request public.party_requests%rowtype;
  party public.parties%rowtype;
begin
  select * into request from public.party_requests where id = _request_id;
  select * into party from public.parties where id = request.party_id for update;
  if not found or party.host_id is distinct from auth.uid() or _accept is null then
    raise exception 'Cette demande est indisponible.' using errcode = '42501';
  end if;

  select * into request from public.party_requests where id = _request_id for update;
  if not found or request.status <> 'pending' then
    raise exception 'Cette demande a déjà été traitée.';
  end if;

  if _accept then
    if party.status <> 'open' or party.starts_at <= now() then
      raise exception 'Cette soirée est fermée aux inscriptions.';
    end if;
    if not exists (
      select 1 from public.party_participants
      where party_id = party.id and user_id = request.requester_id
    ) then
      if (select count(*) from public.party_participants where party_id = party.id) >= party.max_participants then
        raise exception 'Cette soirée est complète.';
      end if;
      insert into public.party_participants (party_id, user_id) values (party.id, request.requester_id);
    end if;
  end if;

  update public.party_requests
    set status = case when _accept then 'accepted' else 'rejected' end
    where id = request.id;
end;
$$;

revoke execute on function public.decide_party_request(uuid, boolean) from public, anon;
grant execute on function public.decide_party_request(uuid, boolean) to authenticated;
