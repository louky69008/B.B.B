import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { SlidersHorizontal, Star, Droplet, Heart, MessageSquare, User, Crown, X, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/app/grid")({ component: Grid });

type Profile = {
  id: string;
  pseudo: string;
  age: number | null;
  photo_url: string | null;
  last_seen: string;
  hide_status: boolean;
  gender_identity: string | null;
};

function isOnline(p: Profile) {
  if (p.hide_status) return false;
  return (Date.now() - new Date(p.last_seen).getTime()) / 1000 < 60 * 5;
}

function Grid() {
  const { user } = useAuth();
  const navigate = useNavigate({ from: "/app/grid" });
  const { config } = useSubscription();
  const limit = config.profileLimit === -1 ? 600 : config.profileLimit;

  const [onlineOnly, setOnlineOnly] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showAgeSheet, setShowAgeSheet] = useState(false);
  const [showFiltersSheet, setShowFiltersSheet] = useState(false);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(75);
  const [ageActive, setAgeActive] = useState(false);
  const [identityFilter, setIdentityFilter] = useState<string>("all");

  const { data } = useQuery({
    queryKey: ["profiles-grid", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, age, photo_url, last_seen, hide_status, gender_identity")
        .order("last_seen", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Profile[];
    },
    refetchInterval: 30_000,
  });

  // Favorites = mutual matches OR profiles I liked
  const { data: likedIds } = useQuery({
    queryKey: ["my-likes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("likes").select("liked_id").eq("liker_id", user!.id);
      return new Set((data ?? []).map((r) => r.liked_id as string));
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const TRANS = new Set(["femme_trans", "homme_trans", "non_binaire", "genderfluid", "agender"]);
    return data.filter((p) => {
      if (onlineOnly && !isOnline(p)) return false;
      if (favoritesOnly && !likedIds?.has(p.id)) return false;
      if (ageActive && p.age != null && (p.age < ageMin || p.age > ageMax)) return false;
      if (identityFilter === "trans" && !TRANS.has(p.gender_identity ?? "")) return false;
      if (identityFilter === "cis" && p.gender_identity !== "homme_cis") return false;
      return true;
    });
  }, [data, onlineOnly, favoritesOnly, ageActive, ageMin, ageMax, likedIds, identityFilter]);

  const pillBase = "shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border";
  const pillOff = "bg-neutral-900 text-white border-neutral-700";
  const pillOn = "bg-yellow-400 text-black border-yellow-400";

  return (
    <main className="min-h-screen w-full flex justify-center bg-black">
      <div className="relative w-full max-w-[420px] min-h-screen bg-black pb-20">
        {/* Header signature Prism */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-500 via-amber-400 to-cyan-400 shadow-lg shadow-fuchsia-500/30" />
            <div className="leading-tight">
              <p className="text-white font-bold text-[15px] tracking-tight">Prism</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Près de toi</p>
            </div>
          </div>
          <Link to="/app/me" className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <User className="w-4 h-4 text-neutral-300" />
          </Link>
        </header>

        {/* Filters */}
        <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setShowFiltersSheet(true)}
            className={`shrink-0 flex items-center rounded-full p-1.5 border ${pillOff}`}
            aria-label="Filtres avancés"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            className={`shrink-0 flex items-center rounded-full p-1.5 border ${favoritesOnly ? pillOn : pillOff}`}
            aria-label="Favoris"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            className={`${pillBase} ${onlineOnly ? pillOn : "bg-white text-black border-white"}`}
          >
            En ligne
          </button>
          <button className={`${pillBase} flex items-center gap-1.5 ${pillOff}`}>
            <Droplet className="w-3.5 h-3.5" /> Right Now
          </button>
          <button
            onClick={() => setShowAgeSheet(true)}
            className={`${pillBase} ${ageActive ? pillOn : pillOff}`}
          >
            {ageActive ? `Âge ${ageMin}-${ageMax}` : "Âge"}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-px bg-black">
          {filtered.map((p) => {
            const online = isOnline(p);
            return (
              <button key={p.id} type="button" onClick={() => navigate({ to: "/app/profile/$id", params: { id: p.id } })}
                className="relative aspect-square overflow-hidden bg-neutral-900 text-left cursor-pointer">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.pseudo} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex w-full h-full items-center justify-center bg-neutral-800">
                    <User className="w-16 h-16 text-neutral-600" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1.5">
                  {online && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                  <span className="text-white text-[11px] font-medium truncate max-w-[80px]">{p.pseudo}</span>
                </div>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && data && (
          <p className="text-center text-neutral-500 text-sm mt-8 px-6">
            Aucun profil ne correspond à ces filtres.
          </p>
        )}

        {/* Limit reached banner */}
        {config.profileLimit !== -1 && data && data.length >= config.profileLimit && (
          <div className="mt-3 mx-3 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-4 text-center">
            <p className="text-sm text-yellow-300 font-semibold">Limite atteinte ({config.profileLimit} profils)</p>
            <p className="text-xs text-neutral-400 mt-1">Passez Premium pour voir tous les profils</p>
            <Link to="/app/subscribe" className="inline-block mt-3 px-4 py-2 rounded-full bg-yellow-400 text-black text-sm font-bold">
              Voir les offres
            </Link>
          </div>
        )}

        {/* Age bottom sheet */}
        {showAgeSheet && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70" onClick={() => setShowAgeSheet(false)}>
            <div className="w-full max-w-[420px] bg-neutral-950 border-t border-neutral-800 rounded-t-3xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Âge</h3>
                <button onClick={() => setShowAgeSheet(false)}><X className="w-5 h-5 text-neutral-400" /></button>
              </div>
              <div className="flex gap-3">
                <label className="flex-1 text-xs text-neutral-400">
                  Min: <span className="text-white font-semibold">{ageMin}</span>
                  <input type="range" min={18} max={99} value={ageMin}
                    onChange={(e) => setAgeMin(Math.min(+e.target.value, ageMax))}
                    className="w-full accent-yellow-400" />
                </label>
                <label className="flex-1 text-xs text-neutral-400">
                  Max: <span className="text-white font-semibold">{ageMax}</span>
                  <input type="range" min={18} max={99} value={ageMax}
                    onChange={(e) => setAgeMax(Math.max(+e.target.value, ageMin))}
                    className="w-full accent-yellow-400" />
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setAgeActive(false); setShowAgeSheet(false); }}
                  className="flex-1 py-2.5 rounded-full border border-neutral-700 text-white text-sm">
                  Réinitialiser
                </button>
                <button onClick={() => { setAgeActive(true); setShowAgeSheet(false); }}
                  className="flex-1 py-2.5 rounded-full bg-yellow-400 text-black text-sm font-semibold">
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced filters placeholder sheet */}
        {showFiltersSheet && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70" onClick={() => setShowFiltersSheet(false)}>
            <div className="w-full max-w-[420px] bg-neutral-950 border-t border-neutral-800 rounded-t-3xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-white font-semibold">Filtres</h3>
                <button onClick={() => setShowFiltersSheet(false)}><X className="w-5 h-5 text-neutral-400" /></button>
              </div>
              <p className="text-sm text-neutral-400">
                Filtres avancés (identité de genre, ville, distance, mots-clés…) — à préciser avec toi avant implémentation.
              </p>
              <Link to="/app/subscribe" onClick={() => setShowFiltersSheet(false)}
                className="block text-center py-2.5 rounded-full bg-yellow-400 text-black text-sm font-semibold">
                Débloquer tous les filtres (Premium)
              </Link>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-black border-t border-neutral-800 z-30">
          <div className="flex justify-around items-center py-2 pb-6">
            <Link to="/app/grid" className="p-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-yellow-400">
                <path d="M12 2C7 2 4 6 4 11c0 4 2 7 5 9 0-2 1-3 3-3s3 1 3 3c3-2 5-5 5-9 0-5-3-9-8-9zm-3 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
              </svg>
            </Link>
            <Link to="/app/parties" className="p-2"><PartyPopper className="w-6 h-6 text-neutral-400" /></Link>
            <Link to="/app/chat" className="p-2"><Heart className="w-6 h-6 text-neutral-400" /></Link>
            <Link to="/app/chat" className="p-2"><MessageSquare className="w-6 h-6 text-neutral-400" /></Link>
            <Link to="/app/subscribe" className="p-2"><Crown className="w-6 h-6 text-yellow-400" /></Link>
            <Link to="/app/me" className="p-2"><User className="w-6 h-6 text-neutral-400" /></Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
