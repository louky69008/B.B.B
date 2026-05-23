import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/app/chat")({ component: ChatList });

function ChatList() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { data } = useQuery({
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
        .from("profiles")
        .select("id, pseudo, photo_url")
        .in("id", otherIds);
      const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
      return convs.map((c) => ({
        id: c.id,
        other: map.get(c.user1_id === user!.id ? c.user2_id : c.user1_id),
        last_message_at: c.last_message_at,
      }));
    },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">{t("nav_chat")}</h1>
      {data && data.length === 0 && (
        <p className="text-muted-foreground">{t("no_conversations")}</p>
      )}
      <ul className="space-y-2">
        {data?.map((c) => (
          <li key={c.id}>
            <Link
              to="/app/chat/$id"
              params={{ id: c.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-accent/10"
            >
              <div className="size-12 overflow-hidden rounded-full bg-muted">
                {c.other?.photo_url && <img src={c.other.photo_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.other?.pseudo ?? "…"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.last_message_at).toLocaleString()}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
