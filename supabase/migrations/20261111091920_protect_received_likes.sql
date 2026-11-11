drop policy if exists "Users see likes involving them" on public.likes;

create policy "Users see sent likes and Premium sees received likes"
  on public.likes
  for select
  to authenticated
  using (
    liker_id = (select auth.uid())
    or (
      liked_id = (select auth.uid())
      and exists (
        select 1 from public.profiles
        where profiles.id = likes.liker_id and not profiles.anonymous_mode
      )
      and exists (
        select 1
        from public.subscriptions
        where subscriptions.user_id = (select auth.uid())
          and subscriptions.tier in ('premium', 'ultra')
          and (subscriptions.expires_at is null or subscriptions.expires_at > now())
      )
    )
  );
