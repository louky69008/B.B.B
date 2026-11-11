import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ChevronRight, EyeOff, Heart, MessageCircle, User } from "lucide-react";
import { useBlockedIds } from "@/hooks/use-blocks";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/chat")({ component: ChatLayout });

function ChatLayout() {
  const conversation = useMatch({ from: "/app/chat/$id", shouldThrow: false });
  return conversation ? <Outlet /> : <ChatList />;
}

function messagePreview(content: string | undefined, french: boolean) {
  if (content === "__snap_request__") return french ? "Demande de Snapchat" : "Snapchat request";
  if (content?.startsWith("__snap_accept__"))
    return french ? "Snapchat partagé" : "Snapchat shared";
  if (content === "__snap_decline__")
    return french ? "Demande de Snap refusée" : "Snapchat request declined";
  return content || (french ? "Aucun message" : "No messages yet");
}

function ChatList() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const french = lang === "fr";
  const { data: blockedIds, isPending: blocksPending, isError: blocksError } = useBlockedIds();
  const blocked = blockedIds ? [...blockedIds].sort() : [];

  const {
    data: convs,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["conversations", user?.id, blocked],
    enabled: !!user && !!blockedIds && !blocksError,
    refetchInterval: 20_000,
    queryFn: async () => {
      let conversations = supabase
        .from("conversations")
        .select("id, user1_id, user2_id, messages(content, created_at)")
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false })
        .order("created_at", { ascending: false, referencedTable: "messages" })
        .limit(1, { referencedTable: "messages" });
      if (blocked.length > 0) {
        const ids = `(${blocked.join(",")})`;
        conversations = conversations.not("user1_id", "in", ids).not("user2_id", "in", ids);
      }
      const { data: convs, error } = await conversations;
      if (error) throw error;
      const otherIds = convs.map((c) => (c.user1_id === user!.id ? c.user2_id : c.user1_id));
      if (otherIds.length === 0) return [];
      const { data: profs, error: profileError } = await supabase
        .from("profiles")
        .select("id, pseudo, photo_url, anonymous_mode, last_seen, hide_status")
        .in("id", otherIds);
      if (profileError) throw profileError;
      const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
      return convs.map((c) => {
        const otherId = c.user1_id === user!.id ? c.user2_id : c.user1_id;
        return { id: c.id, otherId, other: map.get(otherId), latest: c.messages[0] };
      });
    },
  });

  const { data: matchCount } = useQuery({
    queryKey: ["match-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("matches")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const visible =
    blockedIds && !blocksError
      ? convs?.filter((conversation) => !blockedIds.has(conversation.otherId))
      : [];
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "short" });

  return (
    <main className="min-h-[calc(100svh-5rem)] bg-linear-to-b from-secondary via-background to-background text-foreground">
      <div className="mx-auto w-full max-w-2xl px-4 pt-7 pb-28 sm:px-8 sm:pt-12 md:pb-12">
        <header className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
          <Link
            to="/app/grid"
            aria-label={french ? "Retour aux profils" : "Back to profiles"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-primary transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <h1 className="font-display min-w-0 flex-1 text-3xl sm:text-4xl">{t("nav_chat")}</h1>
          {matchCount !== undefined && (
            <Link
              to="/app/matches"
              className="ml-auto inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-linear-to-r from-neon-magenta to-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] hover:brightness-95 sm:px-4"
            >
              <Heart className="size-4" fill="currentColor" aria-hidden="true" />
              {matchCount} {french ? "matchs" : matchCount === 1 ? "match" : "matches"}
            </Link>
          )}
        </header>

        {!blocksError && (blocksPending || (!!blockedIds && isPending)) && (
          <p
            role="status"
            className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
          >
            {french ? "Chargement des conversations…" : "Loading conversations…"}
          </p>
        )}
        {(isError || blocksError) && (
          <p
            role="alert"
            className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground"
          >
            {french ? "Impossible de charger les conversations." : "Could not load conversations."}
          </p>
        )}
        {convs && blockedIds && !blocksError && visible?.length === 0 && (
          <div className="grid justify-items-center gap-4 rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-surface)] sm:py-16">
            <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
              <MessageCircle className="size-7" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold">{t("no_conversations")}</h2>
            <p className="max-w-xs text-sm text-muted-foreground">
              {french
                ? "Like quelqu’un pour démarrer un match."
                : "Like a profile to start a match."}
            </p>
          </div>
        )}

        {visible && visible.length > 0 && (
          <ul className="divide-y divide-border rounded-3xl border border-border bg-card p-1.5 shadow-[var(--shadow-surface)] sm:p-2">
            {visible.map(({ id, other, latest }) => {
              const anon = !other || other.anonymous_mode;
              const active =
                !anon &&
                !other.hide_status &&
                Date.now() - new Date(other.last_seen).getTime() < 5 * 60_000;
              return (
                <li key={id}>
                  <Link
                    to="/app/chat/$id"
                    params={{ id }}
                    className="group flex min-h-22 items-center gap-3 rounded-2xl px-2.5 py-3 transition-colors hover:bg-secondary focus-visible:bg-secondary sm:gap-4 sm:px-4"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-13 ring-1 ring-border sm:size-15">
                        {!anon && other.photo_url && (
                          <AvatarImage src={other.photo_url} alt="" className="object-cover" />
                        )}
                        <AvatarFallback className="text-primary">
                          {anon ? (
                            <EyeOff className="size-5" aria-hidden="true" />
                          ) : (
                            <User className="size-5" aria-hidden="true" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {active && (
                        <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-online ring-2 ring-card">
                          <span className="sr-only">{t("online")}</span>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="min-w-0 truncate text-base font-bold">
                          {anon ? (french ? "Anonyme" : "Anonymous") : other.pseudo}
                        </p>
                        {latest && (
                          <time
                            dateTime={latest.created_at}
                            className="shrink-0 text-xs text-muted-foreground"
                          >
                            {date.format(new Date(latest.created_at))}
                          </time>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {messagePreview(latest?.content, french)}
                      </p>
                    </div>
                    <ChevronRight
                      className="size-4 shrink-0 text-muted-foreground group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </Link>
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
