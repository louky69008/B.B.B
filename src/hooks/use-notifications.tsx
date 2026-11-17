import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { useBlockedIds } from "@/hooks/use-blocks";
import { useMessageSound } from "@/hooks/use-message-sound";
import { messageTimeInMicroseconds } from "@/lib/message-time";
import { toast } from "sonner";

type Counts = { messages: number; parties: number };
type SeenKind = "conv" | "party";
type ConversationCounts = Record<string, number>;

const noUnread: ConversationCounts = {};

const Ctx = createContext<{
  counts: Counts;
  unreadByConversation: ConversationCounts;
  markSeen: (kind: SeenKind, id: string, readThrough?: string) => void;
  refresh: () => void;
}>({
  counts: { messages: 0, parties: 0 },
  unreadByConversation: noUnread,
  markSeen: () => {},
  refresh: () => {},
});

const seenKey = (userId: string, kind: SeenKind, id: string) => `seen:${userId}:${kind}:${id}`;
const getSeen = (userId: string, kind: SeenKind, id: string) => {
  const value = localStorage.getItem(seenKey(userId, kind, id));
  return value && Number.isFinite(messageTimeInMicroseconds(value))
    ? value
    : "1970-01-01T00:00:00Z";
};

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: blockedIds, isError: blocksError } = useBlockedIds();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const playSound = useMessageSound();
  const [direct, setDirect] = useState<{ userId: string; unread: ConversationCounts }>();
  const [parties, setParties] = useState<{ userId: string; count: number }>();
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((value) => value + 1), []);
  const markSeen = useCallback(
    (kind: SeenKind, id: string, readThrough = new Date().toISOString()) => {
      const readTime = messageTimeInMicroseconds(readThrough);
      if (
        !userId ||
        !Number.isFinite(readTime) ||
        readTime <= messageTimeInMicroseconds(getSeen(userId, kind, id))
      )
        return;
      localStorage.setItem(seenKey(userId, kind, id), readThrough);
      if (kind === "conv") {
        setDirect((current) => {
          if (!current || !(id in current.unread)) return current;
          const unread = { ...current.unread };
          delete unread[id];
          return { ...current, unread };
        });
      }
      refresh();
    },
    [refresh, userId],
  );

  useEffect(() => {
    if (!userId || !blockedIds || blocksError) return;
    let currentRequest = 0;
    const compute = async () => {
      const request = ++currentRequest;
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, last_message_at, user1_id, user2_id")
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
      if (error || request !== currentRequest) return;

      const unread: ConversationCounts = {};
      const candidates = conversations.filter((conversation) => {
        const otherId =
          conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;
        return (
          !blockedIds.has(otherId) &&
          messageTimeInMicroseconds(conversation.last_message_at) >
            messageTimeInMicroseconds(getSeen(userId, "conv", conversation.id))
        );
      });

      // Exact counts let Supabase apply message RLS without downloading message bodies.
      for (let index = 0; index < candidates.length; index += 8) {
        const results = await Promise.all(
          candidates.slice(index, index + 8).map(async ({ id }) => {
            const seen = getSeen(userId, "conv", id);
            const { count, error } = await supabase
              .from("messages")
              .select("id", { count: "exact", head: true })
              .eq("conversation_id", id)
              .neq("sender_id", userId)
              .gt("created_at", seen);
            return { id, count, error };
          }),
        );
        if (request !== currentRequest || results.some((result) => result.error)) return;
        for (const { id, count } of results) {
          if (count) unread[id] = count;
        }
      }
      setDirect({ userId, unread });
    };

    void compute();
    const interval = setInterval(compute, 20_000);
    return () => {
      currentRequest += 1;
      clearInterval(interval);
    };
  }, [userId, blockedIds, blocksError, tick]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const compute = async () => {
      const [{ data: hosted }, { data: parts }] = await Promise.all([
        supabase.from("parties").select("id").eq("host_id", userId),
        supabase.from("party_participants").select("party_id").eq("user_id", userId),
      ]);
      const partyIds = new Set([
        ...(hosted ?? []).map((party) => party.id),
        ...(parts ?? []).map((part) => part.party_id),
      ]);

      let count = 0;
      for (const id of partyIds) {
        const { data: latest } = await supabase
          .from("party_messages")
          .select("created_at, sender_id")
          .eq("party_id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (
          latest &&
          latest.sender_id !== userId &&
          messageTimeInMicroseconds(latest.created_at) >
            messageTimeInMicroseconds(getSeen(userId, "party", id))
        ) {
          count += 1;
        }
      }
      if (!cancelled) setParties({ userId, count });
    };

    void compute();
    const interval = setInterval(compute, 20_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId, tick]);

  const onMessage = useEffectEvent((message: Tables<"messages">) => {
    void queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
    if (message.sender_id === userId) return;
    const reading =
      pathname === `/app/chat/${message.conversation_id}` && document.visibilityState === "visible";
    if (!reading && blockedIds && !blocksError && !blockedIds.has(message.sender_id)) {
      playSound();
      toast("💬 Nouveau message", { description: "Tu as reçu un message privé" });
    }
    refresh();
  });

  const onPartyMessage = useEffectEvent((message: Tables<"party_messages">) => {
    if (message.sender_id === userId) return;
    if (!pathname.includes(`/app/parties/${message.party_id}`)) {
      playSound();
      toast("🎉 Soirée appart'", { description: "Nouveau message dans le tchat de groupe" });
    }
    refresh();
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("notif-" + userId)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) =>
        onMessage(payload.new as Tables<"messages">),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "party_messages" },
        (payload) => onPartyMessage(payload.new as Tables<"party_messages">),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
    // Effect Events read current route and block state without reopening the channel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const party = pathname.match(/\/app\/parties\/([^/]+)/);
    if (party && party[1] !== "new") markSeen("party", party[1]);
  }, [pathname, userId, markSeen]);

  const unreadByConversation =
    direct && direct.userId === userId && blockedIds && !blocksError ? direct.unread : noUnread;
  const counts = {
    messages: Object.keys(unreadByConversation).length,
    parties: parties && parties.userId === userId ? parties.count : 0,
  };

  return (
    <Ctx.Provider value={{ counts, unreadByConversation, markSeen, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useNotifications = () => useContext(Ctx);
