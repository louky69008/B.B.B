import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, EyeOff, Heart, MessageSquare, User } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { ProtectedPhoto } from "@/components/protected-photo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useBlockedIds } from "@/hooks/use-blocks";
import { useMatches } from "@/hooks/use-matches";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/matches")({ component: LikesPage });

const cardClass =
  "group relative isolate block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm sm:rounded-3xl";
const gridClass = "grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";
const statusClass = "rounded-3xl bg-secondary p-8 text-center text-sm text-muted-foreground";
const tabClass =
  "min-h-9 flex-1 rounded-full border border-transparent data-[state=active]:border-neon-magenta data-[state=active]:text-primary";

function LikesPage() {
  const french = useI18n().lang === "fr";
  const { matches, isPending, isError } = useMatches();

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 pt-5 pb-24 sm:px-7 sm:pt-8 lg:px-10">
        <header className="mb-5 flex items-center gap-3 sm:gap-4">
          <Link
            to="/app/grid"
            aria-label={french ? "Retour à Découvrir" : "Back to Discover"}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <h1 className="flex-1 font-display text-3xl sm:text-4xl">Likes</h1>
        </header>
        <Tabs defaultValue="matches">
          <TabsList
            aria-label={french ? "Types de likes" : "Types of likes"}
            className="mb-2 flex h-auto w-full rounded-full bg-secondary p-1 sm:max-w-sm"
          >
            <TabsTrigger value="matches" className={tabClass}>
              {french ? "Tu as matché" : "Your matches"}
              {!!matches?.length && (
                <span className="ml-1.5 inline-grid min-h-5 min-w-5 place-items-center rounded-full bg-neon-magenta px-1 text-xs font-bold text-white">
                  {matches.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="received" className={tabClass}>
              {french ? "Qui t’aime" : "Who likes you"}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="matches">
            {isPending && (
              <p role="status" className={statusClass}>
                {french ? "Chargement des matchs…" : "Loading matches…"}
              </p>
            )}
            {isError && !matches && (
              <p role="alert" className={statusClass}>
                {french ? "Les matchs n’ont pas pu être chargés." : "Could not load matches."}
              </p>
            )}
            {matches?.length === 0 && (
              <EmptyLikes
                text={french ? "Aucun match pour le moment" : "No matches yet"}
                action={french ? "Découvrir les profils" : "Discover profiles"}
                to="/app/grid"
              />
            )}
            {!!matches?.length && (
              <ul className={gridClass}>
                {matches.map(({ id, other, otherId, conversationId }) => {
                  const content = (
                    <LikeCard profile={other} french={french} conversation={!!conversationId} />
                  );
                  return (
                    <li key={id}>
                      {conversationId ? (
                        <Link
                          to="/app/chat/$id"
                          params={{ id: conversationId }}
                          className={cardClass}
                        >
                          {content}
                        </Link>
                      ) : other && !other.anonymous_mode ? (
                        <Link to="/app/profile/$id" params={{ id: otherId }} className={cardClass}>
                          {content}
                        </Link>
                      ) : (
                        <article className={cardClass}>{content}</article>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="received">
            <ReceivedLikes french={french} />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </main>
  );
}

function ReceivedLikes({ french }: { french: boolean }) {
  const { user } = useAuth();
  const { tier, expiresAt } = useSubscription();
  const { data: blockedIds, isError: blocksError } = useBlockedIds();
  const { matches, isPending: matchesPending, isError: matchesError } = useMatches();
  const permitted =
    (tier === "premium" || tier === "ultra") &&
    (expiresAt === null || Date.parse(expiresAt) > Date.now());
  const ignored = [
    ...new Set([...(blockedIds ?? []), ...(matches ?? []).map((match) => match.otherId)]),
  ].sort();
  const {
    data: likers,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["received-likes", user?.id, ignored],
    enabled: !!user && permitted && !!blockedIds && !!matches && !blocksError && !matchesError,
    queryFn: async () => {
      let likes = supabase
        .from("likes")
        .select("liker_id")
        .eq("liked_id", user!.id)
        .neq("liker_id", user!.id)
        .order("created_at", { ascending: false });
      if (ignored.length) likes = likes.not("liker_id", "in", `(${ignored.join(",")})`);
      const { data: rows, error } = await likes;
      if (error) throw error;
      if (!rows.length) return [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, pseudo, photo_url, anonymous_mode, age")
        .eq("anonymous_mode", false)
        .in(
          "id",
          rows.map(({ liker_id }) => liker_id),
        );
      if (profileError) throw profileError;
      const byId = new Map(profiles.map((profile) => [profile.id, profile]));
      return rows.flatMap(({ liker_id }) => {
        const profile = byId.get(liker_id);
        return profile ? [profile] : [];
      });
    },
  });

  if (!permitted) {
    return (
      <EmptyLikes
        text={
          french
            ? "Découvre qui t’aime avec Premium ou Ultra"
            : "See who likes you with Premium or Ultra"
        }
        action={french ? "Voir les abonnements" : "View plans"}
        to="/app/subscribe"
      />
    );
  }
  if (blocksError || matchesError || isError) {
    return (
      <p role="alert" className={statusClass}>
        {french ? "Les likes reçus n’ont pas pu être chargés." : "Could not load received likes."}
      </p>
    );
  }
  if (matchesPending || isPending) {
    return (
      <p role="status" className={statusClass}>
        {french ? "Chargement des likes reçus…" : "Loading received likes…"}
      </p>
    );
  }
  if (!likers?.length) {
    return <EmptyLikes text={french ? "Aucun nouveau like pour le moment" : "No new likes yet"} />;
  }
  return (
    <ul className={gridClass}>
      {likers.map((profile) => (
        <li key={profile.id}>
          <Link to="/app/profile/$id" params={{ id: profile.id }} className={cardClass}>
            <LikeCard profile={profile} french={french} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function LikeCard({
  profile,
  french,
  conversation,
}: {
  profile?: Pick<Tables<"profiles">, "id" | "pseudo" | "photo_url" | "anonymous_mode" | "age">;
  french: boolean;
  conversation?: boolean;
}) {
  const anonymous = !profile || profile.anonymous_mode;
  return (
    <>
      {!anonymous && profile.photo_url ? (
        <ProtectedPhoto
          src={profile.photo_url}
          ownerId={profile.id}
          ownerPseudo={profile.pseudo}
          className="size-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          silent
        />
      ) : (
        <div className="grid size-full place-items-center bg-linear-to-br from-secondary to-accent text-primary/60">
          {anonymous ? (
            <EyeOff className="size-8" aria-hidden="true" />
          ) : (
            <User className="size-8" aria-hidden="true" />
          )}
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/10 via-55% to-transparent"
        aria-hidden="true"
      />
      {conversation && (
        <span className="absolute top-2 right-2 text-white drop-shadow-md sm:top-3 sm:right-3">
          <MessageSquare className="size-3.5 sm:size-4" aria-hidden="true" />
          <span className="sr-only">{french ? "Envoyer un message" : "Send a message"}</span>
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 p-2 text-white sm:p-3">
        <p className="flex min-w-0 items-baseline text-xs font-bold sm:text-base">
          <span className="truncate">
            {anonymous ? (french ? "Anonyme" : "Anonymous") : profile.pseudo}
          </span>
          {!anonymous && profile.age != null && <span className="shrink-0">, {profile.age}</span>}
        </p>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-neon-magenta shadow-sm sm:size-8">
          <Heart className="size-3 fill-current sm:size-4" aria-hidden="true" />
        </span>
      </div>
    </>
  );
}

function EmptyLikes({
  text,
  action,
  to,
}: {
  text: string;
  action?: string;
  to?: "/app/grid" | "/app/subscribe";
}) {
  return (
    <div className="rounded-3xl border border-border bg-secondary px-5 py-10 text-center">
      <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-background text-neon-magenta">
        <Heart className="size-5" aria-hidden="true" />
      </span>
      <p className="font-semibold">{text}</p>
      {to && action && (
        <Link
          to={to}
          className="mt-3 inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          {action}
        </Link>
      )}
    </div>
  );
}
