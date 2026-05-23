import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t } = useI18n();

  return (
    <main className="relative overflow-hidden">
      {/* fond profond + halos doux */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(900px 600px at 80% 10%, rgba(255,45,146,0.28), transparent 65%), radial-gradient(800px 500px at 10% 30%, rgba(0,240,255,0.22), transparent 65%)",
        }}
      />
      {/* perspective floor lines */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10"
        style={{
          height: "55vh",
          background:
            "linear-gradient(transparent, rgba(0,240,255,0.04)), repeating-linear-gradient(0deg, transparent 0, transparent 60px, rgba(0,240,255,0.08) 60px, rgba(0,240,255,0.08) 61px)",
          maskImage: "linear-gradient(transparent, black)",
          transform: "perspective(800px) rotateX(60deg)",
          transformOrigin: "bottom",
        }}
      />

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center">
        <div className="relative z-10 mx-auto max-w-2xl px-6 text-center py-20">

          {/* Cercle néon avec logo */}
          <div className="mx-auto mb-12 flex items-center justify-center">
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 360, height: 360,
                border: "2px solid var(--neon-magenta)",
                boxShadow:
                  "0 0 40px rgba(255,45,146,0.6), 0 0 80px rgba(255,45,146,0.25), inset 0 0 40px rgba(255,45,146,0.15)",
              }}
            >
              <div
                className="absolute inset-5 rounded-full"
                style={{
                  border: "2px solid var(--neon-cyan)",
                  boxShadow: "0 0 30px rgba(0,240,255,0.5), inset 0 0 20px rgba(0,240,255,0.15)",
                }}
              />
              <h1
                className="font-display text-6xl font-black uppercase tracking-[0.02em] text-[color:var(--neon-magenta)]"
                style={{
                  textShadow:
                    "0 0 8px rgba(255,45,146,0.9), 0 0 24px rgba(255,45,146,0.7), 0 0 48px rgba(255,45,146,0.4)",
                }}
              >
                {t("app_name")}
              </h1>
            </div>
          </div>

          {/* Tagline lime */}
          <p
            className="font-display text-2xl uppercase tracking-[0.35em] text-[color:var(--neon-lime)]"
            style={{ textShadow: "0 0 16px rgba(198,255,61,0.7), 0 0 32px rgba(198,255,61,0.3)" }}
          >
            Connect. Match. Dance.
          </p>

          {/* Sous-titre */}
          <p className="mx-auto mt-10 max-w-md font-mono text-sm leading-relaxed text-[#cfc8e8]">
            {t("landing_sub")}
          </p>

          {/* CTA outline néon */}
          <div className="mt-12 flex justify-center">
            <Link
              to="/auth"
              className="font-display inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-[0.25em] text-[color:var(--neon-cyan)] transition-all"
              style={{
                border: "2px solid var(--neon-magenta)",
                boxShadow:
                  "0 0 20px rgba(255,45,146,0.6), inset 0 0 20px rgba(255,45,146,0.15)",
                textShadow: "0 0 10px rgba(0,240,255,0.9), 0 0 20px rgba(0,240,255,0.5)",
              }}
            >
              → Enter the club
            </Link>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[#888]">
            {t("tagline")}
          </p>
        </div>
      </section>

      {/* PRICING — sobre */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--neon-cyan)]">
              // access tiers
            </span>
            <h2 className="font-display mt-4 text-4xl font-black uppercase tracking-tight">
              {t("pricing_title")}
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {[
              { name: t("plan_free"), price: t("plan_free_price"), desc: t("plan_free_desc"), highlight: false },
              { name: t("plan_basic"), price: t("plan_basic_price"), desc: t("plan_basic_desc"), highlight: false },
              { name: t("plan_premium"), price: t("plan_premium_price"), desc: t("plan_premium_desc"), highlight: true },
              { name: t("plan_ultra"), price: t("plan_ultra_price"), desc: t("plan_ultra_desc"), highlight: false },
            ].map((p, i) => (
              <div
                key={p.name}
                className="relative p-6 transition-all"
                style={{
                  border: `2px solid ${p.highlight ? "var(--neon-magenta)" : "rgba(0,240,255,0.35)"}`,
                  boxShadow: p.highlight
                    ? "0 0 24px rgba(255,45,146,0.5), inset 0 0 16px rgba(255,45,146,0.1)"
                    : "0 0 16px rgba(0,240,255,0.2), inset 0 0 12px rgba(0,240,255,0.05)",
                  background: "rgba(13,8,28,0.4)",
                }}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#888]">0{i + 1} / 04</div>
                <h3 className="font-display mt-3 text-lg font-bold uppercase tracking-wide">{p.name}</h3>
                <p
                  className="font-display mt-5 text-3xl font-black tracking-tight text-[color:var(--neon-magenta)]"
                  style={{ textShadow: "0 0 18px rgba(255,45,146,0.6)" }}
                >
                  {p.price}
                </p>
                <p className="mt-4 font-mono text-xs leading-relaxed text-[#cfc8e8]">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#888]">
            ◆ Pas de hausse de prix sans préavis 3 mois ◆
          </p>
        </div>
      </section>
    </main>
  );
}
