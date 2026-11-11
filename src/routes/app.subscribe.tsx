import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { TIERS, type Tier } from "@/lib/subscriptions";
import { ArrowLeft, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/app/subscribe")({ component: Subscribe });

function Subscribe() {
  const { user } = useAuth();
  const { tier: current } = useSubscription();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const choose = async (tier: Tier) => {
    if (!user) return;
    // Simulation: pas de paiement réel, on stocke juste le tier choisi
    const expires =
      tier === "day_pass"
        ? new Date(Date.now() + 24 * 3600 * 1000).toISOString()
        : tier === "free"
          ? null
          : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from("subscriptions").upsert(
      {
        user_id: user.id,
        tier,
        expires_at: expires,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Abonnement ${tier} activé (démo)`);
    qc.invalidateQueries({ queryKey: ["subscription", user.id] });
    navigate({ to: "/app/grid" });
  };

  return (
    <main className="min-h-screen bg-secondary/40 text-foreground">
      <div className="mx-auto max-w-5xl px-4 pt-7 pb-24 sm:px-6 sm:pt-12">
        <header className="rounded-3xl bg-[radial-gradient(ellipse_at_top_right,#7516ad,transparent_65%),linear-gradient(120deg,#1c0c39,#351366)] p-5 text-white sm:p-8">
          <Link
            to="/app/grid"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-semibold text-white/90 hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Découvrir
          </Link>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl sm:text-5xl">
            <Crown className="size-7 text-amber-300 sm:size-9" aria-hidden="true" /> Abonnements
          </h1>
          <p className="mt-3 text-sm text-white/85">
            Les offres sont en mode démo. Aucun paiement réel.
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t) => {
            const isCurrent = current === t.id;
            return (
              <div
                key={t.id}
                className={`flex flex-col rounded-3xl border p-5 ${
                  t.highlight
                    ? "border-violet-300 bg-linear-to-br from-white to-violet-100 shadow-[var(--shadow-neon)]"
                    : "border-border bg-card shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      {t.name}
                      {t.highlight && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          Populaire
                        </span>
                      )}
                    </h2>
                    <p className="mt-1 text-2xl font-bold">
                      {t.price}
                      <span className="text-sm font-normal text-muted-foreground">{t.period}</span>
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                      Actif
                    </span>
                  )}
                </div>
                <ul className="mb-5 grow space-y-2 text-sm">
                  <Feature ok>
                    {t.profileLimit === -1
                      ? "Profils illimités"
                      : `Jusqu'à ${t.profileLimit} profils`}
                  </Feature>
                  <Feature ok={t.filtersAdvanced}>Filtres avancés</Feature>
                  <Feature ok={t.noAds}>Sans publicité</Feature>
                  <Feature ok={t.icebreakersAI}>Icebreakers IA</Feature>
                  <Feature ok={t.incognito}>Mode invisible</Feature>
                  <Feature ok={t.watermark}>Filigrane anti-réutilisation sur tes photos 💧</Feature>
                </ul>

                <button
                  onClick={() => choose(t.id)}
                  disabled={isCurrent}
                  className={`neon-btn w-full ${t.highlight ? "" : "neon-btn-ghost"}`}
                >
                  {isCurrent ? "Activé" : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function Feature({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "" : "text-muted-foreground line-through"}`}>
      <Check
        className={`size-4 shrink-0 ${ok ? "text-primary" : "text-muted-foreground"}`}
        aria-hidden="true"
      />{" "}
      {children}
    </li>
  );
}
