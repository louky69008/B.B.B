import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Heart, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/app/trans")({ component: TransCommunity });

const TRANS_IDENTITIES = [
  "femme_trans",
  "homme_trans",
  "travesti",
  "drag",
  "non_binaire",
  "genderfluid",
  "genderqueer",
  "agender",
  "two_spirit",
  "intersexe",
];

function TransCommunity() {
  const { data: profiles } = useQuery({
    queryKey: ["trans-profiles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, pseudo, age, city, photo_url, gender_identity, pronouns, last_seen, hide_status",
        )
        .in("gender_identity", TRANS_IDENTITIES)
        .order("last_seen", { ascending: false })
        .limit(200);
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="bg-gradient-to-r from-pink-300 via-white to-cyan-300 bg-clip-text text-transparent">
                Communauté Trans
              </span>
              <Heart className="size-4 text-pink-300" />
            </h1>
          </div>
        </header>

        <div className="px-4 pt-4 pb-2">
          <p className="text-xs text-neutral-400 leading-relaxed">
            Un espace bienveillant pour les personnes trans, non-binaires et genderfluid. Aucune
            discrimination tolérée — règle stricte.
          </p>
        </div>

        <div className="px-4 mt-3">
          <Link
            to="/app/parties"
            className="block rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-cyan-400/20 border border-pink-400/40 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-pink-400/20 flex items-center justify-center">
                <PartyPopper className="size-5 text-pink-300" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm">Événements & rencontres trans-friendly</div>
                <div className="text-xs text-neutral-400">Organise ou rejoins une soirée safe</div>
              </div>
            </div>
          </Link>
        </div>

        <h2 className="px-4 mt-6 mb-2 text-xs uppercase tracking-wider text-neutral-500">
          Membres ({profiles?.length ?? 0})
        </h2>

        <div className="px-2 grid grid-cols-3 gap-1">
          {profiles?.map((p) => {
            const online =
              !p.hide_status && (Date.now() - new Date(p.last_seen).getTime()) / 1000 < 60 * 5;
            return (
              <Link
                key={p.id}
                to="/app/profile/$id"
                params={{ id: p.id }}
                className="relative aspect-square overflow-hidden rounded-md bg-neutral-900"
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.pseudo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-cyan-400/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                <div className="absolute bottom-1 left-1 right-1 text-[10px]">
                  <div className="font-bold truncate">
                    {p.pseudo}
                    {p.age ? `, ${p.age}` : ""}
                  </div>
                  <div className="text-neutral-300 truncate">{p.pronouns}</div>
                </div>
                {online && (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-emerald-400 ring-2 ring-black" />
                )}
              </Link>
            );
          })}
        </div>

        {profiles?.length === 0 && (
          <p className="text-center text-sm text-neutral-500 mt-12 px-8">
            Personne ici pour l'instant. Sois la première personne visible !
          </p>
        )}
      </div>
    </main>
  );
}
