
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_user1_id_fkey;
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_user2_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_liker_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_liked_id_fkey;
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_user1_id_fkey;
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_user2_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.profile_photos DROP CONSTRAINT IF EXISTS profile_photos_user_id_fkey;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.likes
  ADD CONSTRAINT likes_liker_id_fkey FOREIGN KEY (liker_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT likes_liked_id_fkey FOREIGN KEY (liked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.profile_photos
  ADD CONSTRAINT profile_photos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
