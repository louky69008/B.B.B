import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCityStats } from "@/lib/cities.functions";
import { findCity } from "@/lib/cities";
import { MapPin, MessageCircle, PartyPopper, ShieldCheck } from "lucide-react";

const cityOpts = (slug: string) =>
  queryOptions({
    queryKey: ["city-stats", slug],
    queryFn: () => getCityStats({ data: { slug } }),
  });

export const Route = createFileRoute("/villes/$city")({
  loader: async ({ params, context }) => {
    if (!findCity(params.city)) throw notFound();
    await context.queryClient.ensureQueryData(cityOpts(params.city));
  },
  head: ({ params }) => {
    const c = findCity(params.city);
    const name = c?.name ?? params.city;
    const title = `Rencontres à ${name} — gay, trans, bi | B.B.B & cie`;
    const description = `Découvre des profils gays, trans et queer à ${name}. Chat, match et soirées appart' à ${name} et alentours. Communauté safe, langage explicite OK, aucune nudité publique.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/villes/${params.city}` },
      ],
      links: [{ rel: "canonical", href: `/villes/${params.city}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "/" },
              { "@type": "ListItem", position: 2, name: "Villes", item: "/villes" },
              { "@type": "ListItem", position: 3, name, item: `/villes/${params.city}` },
            ],
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Ville introuvable</h1>
        <Link to="/villes" className="mt-4 inline-block text-yellow-400 underline">
          Voir toutes les villes
        </Link>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <p className="text-sm text-neutral-400">{error.message}</p>
    </main>
  ),
  component: CityPage,
});

function CityPage() {
  const { city: slug } = Route.useParams();
  const { data } = useSuspenseQuery(cityOpts(slug));
  if (!data.city) return null;
  const { city, count, sample } = data;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <nav className="text-xs text-neutral-400">
          <Link to="/" className="hover:text-white">Accueil</Link>
          <span className="mx-1">›</span>
          <Link to="/villes" className="hover:text-white">Villes</Link>
          <span className="mx-1">›</span>
          <span className="text-white">{city.name}</span>
        </nav>

        <header className="mt-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-yellow-400">
            <MapPin className="size-3.5" /> {city.region}
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Rencontres à {city.name}
          </h1>
          <p className="mt-3 text-neutral-300">
            {count > 0 ? (
              <>
                <strong>{count}</strong>{" "}
                {count > 1 ? "profils sont actifs" : "profil est actif"} à {city.name} sur B.B.B &
                cie.
              </>
            ) : (
              <>Sois l'un·e des premier·ères à rejoindre la communauté à {city.name}.</>
            )}{" "}
            Communauté gay, trans-friendly et queer. Langage explicite autorisé, aucune nudité
            publique.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/auth"
              className="rounded-full bg-yellow-400 px-5 py-2.5 text-sm font-bold text-black"
            >
              Rejoindre {city.name}
            </Link>
            <Link
              to="/app/parties"
              className="rounded-full border border-neutral-700 bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Soirées appart' à {city.name}
            </Link>
          </div>
        </header>

        {/* Aperçu profils — photos toujours floutées en public */}
        {sample.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Aperçu des profils à {city.name}</h2>
            <p className="mt-1 text-xs text-neutral-500">
              Photos floutées par défaut. Crée un compte pour voir les profils en clair.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {sample.map((p, i) => (
                <div
                  key={`${p.pseudo}-${i}`}
                  className="relative aspect-square overflow-hidden rounded-xl bg-neutral-900"
                >
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={`Profil à ${city.name}`}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-full object-cover select-none pointer-events-none"
                      style={{ filter: "blur(18px) brightness(0.75) saturate(1.1)" }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/10" />
                  <div className="absolute bottom-1.5 left-2 right-2 truncate text-[11px] font-semibold text-white/90">
                    {p.pseudo}
                    {p.age ? `, ${p.age}` : ""}
                  </div>
                  <span className="absolute top-1.5 right-1.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-white/80">
                    Flouté
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/auth"
              className="mt-4 inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Voir les profils en clair →
            </Link>
          </section>
        )}

        <section className="mt-12 grid gap-3 sm:grid-cols-3">
          <Feature
            icon={<MessageCircle className="size-5 text-yellow-400" />}
            title={`Chat à ${city.name}`}
            text={`Discute en direct avec la communauté de ${city.name}.`}
          />
          <Feature
            icon={<PartyPopper className="size-5 text-pink-400" />}
            title="Soirée appart'"
            text={`Trouve ou organise une soirée privée à ${city.name}, gratuit et sans inscription.`}
          />
          <Feature
            icon={<ShieldCheck className="size-5 text-emerald-400" />}
            title="Safe & modéré"
            text="Modération active, blocage, signalement et accès strictement 18+."
          />
        </section>

        <section className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-lg font-semibold">À propos des rencontres à {city.name}</h2>
          <p className="mt-2 text-sm text-neutral-300">
            B.B.B & cie est une application de rencontres entre adultes consentants, pensée pour la
            communauté gay, trans et queer. À {city.name} comme ailleurs, on parle cash sans tabou,
            mais <strong>aucune nudité n'est tolérée en accès public</strong>. Les photos sont
            floutées par défaut tant que tu n'as pas créé de compte.
          </p>
          <p className="mt-3 text-sm text-neutral-300">
            Tu peux aussi explorer les villes proches&nbsp;: {" "}
            <Link to="/villes" className="text-yellow-400 underline">
              voir toutes les villes
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center gap-2">{icon}<h3 className="font-semibold">{title}</h3></div>
      <p className="mt-1.5 text-sm text-neutral-400">{text}</p>
    </div>
  );
}
