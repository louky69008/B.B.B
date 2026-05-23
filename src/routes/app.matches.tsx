import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, EyeOff, Heart, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/app/matches")({ component: MatchesList });

function MatchesList() {
  const { user } = useAuth();

  const { data: matches, isLoading } = useQuery({
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
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="relative w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-3 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-bold flex-1">Mes matchs</h1>
          <div className="flex items-center gap-1 text-xs text-pink-500">
            <Heart className="size-4 fill-pink-500" /> {matches?.length ?? 0}
          </div>
        </header>

        {isLoading && (
          <div className="text-center text-neutral-500 text-sm mt-16">Chargement…</div>
        )}

        {matches && matches.length === 0 && (
          <div className="text-center text-neutral-500 text-sm mt-16 px-6">
            Aucun match pour le moment. Continue à liker des profils 💖
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-2">
          {matches?.map((m) => {
            const anon = m.other?.anonymous_mode;
            return (
              <Link
                key={m.id}
                to="/app/chat/$id"
                params={{ id: m.conversation_id ?? "" }}
                className="relative aspect-square rounded-lg overflow-hidden bg-neutral-900 group"
              >
                {anon ? (
                  <div className="size-full flex items-center justify-center bg-neutral-800">
                    <EyeOff className="size-8 text-neutral-400" />
                  </div>
                ) : m.other?.photo_url ? (
                  <img src={m.other.photo_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-neutral-800" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                  <p className="text-sm font-semibold truncate">
                    {anon ? "Anonyme" : (m.other?.pseudo ?? "…")}
                    {!anon && m.other?.age ? `, ${m.other.age}` : ""}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-300">
                    <MessageSquare className="size-3" /> Envoyer un message
                  </div>
                </div>
                <Heart className="absolute top-2 right-2 size-4 fill-pink-500 text-pink-500 drop-shadow" />
              </Link>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
