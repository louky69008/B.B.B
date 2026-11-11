import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Droplet, Heart, MapPin, SlidersHorizontal, User, Users, X } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { PremiumFeatureCard } from "@/components/premium-feature-card";
import { NearbyMap } from "@/components/nearby-map";
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
import { cityDistanceKm, getNearbyCity, nearbyCities, type NearbyCity } from "@/lib/nearby-cities";
import { cityMatchValues } from "@/lib/cities";
import { RELATIONSHIP_INTENTS } from "@/lib/relationship-intents";

export const Route = createFileRoute("/app/grid")({ component: Grid });

const views = [
  { value: "discover", label: "Découvrir" },
  { value: "online", label: "En ligne" },
  { value: "nearby", label: "À proximité" },
  { value: "newest", label: "Nouveaux" },
] as const;

const transIdentities = new Set([
  "femme_trans",
  "homme_trans",
  "non_binaire",
  "genderfluid",
  "agender",
]);
const defaultFilters = {
  ageEnabled: false,
  min: 18,
  max: 75,
  radiusEnabled: false,
  radiusKm: 50,
  relationship: "all",
  identity: "all",
  hotNow: false,
};
const relationshipOptions = { all: "Tous", ...RELATIONSHIP_INTENTS };

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
  const [nearbyView, setNearbyView] = useState<"map" | "list">("map");
  const [referenceCity, setReferenceCity] = useState("");
  const isNearby = view === "nearby";
  const useRadius = isNearby || filters.radiusEnabled;

  const { data: blockedIds, isError: blocksError, refetch: refetchBlocks } = useBlockedIds();
  const blocked = blockedIds ? [...blockedIds].sort() : [];
  const orderBy = view === "newest" ? "created_at" : "last_seen";
  const { data: viewerCity, isPending: isViewerCityPending } = useQuery({
    queryKey: ["discovery-city", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("city")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.city ?? null;
    },
  });
  const origin = getNearbyCity(referenceCity || viewerCity);
  const cityValues =
    useRadius && origin
      ? [
          ...new Set(
            nearbyCities
              .filter((city) => cityDistanceKm(origin, city) <= filters.radiusKm)
              .flatMap((city) => [city.slug, ...cityMatchValues(city)]),
          ),
        ]
      : [];
  const {
    data: pages,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "profiles-grid",
      user?.id,
      limit,
      config.profileLimit,
      orderBy,
      blocked,
      filters.relationship,
      cityValues,
    ],
    enabled: !!user && !!blockedIds && (!useRadius || !!origin),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let query = supabase
        .from("profiles")
        .select(
          "id, pseudo, age, city, photo_url, last_seen, hide_status, gender_identity, relationship_intent",
        )
        .order(orderBy, { ascending: false })
        .order("id", { ascending: true })
        .range(pageParam, pageParam + limit - 1);
      if (blocked.length > 0) query = query.not("id", "in", `(${blocked.join(",")})`);
      if (filters.relationship !== "all")
        query = query.eq("relationship_intent", filters.relationship);
      if (cityValues.length > 0) {
        query = query
          .neq("id", user!.id)
          .or(cityValues.map((city) => `city.ilike."${city}"`).join(","));
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    getNextPageParam: (page, allPages) =>
      config.profileLimit === -1 && page.length === limit ? allPages.length * limit : undefined,
    refetchInterval: config.profileLimit === -1 ? false : 30_000,
  });
  const data = pages
    ? [...new Map(pages.pages.flat().map((profile) => [profile.id, profile])).values()]
    : undefined;

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
  const filtered = (blockedIds ? (data ?? []) : []).filter((profile) => {
    if (blockedIds?.has(profile.id)) return false;
    if (useRadius && profile.id === user?.id) return false;
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
    if (filters.relationship !== "all" && profile.relationship_intent !== filters.relationship)
      return false;
    return true;
  });
  const profiles = filtered
    .map((profile) => {
      const city = getNearbyCity(profile.city);
      const distance = city && origin ? cityDistanceKm(origin, city) : undefined;
      return { profile, city, distance };
    })
    .filter(
      ({ distance }) => !useRadius || (distance !== undefined && distance <= filters.radiusKm),
    );
  if (isNearby) profiles.sort((first, second) => first.distance! - second.distance!);

  const cityGroups = new Map<string, { city: NearbyCity; count: number }>();
  if (isNearby && nearbyView === "map") {
    for (const { city } of profiles) {
      if (!city) continue;
      const group = cityGroups.get(city.slug);
      if (group) group.count += 1;
      else cityGroups.set(city.slug, { city, count: 1 });
    }
  }

  const hasFilters =
    filters.ageEnabled ||
    filters.radiusEnabled ||
    filters.radiusKm !== defaultFilters.radiusKm ||
    filters.relationship !== "all" ||
    filters.identity !== "all" ||
    filters.hotNow;
  const control =
    "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary";
  const selected = "bg-secondary text-primary";
  const idle = "text-foreground hover:bg-secondary hover:text-primary";

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-3 pt-1 pb-24 sm:px-6 sm:pt-4 lg:px-8">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-y-1 sm:mb-3">
          <nav
            aria-label="Vues de découverte"
            className="flex min-w-0 flex-wrap items-center sm:gap-1"
          >
            {views.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={`${control} group text-xs sm:text-sm`}
              >
                <span
                  className={`inline-flex min-h-7 items-center rounded-full px-2 transition-colors min-[390px]:px-2.5 sm:min-h-8 sm:px-4 ${view === value ? `${selected} font-semibold` : "text-muted-foreground group-hover:bg-secondary group-hover:text-primary"}`}
                >
                  {label}
                </span>
              </button>
            ))}
          </nav>
          <div className="ml-auto flex">
            <button
              type="button"
              aria-label="Favoris"
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((value) => !value)}
              className={`${control} min-w-11 ${favoritesOnly ? selected : idle}`}
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
                              setDraft({
                                ...draft,
                                min: Math.min(e.target.valueAsNumber, draft.max),
                              })
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
                              setDraft({
                                ...draft,
                                max: Math.max(e.target.valueAsNumber, draft.min),
                              })
                            }
                            className="mt-2 w-full accent-primary"
                          />
                        </label>
                      </div>
                    )}
                  </fieldset>
                  <fieldset>
                    <legend className="text-sm font-semibold">Distance</legend>
                    {!isNearby && (
                      <label className="mt-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={draft.radiusEnabled}
                          onChange={(e) => setDraft({ ...draft, radiusEnabled: e.target.checked })}
                          className="size-4 accent-primary"
                        />
                        Limiter à un rayon autour de la ville de référence
                      </label>
                    )}
                    {(isNearby || draft.radiusEnabled) && (
                      <label className="mt-2 block">
                        <span className="flex justify-between gap-2 text-sm text-muted-foreground">
                          Rayon de recherche
                          <span className="font-semibold text-primary">{draft.radiusKm} km</span>
                        </span>
                        <input
                          type="range"
                          min={5}
                          max={500}
                          step={5}
                          value={draft.radiusKm}
                          aria-valuetext={`${draft.radiusKm} kilomètres`}
                          onChange={(e) => setDraft({ ...draft, radiusKm: e.target.valueAsNumber })}
                          className="mt-2 w-full accent-primary"
                        />
                      </label>
                    )}
                  </fieldset>
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold">Relation recherchée</legend>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(relationshipOptions).map(([value, label]) => (
                        <button
                          type="button"
                          key={value}
                          aria-pressed={draft.relationship === value}
                          onClick={() => setDraft({ ...draft, relationship: value })}
                          className={`${control} border px-4 text-sm ${draft.relationship === value ? "border-transparent bg-primary font-semibold text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary hover:text-primary"}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
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
        </div>

        <header className="mb-4">
          <h1 className="font-display text-2xl leading-tight font-bold sm:text-3xl">
            {views.find(({ value }) => view === value)?.label}
          </h1>
          {view === "discover" && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Découvre les membres de B.B.B &amp; Cie.
            </p>
          )}
        </header>

        {useRadius && (
          <section
            aria-label="Recherche par ville"
            className="mb-4 rounded-2xl border border-border bg-card p-3 sm:p-4"
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <label className="min-w-40 flex-1 text-sm font-semibold sm:max-w-xs">
                Ville de référence
                <select
                  value={origin?.slug ?? ""}
                  onChange={(e) => setReferenceCity(e.target.value)}
                  className="mt-1 block min-h-11 w-full rounded-xl border border-border bg-background px-3 font-normal"
                >
                  <option value="" disabled>
                    Choisir une ville
                  </option>
                  {nearbyCities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold text-primary">
                Rayon de {filters.radiusKm} km
              </p>
            </div>
            {!origin && (
              <p role="status" className="text-sm text-muted-foreground">
                {isViewerCityPending
                  ? "Chargement de ta ville…"
                  : "Choisis une ville de référence pour afficher les profils alentour."}
              </p>
            )}
            {origin && (
              <p className="text-xs text-muted-foreground">
                Les distances à vol d’oiseau sont estimées entre les centres des villes des profils
                affichés.
              </p>
            )}
            {origin && isNearby && (
              <div className="mt-3">
                <div
                  aria-label="Mode d’affichage"
                  role="group"
                  className="mb-2 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1"
                >
                  {(
                    [
                      { mode: "map", label: "Carte" },
                      { mode: "list", label: "Liste" },
                    ] as const
                  ).map(({ mode, label }) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={nearbyView === mode}
                      onClick={() => setNearbyView(mode)}
                      className={`${control} px-3 text-sm font-semibold ${nearbyView === mode ? "bg-card text-primary ring-1 ring-primary" : "text-muted-foreground hover:text-primary"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {nearbyView === "map" && (
                  <>
                    <NearbyMap
                      origin={origin}
                      radiusKm={filters.radiusKm}
                      groups={[...cityGroups.values()]}
                    />
                    {profiles.length > 0 && (
                      <button
                        type="button"
                        className="mt-2 min-h-11 w-full rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
                        onClick={() => setNearbyView("list")}
                      >
                        Voir les profils alentour ({profiles.length})
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {((!blockedIds && !blocksError) ||
          (!!blockedIds && isPending && (!useRadius || origin))) && (
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
        {data && (!useRadius || origin) && profiles.length === 0 && (
          <div className="rounded-3xl border border-border bg-secondary px-4 py-10 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-background text-primary">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <p className="text-sm font-medium text-muted-foreground">
              Aucun profil ne correspond à ces filtres.
            </p>
          </div>
        )}
        {profiles.length > 0 && (!isNearby || nearbyView === "list") && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {profiles.map(({ profile, city, distance }) => (
              <Link
                key={profile.id}
                to="/app/profile/$id"
                params={{ id: profile.id }}
                className="group relative isolate block aspect-[5/6] overflow-hidden rounded-xl bg-secondary shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:aspect-square"
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
                        <span className="truncate">
                          {distance === undefined
                            ? profile.city
                            : city?.slug === origin?.slug
                              ? `${profile.city} · Même ville`
                              : `${profile.city} · ≈ ${Math.round(distance)} km`}
                        </span>
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
        {config.profileLimit > 0 &&
          config.profileLimit < 600 &&
          data &&
          data.length >= config.profileLimit && (
            <section className="mt-5 max-w-lg">
              <p className="mb-2 text-sm font-semibold">
                Limite atteinte ({config.profileLimit} profils)
              </p>
              <PremiumFeatureCard />
            </section>
          )}
        {hasNextPage && (
          <button
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            className="neon-btn neon-btn-ghost mt-5"
          >
            {isFetchingNextPage ? "Chargement…" : "Charger plus de profils"}
          </button>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
