import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { TIERS, type Tier } from "@/lib/subscriptions";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/subscribe")({ component: Subscribe });

function Subscribe() {
  const { user } = useAuth();
  const { tier: current } = useSubscription();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const choose = async (tier: Tier) => {
    if (!user) return;
    // Simulation: pas de paiement réel, on stocke juste le tier choisi
    const expires = tier === "day_pass"
      ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
      : tier === "free" ? null
      : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from("subscriptions").upsert({
      user_id: user.id, tier, expires_at: expires, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (error) { toast.error(error.message); return; }
    toast.success(`Abonnement ${tier} activé (démo)`);
    qc.invalidateQueries({ queryKey: ["subscription", user.id] });
    navigate({ to: "/app/grid" });
  };

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[420px] pb-12">
        <header className="flex items-center gap-3 px-3 py-3 border-b border-neutral-800 sticky top-0 bg-black/95 backdrop-blur z-10">
          <Link to="/app/grid" className="p-1"><ArrowLeft className="size-5" /></Link>
          <h1 className="text-lg font-bold flex items-center gap-2"><Crown className="size-5 text-yellow-400" /> Abonnements</h1>
        </header>

        <div className="px-3 pt-4 space-y-3">
          <p className="text-xs text-neutral-500 text-center">
            ⚠️ Mode démo — paiement réel à brancher plus tard
          </p>
          {TIERS.map((t) => {
            const isCurrent = current === t.id;
            return (
              <div key={t.id}
                className={`rounded-2xl p-4 border ${
                  t.highlight ? "border-yellow-400 bg-gradient-to-br from-yellow-400/15 to-pink-500/10"
                  : "border-neutral-800 bg-neutral-950"
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      {t.name}
                      {t.highlight && <span className="text-[10px] uppercase tracking-wider bg-yellow-400 text-black px-2 py-0.5 rounded-full">Populaire</span>}
                    </h2>
                    <p className="text-2xl font-bold mt-1">{t.price}<span className="text-sm text-neutral-400 font-normal">{t.period}</span></p>
                  </div>
                  {isCurrent && <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">Actif</span>}
                </div>
                <ul className="text-sm space-y-1 text-neutral-300">
                  <Feature ok>{t.profileLimit === -1 ? "Profils illimités" : `Jusqu'à ${t.profileLimit} profils`}</Feature>
                  <Feature ok={t.filtersAdvanced}>Filtres avancés</Feature>
                  <Feature ok={t.noAds}>Sans publicité</Feature>
                  <Feature ok={t.icebreakersAI}>Icebreakers IA</Feature>
                  <Feature ok={t.incognito}>Mode invisible</Feature>
                </ul>
                <button onClick={() => choose(t.id)} disabled={isCurrent}
                  className={`mt-3 w-full h-11 rounded-full font-bold ${
                    isCurrent ? "bg-neutral-800 text-neutral-500"
                    : t.highlight ? "bg-yellow-400 text-black"
                    : "bg-white text-black"
                  }`}>
                  {isCurrent ? "Activé" : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Feature({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "" : "text-neutral-600 line-through"}`}>
      <Check className={`size-4 ${ok ? "text-green-400" : "text-neutral-700"}`} /> {children}
    </li>
  );
}
