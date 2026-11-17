import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { TIERS, type Tier } from "@/lib/subscriptions";
import { Check } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { PremiumFeatureCard } from "@/components/premium-feature-card";
import { revenueCatCheckoutUrl } from "@/lib/web-checkout";

const isCheckoutConfigured = createServerFn({ method: "GET" }).handler(() =>
  Boolean(
    process.env.REVENUECAT_WEBHOOK_SECRET &&
    process.env.REVENUECAT_PROJECT_ID &&
    process.env.REVENUECAT_SECRET_API_KEY &&
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
);

export const Route = createFileRoute("/app/subscribe")({
  loader: () => isCheckoutConfigured(),
  component: Subscribe,
});

const packages: Partial<Record<Tier, string>> = {
  basic_lite: import.meta.env.VITE_REVENUECAT_PACKAGE_BASIC_LITE,
  monthly: import.meta.env.VITE_REVENUECAT_PACKAGE_MONTHLY,
  premium: import.meta.env.VITE_REVENUECAT_PACKAGE_PREMIUM,
  ultra: import.meta.env.VITE_REVENUECAT_PACKAGE_ULTRA,
  day_pass: import.meta.env.VITE_REVENUECAT_PACKAGE_DAY_PASS,
};

function Subscribe() {
  const { user } = useAuth();
  const { tier: current } = useSubscription();
  const checkoutConfigured = Route.useLoaderData();
  const offers = TIERS.map((plan) => ({
    plan,
    checkout: checkoutConfigured
      ? revenueCatCheckoutUrl(
          import.meta.env.VITE_REVENUECAT_WEB_PURCHASE_LINK,
          user?.id,
          packages[plan.id],
        )
      : null,
  }));

  return (
    <main className="min-h-screen bg-secondary/40 text-foreground">
      <div className="mx-auto max-w-5xl px-4 pt-7 pb-24 sm:px-6 sm:pt-12">
        <h1 className="mb-5 font-display text-3xl sm:text-4xl">Abonnements</h1>
        <PremiumFeatureCard plansSection />
        <div id="plans" className="mt-6 scroll-mt-24">
          {offers.every(({ checkout }) => !checkout) && (
            <p className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-muted-foreground">
              Le paiement en ligne est actuellement indisponible.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map(({ plan: t, checkout }) => {
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
                        <span className="text-sm font-normal text-muted-foreground">
                          {t.period}
                        </span>
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
                    <Feature ok={t.icebreakersAI}>Icebreakers IA</Feature>
                    <Feature ok={t.id === "premium" || t.id === "ultra"}>Voir qui t’aime</Feature>
                    <Feature ok={t.watermark}>Filigrane sur tes photos</Feature>
                  </ul>

                  {checkout && !isCurrent ? (
                    <a
                      href={checkout}
                      className={`neon-btn w-full ${t.highlight ? "" : "neon-btn-ghost"}`}
                    >
                      Choisir {t.name}
                    </a>
                  ) : (
                    <button type="button" disabled className="neon-btn neon-btn-ghost w-full">
                      {isCurrent ? "Activé" : t.id === "free" ? "Offre gratuite" : "Indisponible"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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
