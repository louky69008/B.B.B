import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";


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
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--neon-cyan)]">
          // grid.live
        </span>
        <h1 className="font-display mt-3 text-4xl font-black uppercase tracking-tight">{t("nav_grid")}</h1>
      </div>
      {isLoading && <p className="font-mono text-xs uppercase tracking-widest text-[#666]">// loading...</p>}
      <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-4 lg:grid-cols-5">
        {data?.map((p) => {
          const s = statusOf(p, t);
          const badges = ["DJ", "Voguer", "Latex", "Kink", "Bear", "Twink"];
          const badge = badges[p.id.charCodeAt(0) % badges.length];
          return (
            <Link
              key={p.id}
              to="/app/profile/$id"
              params={{ id: p.id }}
              className="group relative aspect-square overflow-hidden bg-black"
            >
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.pseudo} className="photo-bw size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-[color:var(--neon-magenta)]/20 to-[color:var(--neon-cyan)]/20">
                  <span className="font-display text-3xl text-[color:var(--neon-magenta)] neon-glow-magenta">
                    {p.pseudo[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              {/* pseudo top-left mono */}
              <div className="absolute left-2 top-2 flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full ${s.dot} ${s.label === t("online") ? "pulse-dot" : ""}`} />
                <span className="font-mono text-[10px] uppercase tracking-wider text-white">{p.pseudo}</span>
              </div>
              {/* badge */}
              <span className="absolute right-2 top-2 border border-[color:var(--neon-lime)] bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[color:var(--neon-lime)]">
                {badge}
              </span>
              {/* age bottom-right cyan */}
              {p.age && (
                <span className="absolute bottom-2 right-2 font-mono text-[10px] font-bold text-[color:var(--neon-cyan)] neon-glow-cyan">
                  {p.age}
                </span>
              )}
              {/* hover scan line */}
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--neon-magenta)]/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          );
        })}
      </div>
      {data && data.length === 0 && (
        <p className="mt-16 text-center font-mono text-xs uppercase tracking-[0.2em] text-[#666]">
          // no_signal :: be the first
        </p>
      )}
    </main>
  );
}

