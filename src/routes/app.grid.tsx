import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Droplet, Heart, MapPin, SlidersHorizontal, User, Users, X } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { ProtectedPhoto } from "@/components/protected-photo";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/hooks/use-auth";
import { useBlockedIds } from "@/hooks/use-blocks";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/grid")({ component: Grid });

const views = [
  { value: "discover", label: "Découvrir" },
  { value: "online", label: "En ligne" },
  { value: "newest", label: "Nouveaux" },
] as const;

const transIdentities = new Set([
  "femme_trans",
  "homme_trans",
  "non_binaire",
  "genderfluid",
  "agender",
]);
const defaultFilters = { ageEnabled: false, min: 18, max: 75, identity: "all", hotNow: false };

function isOnline(profile: { hide_status: boolean; last_seen: string }) {
  if (profile.hide_status) return false;
  const elapsed = Date.now() - new Date(profile.last_seen).getTime();
  return elapsed >= 0 && elapsed < 5 * 60_000;
}

function Grid() {
  const { user } = useAuth();
  const { config } = useSubscription();
  const limit = config.profileLimit === -1 ? 600 : config.profileLimit;

  const [view, setView] = useState<(typeof views)[number]["value"]>("discover");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [draft, setDraft] = useState(defaultFilters);

  const { data: blockedIds, isError: blocksError, refetch: refetchBlocks } = useBlockedIds();
  const blocked = blockedIds ? [...blockedIds].sort() : [];
  const orderBy = view === "newest" ? "created_at" : "last_seen";
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["profiles-grid", user?.id, limit, orderBy, blocked],
    enabled: !!user && !!blockedIds,
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, pseudo, age, city, photo_url, last_seen, hide_status, gender_identity")
        .order(orderBy, { ascending: false })
        .limit(limit);
      if (blocked.length > 0) query = query.not("id", "in", `(${blocked.join(",")})`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });

  const { data: likedIds } = useQuery({
    queryKey: ["my-likes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("likes")
        .select("liked_id")
        .eq("liker_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((row) => row.liked_id));
    },
  });
  const profiles = (blockedIds ? (data ?? []) : []).filter((profile) => {
    if (blockedIds?.has(profile.id)) return false;
    if ((view === "online" || filters.hotNow) && !isOnline(profile)) return false;
    if (favoritesOnly && !likedIds?.has(profile.id)) return false;
    if (
      filters.ageEnabled &&
      profile.age != null &&
      (profile.age < filters.min || profile.age > filters.max)
    )
      return false;
    if (filters.identity === "trans" && !transIdentities.has(profile.gender_identity ?? ""))
      return false;
    if (filters.identity === "cis" && profile.gender_identity !== "homme_cis") return false;
    return true;
  });

  const hasFilters = filters.ageEnabled || filters.identity !== "all" || filters.hotNow;
  const control =
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";
  const selected = "bg-secondary text-primary";
  const idle = "text-foreground hover:bg-secondary hover:text-primary";

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-2.5 pt-1 pb-24 sm:px-6 sm:pt-4 lg:px-8">
        <h1 className="sr-only">Découvrir</h1>
        <div className="mb-1.5 flex flex-wrap items-center gap-x-0.5 gap-y-1 sm:mb-3 sm:gap-x-2">
          {views.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={view === value}
              onClick={() => setView(value)}
              className={`${control} group text-xs sm:text-sm`}
            >
              <span
                className={`inline-flex min-h-7 items-center rounded-full px-1.75 transition-colors min-[360px]:px-2.5 sm:min-h-8 sm:px-4 ${view === value ? `${selected} font-semibold` : "text-muted-foreground group-hover:bg-secondary group-hover:text-primary"}`}
              >
                {label}
              </span>
            </button>
          ))}
          <button
            type="button"
            aria-label="Favoris"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((value) => !value)}
            className={`${control} ml-auto min-w-11 ${favoritesOnly ? selected : idle}`}
          >
            <Heart
              className={`size-4.5 ${favoritesOnly ? "fill-current text-[#f91793]" : ""}`}
              aria-hidden="true"
            />
          </button>
          <Drawer open={showFilters} onOpenChange={setShowFilters} shouldScaleBackground={false}>
            <DrawerTrigger asChild>
              <button
                type="button"
                onClick={() => setDraft(filters)}
                aria-label="Filtres"
                className={`${control} relative min-w-11 gap-2 px-2.5 text-sm font-semibold sm:px-4 ${hasFilters ? selected : idle}`}
              >
                <SlidersHorizontal className="size-4.5" aria-hidden="true" />
                <span className="hidden sm:inline">Filtres</span>
                {hasFilters && (
                  <span
                    className="absolute top-2 right-2 size-1.5 rounded-full bg-neon-magenta sm:static"
                    aria-hidden="true"
                  />
                )}
              </button>
            </DrawerTrigger>
            <DrawerContent className="mx-auto max-h-[85svh] max-w-md overflow-y-auto rounded-t-3xl bg-card">
              <div className="space-y-5 px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <header className="flex items-center justify-between">
                  <DrawerTitle className="font-display text-xl">Filtres de recherche</DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Affiner les profils affichés dans la grille.
                  </DrawerDescription>
                  <DrawerClose asChild>
                    <button
                      type="button"
                      className="grid size-10 place-items-center rounded-full bg-secondary"
                      aria-label="Fermer les filtres"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </DrawerClose>
                </header>
                <fieldset className="rounded-2xl bg-secondary px-4 pb-4">
                  <legend className="rounded-full bg-background px-2 text-sm font-semibold">
                    Âge
                  </legend>
                  <label className="my-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.ageEnabled}
                      onChange={(e) => setDraft({ ...draft, ageEnabled: e.target.checked })}
                      className="size-4 accent-primary"
                    />
                    Choisir une tranche d’âge
                  </label>
                  {draft.ageEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <label className="text-xs text-muted-foreground">
                        Minimum{" "}
                        <span className="font-semibold text-foreground">{draft.min} ans</span>
                        <input
                          type="range"
                          min={18}
                          max={99}
                          value={draft.min}
                          onChange={(e) =>
                            setDraft({ ...draft, min: Math.min(e.target.valueAsNumber, draft.max) })
                          }
                          className="mt-2 w-full accent-primary"
                        />
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Maximum{" "}
                        <span className="font-semibold text-foreground">{draft.max} ans</span>
                        <input
                          type="range"
                          min={18}
                          max={99}
                          value={draft.max}
                          onChange={(e) =>
                            setDraft({ ...draft, max: Math.max(e.target.valueAsNumber, draft.min) })
                          }
                          className="mt-2 w-full accent-primary"
                        />
                      </label>
                    </div>
                  )}
                </fieldset>
                <label className="block text-sm font-semibold">
                  Identité de genre
                  <select
                    className="mt-2 min-h-11 w-full rounded-xl border border-border bg-card px-3"
                    value={draft.identity}
                    onChange={(e) => setDraft({ ...draft, identity: e.target.value })}
                  >
                    <option value="all">Toutes</option>
                    <option value="trans">Trans &amp; NB</option>
                    <option value="cis">Hommes cis</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={draft.hotNow}
                    onChange={(e) => setDraft({ ...draft, hotNow: e.target.checked })}
                    className="size-4 accent-primary"
                  />
                  <Droplet className="size-4 text-neon-magenta" aria-hidden="true" /> Cho now !
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(defaultFilters);
                      setShowFilters(false);
                    }}
                    className="min-h-11 flex-1 rounded-full border border-border px-3 text-sm font-semibold"
                  >
                    Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(draft);
                      setShowFilters(false);
                    }}
                    className="min-h-11 flex-1 rounded-full bg-linear-to-r from-neon-magenta to-primary px-3 text-sm font-semibold text-primary-foreground"
                  >
                    Appliquer
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-primary">
                  <Link to="/app/trans" className="hover:underline">
                    Communauté
                  </Link>
                  <Link to="/app/subscribe" className="hover:underline">
                    Voir les offres Premium
                  </Link>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {((!blockedIds && !blocksError) || (!!blockedIds && isPending)) && (
          <p
            className="rounded-3xl border border-border bg-secondary p-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            Chargement des profils…
          </p>
        )}
        {((!blockedIds && blocksError) || (isError && !data)) && (
          <div className="rounded-3xl border border-border bg-secondary p-8 text-center">
            <p className="text-sm text-muted-foreground" role="alert">
              Les profils n’ont pas pu être chargés.
            </p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-primary hover:underline"
              onClick={() => void (blockedIds ? refetch() : refetchBlocks())}
            >
              Réessayer
            </button>
          </div>
        )}
        {data && profiles.length === 0 && (
          <div className="rounded-3xl border border-border bg-secondary px-4 py-10 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-background text-primary">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Aucun profil ne correspond à ces filtres.
            </p>
          </div>
        )}
        {profiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                to="/app/profile/$id"
                params={{ id: profile.id }}
                className="group relative isolate block aspect-square overflow-hidden rounded-[9px] bg-secondary shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {profile.photo_url ? (
                  <ProtectedPhoto
                    src={profile.photo_url}
                    ownerId={profile.id}
                    ownerPseudo={profile.pseudo}
                    watermarkDensity={110}
                    className="size-full transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    silent
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-linear-to-br from-secondary to-accent text-primary/60">
                    <User className="size-8 sm:size-12" aria-hidden="true" />
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/95 via-black/0 via-58% to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5 p-2 text-white sm:p-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center text-sm leading-tight font-bold sm:text-base">
                      <span className="truncate">{profile.pseudo}</span>
                      {profile.age != null && <span className="shrink-0">, {profile.age}</span>}
                      {isOnline(profile) && (
                        <span className="ml-1.5 size-2 shrink-0 rounded-full bg-[#02e082]">
                          <span className="sr-only">En ligne</span>
                        </span>
                      )}
                    </p>
                    {profile.city && (
                      <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-tight text-white/95">
                        <MapPin className="size-3 shrink-0" aria-hidden="true" />
                        <span className="truncate">{profile.city}</span>
                      </p>
                    )}
                  </div>
                  {likedIds?.has(profile.id) && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-card text-[#f91793] shadow-sm sm:size-9">
                      <Heart className="size-4 fill-current" aria-hidden="true" />
                      <span className="sr-only">Profil liké</span>
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        {config.profileLimit !== -1 && data && data.length >= config.profileLimit && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-secondary p-4 sm:p-5">
            <div>
              <p className="text-sm font-bold">Limite atteinte ({config.profileLimit} profils)</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Passez Premium pour voir tous les profils.
              </p>
            </div>
            <Link
              to="/app/subscribe"
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Voir les offres
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
