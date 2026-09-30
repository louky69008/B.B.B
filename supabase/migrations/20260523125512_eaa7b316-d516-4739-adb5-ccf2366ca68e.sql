ALTER TABLE public.parties
  ADD COLUMN IF NOT EXISTS practices text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS full_chill_out boolean NOT NULL DEFAULT false;