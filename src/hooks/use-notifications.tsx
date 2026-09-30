import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useMessageSound } from "@/hooks/use-message-sound";
import { toast } from "sonner";

type Counts = { messages: number; parties: number };

const Ctx = createContext<{
  counts: Counts;
  markSeen: (kind: "conv" | "party", id: string) => void;
  refresh: () => void;
}>({ counts: { messages: 0, parties: 0 }, markSeen: () => {}, refresh: () => {} });

const seenKey = (kind: string, id: string) => `seen:${kind}:${id}`;
const getSeen = (kind: string, id: string) => Number(localStorage.getItem(seenKey(kind, id)) ?? 0);
const setSeen = (kind: string, id: string, ts = Date.now()) =>
  localStorage.setItem(seenKey(kind, id), String(ts));

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const playSound = useMessageSound();
  const [counts, setCounts] = useState<Counts>({ messages: 0, parties: 0 });
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);

  // Recompute unread counts
  useEffect(() => {
    if (!user) {
      setCounts({ messages: 0, parties: 0 });
      return;
    }
    let cancelled = false;

    const compute = async () => {
      // 1) Direct conversations: unread = last_message_at > seen and the latest
      // message sender is not me.
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, last_message_at, user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      let msgs = 0;
      for (const c of convs ?? []) {
        const seen = getSeen("conv", c.id);
        const last = new Date(c.last_message_at).getTime();
        if (last <= seen) continue;
        // Check sender of last message
        const { data: lastMsg } = await supabase
          .from("messages")
          .select("sender_id")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastMsg && lastMsg.sender_id !== user.id) msgs += 1;
      }

      // 2) Parties (hosted + participated): unread group messages from others
      const [{ data: hosted }, { data: parts }] = await Promise.all([
        supabase.from("parties").select("id").eq("host_id", user.id),
        supabase.from("party_participants").select("party_id").eq("user_id", user.id),
      ]);
      const partyIds = Array.from(
        new Set([
          ...(hosted ?? []).map((p) => p.id as string),
          ...(parts ?? []).map((p) => p.party_id as string),
        ]),
      );

      let pCount = 0;
      for (const pid of partyIds) {
        const { data: latest } = await supabase
          .from("party_messages")
          .select("created_at, sender_id")
          .eq("party_id", pid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!latest) continue;
        const seen = getSeen("party", pid);
        const last = new Date(latest.created_at).getTime();
        if (last > seen && latest.sender_id !== user.id) pCount += 1;
      }

      if (!cancelled) setCounts({ messages: msgs, parties: pCount });
    };

    compute();
    const id = setInterval(compute, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user?.id, tick]);

  // Realtime: live toast + refresh on incoming message
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; conversation_id: string };
          if (m.sender_id === user.id) return;
          // Only toast if not currently viewing that conversation
          if (!pathname.includes(`/app/chat/${m.conversation_id}`)) {
            playSound();
            toast("💬 Nouveau message", { description: "Tu as reçu un message privé" });
          }
          refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "party_messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; party_id: string };
          if (m.sender_id === user.id) return;
          if (!pathname.includes(`/app/parties/${m.party_id}`)) {
            playSound();
            toast("🎉 Soirée appart'", { description: "Nouveau message dans le tchat de groupe" });
          }
          refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, pathname]);

  // Auto mark-seen when user opens a conversation / party page
  useEffect(() => {
    const conv = pathname.match(/\/app\/chat\/([^/]+)/);
    if (conv) {
      setSeen("conv", conv[1]);
      refresh();
    }
    const party = pathname.match(/\/app\/parties\/([^/]+)/);
    if (party && party[1] !== "new") {
      setSeen("party", party[1]);
      refresh();
    }
  }, [pathname]);

  return (
    <Ctx.Provider
      value={{
        counts,
        markSeen: (k, i) => {
          setSeen(k, i);
          refresh();
        },
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useNotifications = () => useContext(Ctx);
