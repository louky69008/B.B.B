import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SlidersHorizontal, Star, Droplet, Heart, MessageSquare, User } from "lucide-react";

export const Route = createFileRoute("/app/grid")({ component: Grid });

type Profile = {
  id: string;
  pseudo: string;
  age: number | null;
  photo_url: string | null;
  last_seen: string;
  hide_status: boolean;
};

function isOnline(p: Profile) {
  if (p.hide_status) return false;
  return (Date.now() - new Date(p.last_seen).getTime()) / 1000 < 60 * 5;
}

function Grid() {
  const { data } = useQuery({
    queryKey: ["profiles-grid"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, pseudo, age, photo_url, last_seen, hide_status")
        .order("last_seen", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data as Profile[];
    },
    refetchInterval: 30_000,
  });

  const pills = [
    { icon: SlidersHorizontal, label: null },
    { icon: Star, label: null },
    { icon: null, label: "En ligne", active: true },
    { icon: Droplet, label: "Right Now" },
    { icon: null, label: "Âge" },
  ];

  return (
    <main className="min-h-screen w-full flex justify-center bg-black">
      <div className="relative w-full max-w-[420px] min-h-screen bg-black pb-20">
        {/* Status bar */}
        <div className="flex justify-between items-center px-7 pt-3 pb-1 text-white text-[15px] font-semibold">
          <span>13:36</span>
          <span className="text-xs">●●● 📶 85</span>
        </div>
        <div className="flex justify-center -mt-1">
          <div className="w-28 h-7 bg-black rounded-full" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-3 py-3 overflow-x-auto no-scrollbar">
          {pills.map((p, i) => (
            <button
              key={i}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium border ${
                p.active
                  ? "bg-white text-black border-white"
                  : "bg-neutral-900 text-white border-neutral-700"
              }`}
            >
              {p.icon && <p.icon className="w-3.5 h-3.5" />}
              {p.label && <span>{p.label}</span>}
            </button>
          ))}
        </div>

        {/* Grid 3 cols, no gap */}
        <div className="grid grid-cols-3 gap-px bg-black">
          {data?.map((p) => {
            const online = isOnline(p);
            return (
              <Link
                key={p.id}
                to="/app/profile/$id"
                params={{ id: p.id }}
                className="relative aspect-square overflow-hidden bg-neutral-900"
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.pseudo} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex w-full h-full items-center justify-center bg-neutral-800">
                    <User className="w-16 h-16 text-neutral-600" />
                  </div>
                )}
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
                {/* Online dot + name */}
                <div className="absolute left-1.5 bottom-1.5 flex items-center gap-1.5">
                  {online && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  )}
                  <span className="text-white text-[11px] font-medium truncate max-w-[80px]">
                    {p.pseudo}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom tab bar — Grindr style */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-black border-t border-neutral-800 z-30"
        >
          <div className="flex justify-around items-center py-2 pb-6">
            <Link to="/app/grid" className="p-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-yellow-400">
                <path d="M12 2C7 2 4 6 4 11c0 4 2 7 5 9 0-2 1-3 3-3s3 1 3 3c3-2 5-5 5-9 0-5-3-9-8-9zm-3 9a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
              </svg>
            </Link>
            <button className="p-2">
              <Droplet className="w-6 h-6 text-neutral-400" />
            </button>
            <Link to="/app/chat" className="p-2 relative">
              <Heart className="w-6 h-6 text-neutral-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </Link>
            <Link to="/app/chat" className="p-2 relative">
              <MessageSquare className="w-6 h-6 text-neutral-400" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
