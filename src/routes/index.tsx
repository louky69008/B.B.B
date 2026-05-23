import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t } = useI18n();

  return (
    <main className="relative overflow-hidden">
      {/* halos globaux derrière toute la page */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(900px 600px at 80% 10%, rgba(255,45,146,0.35), transparent 60%), radial-gradient(800px 500px at 10% 30%, rgba(0,240,255,0.25), transparent 60%), radial-gradient(700px 500px at 50% 90%, rgba(198,255,61,0.12), transparent 60%)",
        }}
      />
      {/* HERO — cercle néon central, halo cyan, particules */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">

        {/* grille néon */}
        <div className="neon-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />

        {/* halo magenta central */}
        <div
          className="neon-halo -z-10"
          style={{ width: 600, height: 600, top: "10%", left: "50%", transform: "translateX(-50%)" }}
        />
        {/* halo cyan diffus */}
        <div
          className="neon-halo -z-10"
          style={{
            width: 800, height: 800, top: "5%", left: "50%", transform: "translateX(-50%)",
            background: "radial-gradient(circle, var(--neon-cyan) 0%, transparent 65%)",
            opacity: 0.25, filter: "blur(60px)",
          }}
        />

        {/* particules stroboscope */}
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="particle pointer-events-none absolute -z-10 rounded-full"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? "var(--neon-lime)" : i % 3 === 1 ? "var(--neon-cyan)" : "var(--neon-magenta)",
              boxShadow: `0 0 8px currentColor`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <span className="neon-tag mx-auto">{t("no_shareholders")}</span>

          {/* cercle néon avec logo */}
          <div className="mx-auto mt-12 mb-10 flex items-center justify-center">
            <div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 320, height: 320,
                border: "2px solid var(--neon-magenta)",
                boxShadow: "0 0 60px rgba(255,0,160,0.6), inset 0 0 60px rgba(255,0,160,0.2)",
              }}
            >
              <div
                className="absolute inset-6 rounded-full"
                style={{ border: "1px solid var(--neon-cyan)", boxShadow: "0 0 30px rgba(0,229,255,0.4)" }}
              />
              <h1 className="font-display text-5xl font-black uppercase tracking-[0.05em] neon-glow-magenta text-[color:var(--neon-magenta)]">
                {t("app_name")}
              </h1>
            </div>
          </div>

          <p className="font-display text-lg uppercase tracking-[0.3em] text-[color:var(--neon-lime)] neon-glow-lime">
            Connect. Match. Dance.
          </p>

          <p className="mx-auto mt-8 max-w-md font-mono text-sm leading-relaxed text-[#A0A0A0]">
            {t("landing_sub")}
          </p>

          <div className="mt-12 flex justify-center">
            <Link to="/auth" className="neon-btn">
              → Enter the club
            </Link>
          </div>

          <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-[#666]">
            {t("tagline")}
          </p>
        </div>
      </section>

      {/* STATS strip brutalist */}
      <section className="border-y border-white/10 bg-black/40">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4">
          {[
            { n: "100%", l: "Open source" },
            { n: "0", l: "Investors" },
            { n: "24/7", l: "Human mod" },
            { n: "∞", l: "Genders" },
          ].map((s, i) => (
            <div key={i} className="border-r border-white/10 p-8 last:border-r-0">
              <div className="font-display text-4xl font-black tracking-tight text-[color:var(--neon-cyan)] neon-glow-cyan">{s.n}</div>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#888]">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING brutalist */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--neon-cyan)]">
              // 02 — Access tiers
            </span>
            <h2 className="font-display mt-4 text-5xl font-black uppercase tracking-tight">
              {t("pricing_title")}
            </h2>
          </div>

          <div className="grid gap-0 md:grid-cols-4">
            {[
              { name: t("plan_free"), price: t("plan_free_price"), desc: t("plan_free_desc"), highlight: false },
              { name: t("plan_basic"), price: t("plan_basic_price"), desc: t("plan_basic_desc"), highlight: false },
              { name: t("plan_premium"), price: t("plan_premium_price"), desc: t("plan_premium_desc"), highlight: true },
              { name: t("plan_ultra"), price: t("plan_ultra_price"), desc: t("plan_ultra_desc"), highlight: false },
            ].map((p, i) => (
              <div
                key={p.name}
                className={`relative border border-white/10 p-7 md:-ml-px transition-all ${
                  p.highlight
                    ? "bg-[color:var(--neon-magenta)]/10 border-[color:var(--neon-magenta)]"
                    : "bg-white/[0.02] hover:border-[color:var(--neon-cyan)] hover:bg-[color:var(--neon-cyan)]/5"
                }`}
                style={p.highlight ? { boxShadow: "0 0 32px rgba(255,0,160,0.25)" } : undefined}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-6 bg-[color:var(--neon-lime)] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black">
                    ★ TOP
                  </span>
                )}
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#666]">0{i + 1} / 04</div>
                <h3 className="font-display mt-3 text-lg font-bold uppercase tracking-wide">{p.name}</h3>
                <p className="font-display mt-5 text-3xl font-black tracking-tight text-[color:var(--neon-magenta)] neon-glow-magenta">{p.price}</p>
                <p className="mt-5 font-mono text-xs leading-relaxed text-[#A0A0A0]">{p.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#666]">
            ◆ Pas de hausse de prix sans préavis 3 mois ◆
          </p>
        </div>
      </section>
    </main>
  );
}
