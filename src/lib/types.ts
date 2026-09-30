// Types partagés pour les lignes Supabase.
// Le projet n'utilise pas de types générés depuis le schéma : on déclare donc
// ici uniquement les colonnes réellement lues/écrites, ce qui évite les `any`
// côté client tout en gardant le client Supabase non typé.

export type Role = "admin" | "moderator";

export type ProfileRow = {
  id: string;
  pseudo: string;
  photo_url: string | null;
};

export type ReportRow = {
  id: string;
  reporter_id: string;
  target_user_id: string | null;
  target_message_id: string | null;
  target_kind: string;
  category: string;
  message: string;
  description: string | null;
  reason: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  // Le schéma live n'est pas reflété par les migrations versionnées :
  // l'index signature évite de casser dès qu'une colonne s'ajoute.
  [key: string]: unknown;
  reporter: ProfileRow | undefined;
  target: ProfileRow | null;
};

/** Profil enrichi de l'âge, utilisé dans les demandes d'accès aux soirées. */
export type RequestProfile = ProfileRow & { age: number | null };

export type PartyRequestRow = {
  id: string;
  party_id: string;
  requester_id: string;
  message: string;
  status: string;
  created_at: string;
  profile: RequestProfile | undefined;
};

export type PartyMessageRow = {
  id: string;
  sender_id: string;
  content: string;
  photo_url: string | null;
  created_at: string;
  sender: ProfileRow | undefined;
};

/** Ligne renvoyée par le trigger Realtime `postgres_changes`. */
export type RealtimeInsert<T> = { new: T };

/**
 * Profil éditable depuis /app/me. Les colonnes correspondent à la ligne
 * `profiles` renvoyée par un `.select("*")` ; les champs éditables sont
 * contraints pour que le formulaire reste typé.
 */
export type ProfileForm = {
  pseudo: string;
  photo_url: string | null;
  bio: string | null;
  gender_identity: string | null;
  pronouns: string | null;
  age: number | null;
  city: string | null;
  orientation: string | null;
  hide_status: boolean;
  anonymous_mode: boolean;
  [key: string]: unknown;
};
