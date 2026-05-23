import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/app/profile/$id")({ component: ProfileDetail });

function ProfileDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const startChat = async () => {
    if (!user) return;
    const [a, b] = [user.id, id].sort();
    const existing = await supabase
      .from("conversations")
      .select("id")
      .eq("user1_id", a)
      .eq("user2_id", b)
      .maybeSingle();
    let convId = existing.data?.id;
    if (!convId) {
      const created = await supabase
        .from("conversations")
        .insert({ user1_id: a, user2_id: b })
        .select("id")
        .single();
      if (created.error) { console.error(created.error); return; }
      convId = created.data.id;
    }
    navigate({ to: "/app/chat/$id", params: { id: convId } });
  };

  if (isLoading) return <main className="px-4 py-8 text-muted-foreground">…</main>;
  if (!data) return <main className="px-4 py-8">Profil introuvable</main>;

  const isMe = user?.id === data.id;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="aspect-square w-full bg-muted">
          {data.photo_url ? (
            <img src={data.photo_url} alt={data.pseudo} className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-br from-primary/30 to-accent/30" />
          )}
        </div>
        <div className="space-y-4 p-6">
          <div>
            <h1 className="text-2xl font-bold">{data.pseudo}</h1>
            <p className="text-sm text-muted-foreground">
              {data.pronouns}{data.gender_identity ? ` · ${data.gender_identity}` : ""}
              {data.age ? ` · ${data.age} ans` : ""}
              {data.city ? ` · ${data.city}` : ""}
            </p>
          </div>
          {data.bio && <p className="whitespace-pre-wrap text-sm">{data.bio}</p>}
          {!isMe && (
            <Button onClick={startChat} className="w-full">
              <MessageCircle className="size-4" /> {t("send_message")}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
