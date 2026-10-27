
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

INSERT INTO public.profiles (id, pseudo, age, city, bio, photo_url, last_seen, hide_status)
VALUES
  (gen_random_uuid(), 'Tim', 28, 'Paris', 'Sport & sorties', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Balade moto', 34, 'Lyon', 'Moto, vin nature', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop', now() - interval '2 minutes', false),
  (gen_random_uuid(), 'reyad', 25, 'Marseille', 'Discret', null, now() - interval '3 minutes', false),
  (gen_random_uuid(), 'Luca', 30, 'Paris', 'Techno lover', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Max', 27, 'Bordeaux', 'Café et ciné', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop', now() - interval '4 minutes', false),
  (gen_random_uuid(), '26ansPassif', 26, 'Paris', 'Discret', 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&h=400&fit=crop', now() - interval '2 minutes', false),
  (gen_random_uuid(), '.42O', 24, 'Lille', '420 friendly', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Théo', 29, 'Nantes', 'Verre ce soir ?', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', now() - interval '3 minutes', false),
  (gen_random_uuid(), 'Black scred', 31, 'Paris', 'Sport, muscu', 'https://images.unsplash.com/photo-1583195763986-0e6f8b6d3ee4?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'De Passage', 32, 'Toulouse', 'En transit 🔥', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop', now() - interval '2 minutes', false),
  (gen_random_uuid(), 'Marco', 35, 'Nice', 'Foodie', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', now() - interval '5 minutes', false),
  (gen_random_uuid(), 'Sami', 23, 'Paris', 'Étudiant', 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Hugo', 28, 'Strasbourg', 'Tatoué', 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop', now() - interval '4 minutes', false),
  (gen_random_uuid(), 'Yanis', 26, 'Paris', 'Curieux', 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&h=400&fit=crop', now() - interval '2 minutes', false),
  (gen_random_uuid(), 'Antoine', 33, 'Lyon', 'Bear vibes', 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Karim', 29, 'Paris', 'Disco', 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop', now() - interval '3 minutes', false),
  (gen_random_uuid(), 'Ilan', 24, 'Paris', 'Twink', 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop', now() - interval '1 minute', false),
  (gen_random_uuid(), 'Romain', 36, 'Bordeaux', 'Cigare & whisky', 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=400&h=400&fit=crop', now() - interval '5 minutes', false);
