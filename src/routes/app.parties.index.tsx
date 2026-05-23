import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, MapPin, Users, Calendar, Euro } from "lucide-react";

export const Route = createFileRoute("/app/parties/")({ component: PartiesList });

type Party = {
  id: string;
  title: string;
  city: string;
  starts_at: string;
  max_participants: number;
  is_paid: boolean;
  price_cents: number | null;
  status: string;
  host_id: string;
};

function PartiesList() {
  const { data } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parties")
        .select("id, title, city, starts_at, max_participants, is_paid, price_cents, status, host_id")
        .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data as Party[];
    },
  });

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-24">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-bold flex-1">Soirée appart'</h1>
          <Link to="/app/parties/new"
            className="size-9 rounded-full bg-yellow-400 text-black flex items-center justify-center">
            <Plus className="size-5" />
          </Link>
        </header>

        <div className="px-4 pt-4">
          <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm text-yellow-100 leading-relaxed">
            Tu cherches une soirée appart entre potes rencontrés sur tes réseaux sociaux favoris ou alors de nouvelles rencontres à te faire alors tu es au bon endroit pour <span className="font-bold text-yellow-300">"UN AFTER … D'AFTER !!!!"</span> Trouve la soirée qui va te faire kiffer que ce soit à 3, 4 ….. tout peut arriver
          </div>
        </div>

        <div className="p-4 space-y-3">
          {data?.length === 0 && (
            <div className="text-center text-neutral-500 mt-12">
              <p>Aucune soirée appart' à venir.</p>
              <p className="text-sm mt-2">Sois le premier à en organiser une !</p>
            </div>
          )}
          {data?.map((p) => (
            <Link key={p.id} to="/app/parties/$id" params={{ id: p.id }}
              className="block rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold text-base">{p.title}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  p.status === "open" ? "bg-emerald-500/20 text-emerald-300" :
                  p.status === "full" ? "bg-orange-500/20 text-orange-300" :
                  "bg-neutral-700 text-neutral-300"
                }`}>
                  {p.status === "open" ? "Ouvert" : p.status === "full" ? "Complet" : "Terminé"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><Calendar className="size-3" />
                  {new Date(p.starts_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <span className="flex items-center gap-1"><MapPin className="size-3" />{p.city}</span>
                <span className="flex items-center gap-1"><Users className="size-3" />{p.max_participants} max</span>
                {p.is_paid && p.price_cents && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Euro className="size-3" />{(p.price_cents / 100).toFixed(2)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    <BottomNav />
    </main>
  );
}
