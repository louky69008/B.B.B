import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/app/grid")({ component: Grid });

type Profile = {
  id: string;
  pseudo: string;
  bio: string | null;
  age: number | null;
  city: string | null;
  photo_url: string | null;
  last_seen: string;
  hide_status: boolean;
  pronouns: string | null;
  gender_identity: string | null;
};

function statusOf(p: Profile, t: (k: any) => string) {
  if (p.hide_status) return { dot: "bg-offline", label: "" };
  const diff = (Date.now() - new Date(p.last_seen).getTime()) / 1000;
  if (diff < 120) return { dot: "bg-online", label: t("online") };
  if (diff < 60 * 30) return { dot: "bg-recent", label: t("recent") };
  return { dot: "bg-offline", label: t("offline") };
}

function Grid() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, bio, age, city, photo_url, last_seen, hide_status, pronouns, gender_identity")
        .order("last_seen", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as Profile[];
    },
    refetchInterval: 30_000,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">{t("nav_grid")}</h1>
      {isLoading && <p className="text-muted-foreground">…</p>}
      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {data?.map((p) => {
          const s = statusOf(p, t);
          return (
            <Link
              key={p.id}
              to="/app/profile/$id"
              params={{ id: p.id }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card transition-transform hover:scale-[1.02]"
            >
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.pseudo} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <Heart className="size-8 text-primary/60" fill="currentColor" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${s.dot}`} />
                  <span className="truncate text-xs font-medium text-white">{p.pseudo}</span>
                </div>
                {p.age && <p className="text-[10px] text-white/70">{p.age} ans{p.city ? ` · ${p.city}` : ""}</p>}
              </div>
            </Link>
          );
        })}
      </div>
      {data && data.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">Aucun profil pour l'instant. Sois le premier !</p>
      )}
    </main>
  );
}
