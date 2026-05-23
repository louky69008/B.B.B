import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t } = useI18n();

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-6">
      {/* fond profond + halos doux */}
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "radial-gradient(900px 600px at 80% 10%, rgba(255,45,146,0.28), transparent 65%), radial-gradient(800px 500px at 10% 30%, rgba(0,240,255,0.22), transparent 65%)",
        }}
      />

      {/* TOP BAR — Kindly + nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between pb-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="text-xl"
            style={{ color: "var(--neon-magenta)", textShadow: "0 0 12px rgba(255,45,146,0.9)" }}
          >
            ♥
          </span>
          <span
            className="font-display text-lg font-black uppercase tracking-wide text-[color:var(--neon-magenta)]"
            style={{ textShadow: "0 0 10px rgba(255,45,146,0.7)" }}
          >
            Kindly
          </span>
        </Link>
        <nav className="flex items-center gap-5">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--neon-cyan)]">
            Description
          </span>
          <Link
            to="/auth"
            className="font-display px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--neon-cyan)]"
            style={{
              border: "2px solid var(--neon-magenta)",
              boxShadow: "0 0 14px rgba(255,45,146,0.5)",
              textShadow: "0 0 8px rgba(0,240,255,0.8)",
            }}
          >
            S'inscrire
          </Link>
        </nav>
      </header>

      {/* HERO encadré */}
      <section
        className="relative mx-auto max-w-6xl px-8 pt-10 pb-16"
        style={{
          border: "1px solid rgba(0,240,255,0.25)",
          background: "rgba(8,4,20,0.45)",
          boxShadow: "0 0 40px rgba(0,240,255,0.08), inset 0 0 60px rgba(13,8,28,0.6)",
        }}
      >
        {/* Petite nav haut-droite (Acceuil / Connexion) */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--neon-cyan)]">
            Accueil
          </span>
          <Link
            to="/auth"
            className="font-display px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--neon-magenta)]"
            style={{
              border: "2px solid var(--neon-magenta)",
              boxShadow: "0 0 12px rgba(255,45,146,0.5)",
              textShadow: "0 0 6px rgba(255,45,146,0.7)",
            }}
          >
            Connexion
          </Link>
        </div>

        {/* Cercle néon avec signature cursive */}
        <div className="mx-auto mt-6 mb-10 flex items-center justify-center">
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 380,
              height: 380,
              border: "2px solid var(--neon-magenta)",
              boxShadow:
                "0 0 50px rgba(255,45,146,0.65), 0 0 100px rgba(255,45,146,0.25), inset 0 0 50px rgba(255,45,146,0.15)",
            }}
          >
            <div
              className="absolute inset-6 rounded-full"
              style={{
                border: "2px solid var(--neon-cyan)",
                boxShadow:
                  "0 0 35px rgba(0,240,255,0.55), inset 0 0 25px rgba(0,240,255,0.18)",
              }}
            />
            {/* signature cursive Neon */}
            <h1
              className="relative select-none"
              style={{
                fontFamily: "var(--font-script)",
                fontSize: "150px",
                lineHeight: 1,
                background:
                  "linear-gradient(90deg, var(--neon-cyan) 0%, #ffffff 45%, var(--neon-magenta) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter:
                  "drop-shadow(0 0 12px rgba(0,240,255,0.8)) drop-shadow(0 0 24px rgba(255,45,146,0.7))",
                transform: "rotate(-6deg)",
              }}
            >
              Neon
            </h1>
          </div>
        </div>

        {/* Tagline magenta */}
        <p
          className="text-center font-display text-2xl uppercase tracking-[0.35em] text-[color:var(--neon-magenta)]"
          style={{ textShadow: "0 0 16px rgba(255,45,146,0.8), 0 0 32px rgba(255,45,146,0.4)" }}
        >
          Connect. Match. Dance.
        </p>

        {/* Sous-titre */}
        <p className="mx-auto mt-8 max-w-md text-center font-mono text-sm leading-relaxed text-[#cfc8e8]">
          {t("landing_sub")}
        </p>

        {/* CTA Enter the club */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/auth"
            className="font-display inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-[0.28em] text-[color:var(--neon-cyan)]"
            style={{
              border: "2px solid var(--neon-magenta)",
              boxShadow: "0 0 22px rgba(255,45,146,0.6), inset 0 0 18px rgba(255,45,146,0.15)",
              textShadow: "0 0 10px rgba(0,240,255,0.9), 0 0 22px rgba(0,240,255,0.5)",
            }}
          >
            → Enter the club
          </Link>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#888]">
          {t("tagline")}
        </p>
      </section>

      {/* Deux cartes basses */}
      <section className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
        {/* Carte gauche — LIBRE TOUS en cursive néon cyan */}
        <div
          className="relative flex h-56 items-center justify-center"
          style={{
            border: "1px solid rgba(0,240,255,0.25)",
            background: "rgba(8,4,20,0.45)",
          }}
        >
          {/* coins violets */}
          <span className="absolute left-3 top-3 h-6 w-6" style={{ borderTop: "2px solid #a855f7", borderLeft: "2px solid #a855f7" }} />
          <span className="absolute right-3 bottom-3 h-6 w-6" style={{ borderBottom: "2px solid #a855f7", borderRight: "2px solid #a855f7" }} />
          <h2
            className="select-none text-center"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "82px",
              lineHeight: 0.9,
              color: "var(--neon-cyan)",
              textShadow:
                "0 0 14px rgba(0,240,255,0.9), 0 0 28px rgba(0,240,255,0.6), 0 0 56px rgba(0,240,255,0.35)",
              transform: "rotate(-3deg)",
            }}
          >
            Libre. Tous.
          </h2>
        </div>

        {/* Carte droite — 3 boutons néon magenta empilés */}
        <div
          className="relative flex h-56 items-center justify-center gap-6"
          style={{
            border: "1px solid rgba(0,240,255,0.25)",
            background: "rgba(8,4,20,0.45)",
          }}
        >
          <Link
            to="/auth"
            className="font-display px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--neon-magenta)]"
            style={{
              border: "2px solid var(--neon-magenta)",
              boxShadow: "0 0 16px rgba(255,45,146,0.6)",
              textShadow: "0 0 8px rgba(255,45,146,0.8)",
            }}
          >
            Contact
          </Link>
          <div className="flex flex-col gap-3">
            <Link
              to="/auth"
              className="font-display px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--neon-magenta)] text-center"
              style={{
                border: "2px solid var(--neon-magenta)",
                boxShadow: "0 0 16px rgba(255,45,146,0.6)",
                textShadow: "0 0 8px rgba(255,45,146,0.8)",
              }}
            >
              Nous
            </Link>
            <Link
              to="/auth"
              className="font-display px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[color:var(--neon-magenta)] text-center"
              style={{
                border: "2px solid var(--neon-magenta)",
                boxShadow: "0 0 16px rgba(255,45,146,0.6)",
                textShadow: "0 0 8px rgba(255,45,146,0.8)",
              }}
            >
              Rejoindre
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="mx-auto mt-16 max-w-6xl px-2 pb-20">
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
              className="relative p-6"
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
      </section>
    </main>
  );
}
