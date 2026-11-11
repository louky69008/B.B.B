import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, EyeOff, Heart, MessageSquare, User } from "lucide-react";
import { ProtectedPhoto } from "@/components/protected-photo";

export const Route = createFileRoute("/app/matches")({ component: MatchesList });

function MatchesList() {
  const { user } = useAuth();

  const {
    data: matches,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["matches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("matches")
        .select("id, user1_id, user2_id, conversation_id, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const otherIds = rows.map((m) => (m.user1_id === user!.id ? m.user2_id : m.user1_id));
      if (otherIds.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, pseudo, photo_url, anonymous_mode, age")
        .in("id", otherIds);
      const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
      return rows.map((m) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        created_at: m.created_at,
        other: map.get(m.user1_id === user!.id ? m.user2_id : m.user1_id),
      }));
    },
  });

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-24 sm:px-7 sm:pt-8 lg:px-10">
        <header className="mb-6 flex items-center gap-3 sm:gap-4">
          <Link
            to="/app/grid"
            aria-label="Retour à Découvrir"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card hover:bg-secondary"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <h1 className="flex-1 font-display text-3xl sm:text-4xl">Mes matchs</h1>
          {matches && (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-sm font-bold text-primary"
              aria-label={`${matches.length} matchs`}
            >
              <Heart className="size-4 fill-current" aria-hidden="true" /> {matches.length}
            </span>
          )}
        </header>

        {isLoading && (
          <p
            className="rounded-3xl bg-secondary p-8 text-center text-sm text-muted-foreground"
            role="status"
          >
            Chargement des matchs…
          </p>
        )}
        {isError && !matches && (
          <p
            className="rounded-3xl bg-secondary p-8 text-center text-sm text-muted-foreground"
            role="alert"
          >
            Les matchs n’ont pas pu être chargés.
          </p>
        )}

        {matches?.length === 0 && (
          <div className="rounded-3xl border border-border bg-secondary px-5 py-10 text-center">
            <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-background text-neon-magenta">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <p className="font-semibold">Aucun match pour le moment</p>
            <Link
              to="/app/grid"
              className="mt-3 inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Découvrir les profils
            </Link>
          </div>
        )}

        {!!matches?.length && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {matches.map(({ id, other, conversation_id }) => {
              const anonymous = other?.anonymous_mode ?? true;
              const name = anonymous ? "Anonyme" : other?.pseudo;
              const content = (
                <>
                  {!anonymous && other?.photo_url ? (
                    <ProtectedPhoto
                      src={other.photo_url}
                      ownerId={other.id}
                      ownerPseudo={other.pseudo}
                      className="size-full transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      silent
                    />
                  ) : (
                    <div className="grid size-full place-items-center bg-linear-to-br from-secondary to-accent text-primary/60">
                      {anonymous ? (
                        <EyeOff className="size-9" aria-hidden="true" />
                      ) : (
                        <User className="size-9" aria-hidden="true" />
                      )}
                    </div>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/10 via-55% to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white text-neon-magenta shadow-sm">
                    <Heart className="size-4 fill-current" aria-hidden="true" />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <p className="flex items-baseline text-sm font-bold sm:text-base">
                      <span className="truncate">{name}</span>
                      {!anonymous && other?.age != null && (
                        <span className="shrink-0">, {other.age}</span>
                      )}
                    </p>
                    {conversation_id && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
                        <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" /> Envoyer
                        un message
                      </p>
                    )}
                  </div>
                </>
              );
              const cardClass =
                "group relative isolate block aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-sm sm:rounded-3xl";
              return (
                <li key={id}>
                  {conversation_id ? (
                    <Link to="/app/chat/$id" params={{ id: conversation_id }} className={cardClass}>
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
      </div>
      <BottomNav />
    </main>
  );
}
