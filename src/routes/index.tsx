import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import heroJungle from "@/assets/hero-neon-jungle.jpg";
import heroNeon from "@/assets/hero-neon.jpg";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/app/grid" : "/auth";

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center px-4 py-6"
      style={{
        backgroundImage: `url(${heroJungle})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#0a0014",
      }}
    >
      <section className="relative w-full max-w-[440px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#12091f]/92 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="relative">
          <img
            src={heroNeon}
            alt="Kindly — illustration d'accueil"
            className="block w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12091f] via-[#12091f]/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/55">
              Kindly
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-[2.75rem]">
              Rencontres plus simples, soirées plus fluides.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/76 sm:text-base">
              Swipe, match, message et événements pour adultes consentants,
              avec un accès rapide ou vérifié selon le niveau souhaité.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                to={ctaTo}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 font-semibold text-black transition active:scale-[0.98]"
              >
                Commencer
              </Link>
              <Link
                to="/app/parties"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 font-semibold text-white transition active:scale-[0.98]"
              >
                Soirées
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-3 sm:p-6">
          <Feature
            title="Rapide"
            body="Inscription courte et navigation claire."
          />
          <Feature
            title="Safe"
            body="Filtres, profils vérifiés et modération renforcée."
          />
          <Feature
            title="Connecté"
            body="Messages, matches et événements au même endroit."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-white/68">{body}</p>
    </div>
  );
}
