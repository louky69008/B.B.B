create or replace function public.bump_conv_last_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id and last_message_at < new.created_at;
  return new;
end;
$$;

revoke execute on function public.bump_conv_last_message() from public, anon, authenticated;

update public.conversations as conversation
set last_message_at = latest.created_at
from (
  select conversation_id, max(created_at) as created_at
  from public.messages
  group by conversation_id
) as latest
where conversation.id = latest.conversation_id
  and conversation.last_message_at < latest.created_at;
