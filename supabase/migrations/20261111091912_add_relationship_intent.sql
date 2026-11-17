alter table public.profiles
  add column relationship_intent text
    check (relationship_intent in ('serious', 'friends', 'casual', 'other'));
