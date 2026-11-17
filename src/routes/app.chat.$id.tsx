import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useBlockedIds } from "@/hooks/use-blocks";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/lib/i18n";
import { messageTimeInMicroseconds } from "@/lib/message-time";
import {
  Send,
  Sparkles,
  ArrowLeft,
  EyeOff,
  Ghost,
  Check,
  X,
  MessageCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/chat/$id")({ component: ChatRoomRoute });

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function ChatRoomRoute() {
  const { id } = Route.useParams();
  return <ChatRoom key={id} id={id} />;
}

function ChatRoom({ id }: { id: string }) {
  const { user } = useAuth();
  const { markSeen } = useNotifications();
  const { lang, t } = useI18n();
  const french = lang === "fr";
  const { config } = useSubscription();
  const { data: blockedIds, isPending: blocksPending } = useBlockedIds();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIB, setLoadingIB] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: conv, isPending: convPending } = useQuery({
    queryKey: ["conv", user?.id, id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("user1_id, user2_id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const otherId = conv && user ? (conv.user1_id === user.id ? conv.user2_id : conv.user1_id) : null;
  const canOpen = !!otherId && !!blockedIds && !blockedIds.has(otherId);

  const { data: other, isPending: profilePending } = useQuery({
    queryKey: ["other-profile", user?.id, otherId],
    enabled: canOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, photo_url, bio, anonymous_mode, last_seen, hide_status")
        .eq("id", otherId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const {
    data: messages,
    isPending: messagesPending,
    isError: messagesError,
  } = useQuery({
    queryKey: ["messages", user?.id, id],
    enabled: canOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  useEffect(() => {
    if (!canOpen) return;
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${id}`,
        },
        (payload) => {
          qc.setQueryData<Message[]>(["messages", user?.id, id], (prev) => {
            const m = payload.new as Message;
            if (prev?.some((x) => x.id === m.id)) return prev;
            return [...(prev ?? []), m];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [canOpen, id, qc, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!canOpen || !messages?.length) return;
    const latest = messages.reduce(
      (time, message) =>
        messageTimeInMicroseconds(message.created_at) > messageTimeInMicroseconds(time)
          ? message.created_at
          : time,
      messages[0].created_at,
    );
    const markVisible = () => {
      if (document.visibilityState === "visible") markSeen("conv", id, latest);
    };
    markVisible();
    document.addEventListener("visibilitychange", markVisible);
    return () => document.removeEventListener("visibilitychange", markVisible);
  }, [canOpen, id, markSeen, messages]);

  const insertMessage = async (content: string) => {
    if (!content || !user || !canOpen) return;
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: user.id, content });
    if (error) {
      toast.error(error.message);
      return;
    }
    void qc.invalidateQueries({ queryKey: ["messages", user.id, id] });
  };

  const send = async (value: string) => {
    const content = value.trim();
    if (!content || !user || !canOpen) return;
    setText("");
    setIcebreakers([]);
    await insertMessage(content);
  };

  const generateIcebreakers = async () => {
    if (!config.icebreakersAI) {
      toast.error(french ? "Réservé aux abonnés Premium." : "Available to Premium subscribers.");
      return;
    }
    setLoadingIB(true);
    try {
      const { data, error } = await supabase.functions.invoke("icebreakers", {
        body: {
          otherPseudo: other?.anonymous_mode ? "Anonyme" : other?.pseudo,
          otherBio: other?.anonymous_mode ? "" : (other?.bio ?? ""),
        },
      });
      if (error) throw error;
      setIcebreakers(data.suggestions ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : french ? "Erreur IA" : "AI error");
    } finally {
      setLoadingIB(false);
    }
  };

  const anonymous = !other || other.anonymous_mode;
  const otherDisplay = anonymous ? (french ? "Anonyme" : "Anonymous") : other.pseudo;
  const active =
    other &&
    !anonymous &&
    !other.hide_status &&
    Date.now() - new Date(other.last_seen).getTime() < 5 * 60_000;
  const messageTime = new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit" });

  return (
    <main className="bg-linear-to-b from-secondary via-background to-background text-foreground sm:px-6 sm:py-5">
      <div className="mx-auto flex h-[calc(100dvh-5rem)] min-h-80 w-full max-w-2xl flex-col bg-background sm:h-[calc(100dvh-7.5rem)] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-border sm:shadow-[var(--shadow-surface)]">
        <header className="flex min-h-19 shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-3 sm:px-5">
          <Link
            to="/app/chat"
            aria-label={french ? "Retour aux messages" : "Back to messages"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          {canOpen && !profilePending ? (
            <>
              <Avatar className="size-11 ring-1 ring-border sm:size-12">
                {!anonymous && other.photo_url && (
                  <AvatarImage src={other.photo_url} alt="" className="object-cover" />
                )}
                <AvatarFallback className="text-primary">
                  {anonymous ? (
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <User className="size-5" aria-hidden="true" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg leading-tight font-bold sm:text-xl">
                  {!anonymous && otherId ? (
                    <Link
                      to="/app/profile/$id"
                      params={{ id: otherId }}
                      className="rounded-sm hover:text-primary hover:underline"
                    >
                      {otherDisplay}
                    </Link>
                  ) : (
                    otherDisplay
                  )}
                </h1>
                {active && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-online">
                    <span className="size-2 rounded-full bg-online" aria-hidden="true" />
                    {t("online")}
                  </p>
                )}
              </div>
            </>
          ) : (
            <h1 className="text-lg font-bold">{t("nav_chat")}</h1>
          )}
        </header>

        <div
          role="log"
          aria-label={t("nav_chat")}
          className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-y-contain bg-linear-to-b from-secondary/55 to-background px-4 py-5 sm:px-6 sm:py-6"
        >
          {(blocksPending || convPending || (canOpen && messagesPending)) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {french ? "Chargement des messages…" : "Loading messages…"}
            </p>
          )}
          {!blocksPending && !convPending && (!canOpen || messagesError) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {french
                ? "Cette conversation est indisponible."
                : "This conversation is unavailable."}
            </p>
          )}
          {canOpen && messages?.length === 0 && (
            <div className="grid justify-items-center gap-3 py-12 text-center text-sm text-muted-foreground">
              <div className="grid size-12 place-items-center rounded-2xl border border-border bg-card text-primary">
                <MessageCircle className="size-6" aria-hidden="true" />
              </div>
              {french ? "Aucun message pour le moment." : "No messages yet."}
            </div>
          )}
          {canOpen &&
            messages?.map((m) => {
              const mine = m.sender_id === user?.id;
              // Snap request
              if (m.content === "__snap_request__") {
                const alreadyAnswered = messages.some(
                  (x) =>
                    new Date(x.created_at) > new Date(m.created_at) &&
                    x.sender_id !== m.sender_id &&
                    (x.content.startsWith("__snap_accept__") || x.content === "__snap_decline__"),
                );
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="w-full max-w-sm space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-amber-950">
                        <Ghost className="size-4" aria-hidden="true" />
                        {mine
                          ? french
                            ? "Tu as demandé son Snapchat"
                            : "You requested their Snapchat"
                          : french
                            ? "Demande de Snapchat"
                            : "Snapchat request"}
                      </div>
                      {!mine && !alreadyAnswered && (
                        <>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const handle = window
                                  .prompt(french ? "Ton pseudo Snapchat" : "Your Snapchat username")
                                  ?.trim();
                                if (handle) await insertMessage(`__snap_accept__:${handle}`);
                              }}
                              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full bg-amber-300 px-2 text-sm font-semibold text-amber-950 hover:bg-amber-400"
                            >
                              <Check className="size-4" aria-hidden="true" />{" "}
                              {french ? "Accepter" : "Accept"}
                            </button>
                            <button
                              onClick={() => insertMessage("__snap_decline__")}
                              className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-full border border-border bg-card px-2 text-sm font-medium hover:bg-secondary"
                            >
                              <X className="size-4" aria-hidden="true" />{" "}
                              {french ? "Refuser" : "Decline"}
                            </button>
                          </div>
                        </>
                      )}
                      {mine && !alreadyAnswered && (
                        <p className="text-xs text-amber-900">
                          {french ? "En attente de sa réponse…" : "Waiting for their reply…"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              }
              if (m.content.startsWith("__snap_accept__")) {
                const handle = m.content.replace("__snap_accept__:", "");
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-amber-950">
                      <div className="mb-1 flex items-center justify-center gap-2 text-sm font-semibold">
                        <Ghost className="size-4" aria-hidden="true" />{" "}
                        {french ? "Snapchat partagé" : "Snapchat shared"}
                      </div>
                      <a
                        href={`https://www.snapchat.com/add/${encodeURIComponent(handle)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono break-all underline"
                      >
                        @{handle}
                      </a>
                    </div>
                  </div>
                );
              }
              if (m.content === "__snap_decline__") {
                return (
                  <div key={m.id} className="flex justify-center">
                    <div className="max-w-[85%] rounded-2xl border border-border bg-secondary px-4 py-2 text-center text-xs text-muted-foreground">
                      {french ? "Demande de Snap refusée" : "Snapchat request declined"}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word sm:max-w-[75%] ${
                      mine
                        ? "rounded-br-md bg-linear-to-br from-neon-magenta to-primary text-primary-foreground shadow-[var(--shadow-neon)]"
                        : "rounded-bl-md border border-border bg-secondary text-foreground"
                    }`}
                  >
                    <span className="sr-only">
                      {mine ? (french ? "Toi" : "You") : otherDisplay}{" "}
                    </span>
                    {m.content}
                  </div>
                  <time dateTime={m.created_at} className="mt-1 px-1 text-xs text-muted-foreground">
                    {messageTime.format(new Date(m.created_at))}
                  </time>
                </div>
              );
            })}
          <div ref={endRef} />
        </div>

        {/* Icebreakers */}
        {canOpen && icebreakers.length > 0 && (
          <div className="max-h-[30%] shrink-0 space-y-1.5 overflow-y-auto border-t border-border bg-card px-3 py-2 sm:px-5">
            <p className="px-1 text-xs font-semibold text-muted-foreground">
              {french ? "Suggestions IA" : "AI suggestions"}
            </p>
            {icebreakers.map((ib, i) => (
              <button
                key={i}
                type="button"
                onClick={() => send(ib)}
                className="block min-h-11 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {ib}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {canOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(text);
            }}
            className="flex shrink-0 items-center gap-1.5 border-t border-border bg-card px-2.5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-2 sm:px-5"
          >
            <button
              type="button"
              onClick={generateIcebreakers}
              disabled={loadingIB}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-secondary text-primary hover:bg-accent disabled:opacity-50"
              title={french ? "Suggestions IA" : "AI suggestions"}
              aria-label={french ? "Obtenir des suggestions IA" : "Get AI suggestions"}
              aria-busy={loadingIB}
            >
              <Sparkles
                className={`size-4 ${loadingIB ? "motion-safe:animate-pulse" : ""}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => insertMessage("__snap_request__")}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-100"
              title={french ? "Demander Snapchat" : "Request Snapchat"}
              aria-label={french ? "Demander Snapchat" : "Request Snapchat"}
            >
              <Ghost className="size-4" aria-hidden="true" />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("type_message")}
              aria-label={t("type_message")}
              maxLength={2000}
              className="h-11 min-w-0 flex-1 rounded-full border border-border bg-secondary px-3 text-base placeholder:text-muted-foreground focus:border-primary sm:px-4"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              aria-label={t("send")}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-neon-magenta to-primary text-primary-foreground shadow-[var(--shadow-neon)] hover:brightness-95 disabled:opacity-55"
            >
              <Send className="size-4" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
