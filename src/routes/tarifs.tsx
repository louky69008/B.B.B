import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const URL = "https://connect-kindly-61.lovable.app/tarifs";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — B.B.B & cie" },
      { name: "description", content: "5 abonnements : Basic Lite, Basic Mensuel, Premium, Ultra et Pass 24h. Choisis le plan qui te correspond sur B.B.B & cie." },
      { property: "og:title", content: "Tarifs — B.B.B & cie" },
      { property: "og:description", content: "5 abonnements : Basic Lite, Basic Mensuel, Premium, Ultra et Pass 24h." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Basic Lite",
    price: "4,99 €",
    period: "/ mois",
    features: ["Jusqu'à 100 profils / mois", "Sans publicité", "Swipe & match", "Chat"],
    cta: "Choisir Basic Lite",
    accent: false,
  },
  {
    name: "Basic Mensuel",
    price: "12,99 €",
    period: "/ mois",
    features: ["Jusqu'à 300 profils / mois", "Sans publicité", "Filtres avancés", "Icebreakers IA", "Mise en avant"],
    cta: "Choisir Mensuel",
    accent: true,
  },
  {
    name: "Premium",
    price: "19,99 €",
    period: "/ mois",
    features: ["Jusqu'à 600 profils / mois", "Sans publicité", "Filtres avancés", "Icebreakers IA", "Mode invisible"],
    cta: "Passer Premium",
    accent: false,
  },
  {
    name: "Ultra",
    price: "29,99 €",
    period: "/ mois",
    features: ["Profils illimités", "Sans publicité", "Filtres avancés", "Icebreakers IA", "Mode invisible", "Filigrane anti-réutilisation"],
    cta: "Devenir Ultra",
    accent: false,
  },
  {
    name: "Pass 24h",
    price: "2,99 €",
    period: "/ 24h",
    features: ["Jusqu'à 200 profils sur 24h", "Sans publicité", "Filtres avancés", "Icebreakers IA", "Accès 24h non renouvelable"],
    cta: "Acheter 24h",
    accent: false,
  },
];

function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta text-center">
        Tarifs
      </h1>
      <p className="mt-4 text-center text-[#bdb7d8]">
        5 formules pour matcher à ton rythme.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`p-6 border ${p.accent ? "border-[color:var(--neon-magenta)] bg-[color:var(--neon-magenta)]/5" : "border-white/10 bg-white/[0.02]"}`}
          >
            <h2 className="font-display text-xl uppercase tracking-wide">{p.name}</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-sm text-[#9b94bf]">{p.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#bdb7d8]">
                  <Check className="size-4 mt-0.5 text-[color:var(--neon-lime)] flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/auth"
              className={p.accent ? "neon-btn mt-8 w-full justify-center" : "neon-btn neon-btn-ghost mt-8 w-full justify-center"}
            >
              {p.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-[#9b94bf]">
        Sans engagement · Résiliable à tout moment · Paiement sécurisé
      </p>
    </main>
  );
}
