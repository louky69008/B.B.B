import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const URL = "https://connect-kindly-61.lovable.app/tarifs";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — B.B.B & cie" },
      { name: "description", content: "Gratuit pour toujours, ou Premium pour matchs illimités, badge vérifié et accès soirées privées. Tous les tarifs B.B.B & cie." },
      { property: "og:title", content: "Tarifs — B.B.B & cie" },
      { property: "og:description", content: "Gratuit ou Premium : choisis ton accès." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    features: ["Profil basique", "Swipe & match limité", "Accès soirées appart'", "Chat à 10 messages/j"],
    cta: "Commencer",
    accent: false,
  },
  {
    name: "Premium",
    price: "9,99€",
    period: "/ mois",
    features: ["Matchs illimités", "Messages illimités", "Badge vérifié KYC", "Soirées privées", "Voir qui vous a liké", "Boost hebdomadaire"],
    cta: "Passer Premium",
    accent: true,
  },
  {
    name: "Ultra",
    price: "19,99€",
    period: "/ mois",
    features: ["Tout Premium", "Mode incognito", "Filtres avancés", "Support prioritaire", "Accès soirées VIP"],
    cta: "Devenir Ultra",
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
        Gratuit pour toujours. Premium pour aller plus loin.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
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
