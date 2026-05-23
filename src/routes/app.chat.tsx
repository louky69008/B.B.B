import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, EyeOff, Heart, MessageSquare } from "lucide-react";
import { useBlockedIds } from "@/hooks/use-blocks";

export const Route = createFileRoute("/app/chat")({ component: ChatList });

function ChatList() {
  const { user } = useAuth();
  const { data: blockedIds } = useBlockedIds();

  const { data: convs } = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("id, user1_id, user2_id, last_message_at")
        .or(`user1_id.eq.${user!.id},user2_id.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      const otherIds = convs.map((c) => (c.user1_id === user!.id ? c.user2_id : c.user1_id));
      if (otherIds.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles").select("id, pseudo, photo_url, anonymous_mode").in("id", otherIds);
      const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
      return convs.map((c) => ({
        id: c.id,
        other: map.get(c.user1_id === user!.id ? c.user2_id : c.user1_id),
        last_message_at: c.last_message_at,
      }));
    },
  });

  const { data: matchCount } = useQuery({
    queryKey: ["match-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("matches").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="relative w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-3 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-bold flex-1">Messages</h1>
          <div className="flex items-center gap-1 text-xs text-pink-500">
            <Heart className="size-4 fill-pink-500" /> {matchCount ?? 0} matchs
          </div>
        </header>

        {convs && convs.length === 0 && (
          <div className="text-center text-neutral-500 text-sm mt-16 px-6">
            Aucune conversation pour le moment. Like quelqu'un pour démarrer un match 💖
          </div>
        )}

        <ul>
          {convs?.map((c) => {
            const anon = c.other?.anonymous_mode;
            return (
              <li key={c.id}>
                <Link
                  to="/app/chat/$id" params={{ id: c.id }}
                  className="flex items-center gap-3 px-3 py-3 border-b border-neutral-900 hover:bg-neutral-900/50 active:bg-neutral-900"
                >
                  <div className="size-12 rounded-full overflow-hidden bg-neutral-800 shrink-0">
                    {anon ? (
                      <div className="size-full flex items-center justify-center bg-neutral-700">
                        <EyeOff className="size-5 text-neutral-300" />
                      </div>
                    ) : c.other?.photo_url ? (
                      <img src={c.other.photo_url} alt="" className="size-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{anon ? "Anonyme" : (c.other?.pseudo ?? "…")}</p>
                    <p className="text-xs text-neutral-500">{new Date(c.last_message_at).toLocaleString()}</p>
                  </div>
                  <MessageSquare className="size-4 text-neutral-600" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    <BottomNav />
    </main>
  );
}
