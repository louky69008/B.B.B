import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Heart, Shield, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t } = useI18n();

  const plans = [
    { name: t("plan_free"), price: t("plan_free_price"), desc: t("plan_free_desc"), highlight: false },
    { name: t("plan_basic"), price: t("plan_basic_price"), desc: t("plan_basic_desc"), highlight: false },
    { name: t("plan_premium"), price: t("plan_premium_price"), desc: t("plan_premium_desc"), highlight: true },
    { name: t("plan_ultra"), price: t("plan_ultra_price"), desc: t("plan_ultra_desc"), highlight: false },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* glows */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 500px at 80% -10%, rgba(255,45,146,0.28), transparent 60%), radial-gradient(700px 400px at 0% 50%, rgba(0,240,255,0.2), transparent 60%)",
          }}
        />
        <div className="neon-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-28">
          <span className="neon-tag">{t("no_shareholders")}</span>

          <h1 className="mt-8 text-[clamp(48px,8vw,108px)] font-bold leading-[0.92] tracking-[-0.04em]">
            {t("landing_hero").split(" ").map((word, i, arr) => {
              if (i === 1) return <span key={i} className="text-[color:var(--neon-magenta)] neon-glow-magenta">{word} </span>;
              if (i === arr.length - 1) return <span key={i} className="neon-underline">{word}</span>;
              return <span key={i}>{word} </span>;
            })}
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#cfc8e8]">
            {t("landing_sub")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/auth" className="neon-btn">
              <Heart className="size-4" fill="currentColor" /> {t("cta_join")}
              <ArrowRight className="size-4" />
            </Link>
            <Link to="/auth" className="neon-btn neon-btn-ghost">
              {t("cta_login")}
            </Link>
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-[#9b94bf]">
            {t("tagline")}
          </p>

          {/* stats strip */}
          <div className="mt-20 grid grid-cols-2 border border-white/10 md:grid-cols-4">
            {[
              { n: "100%", l: "Open & transparent" },
              { n: "0", l: "Investisseurs" },
              { n: "3 mois", l: "Préavis prix" },
              { n: "24/7", l: "Modération humaine" },
            ].map((s, i) => (
              <div key={i} className="border-b border-r border-white/10 p-6 last:border-r-0 md:border-b-0">
                <div className="text-3xl font-bold tracking-tight">{s.n}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#9b94bf]">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between gap-6 flex-wrap">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--neon-cyan)]">
                // 02 — Pricing
              </span>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">{t("pricing_title")}</h2>
            </div>
            <p className="max-w-sm text-sm text-[#9b94bf]">
              Pas de paywall caché. Tu paies ce que tu vois, on te prévient 3 mois avant tout changement.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-4">
            {plans.map((p, i) => (
              <div
                key={p.name}
                className={`relative border border-white/10 p-7 transition-colors md:-ml-px ${
                  p.highlight
                    ? "bg-[color:var(--neon-magenta)]/10 border-[color:var(--neon-magenta)]"
                    : "bg-white/[0.02] hover:border-[color:var(--neon-cyan)]"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 bg-[color:var(--neon-lime)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-black">
                    Recommandé
                  </span>
                )}
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#9b94bf]">0{i + 1}</div>
                <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
                <p className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--neon-magenta)]">{p.price}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#cfc8e8]">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-[#9b94bf]">
            <Shield className="size-4 text-[color:var(--neon-cyan)]" />
            Nos prix ne changent pas sans préavis de 3 mois.
          </div>
        </div>
      </section>
    </main>
  );
}
