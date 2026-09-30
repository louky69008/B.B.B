import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCitiesIndex } from "@/lib/cities.functions";
import { MapPin } from "lucide-react";

const indexOpts = queryOptions({
  queryKey: ["cities-index"],
  queryFn: () => getCitiesIndex(),
});

export const Route = createFileRoute("/villes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(indexOpts),
  head: () => ({
    meta: [
      { title: "Rencontres par ville — B.B.B & cie" },
      {
        name: "description",
        content:
          "Trouve des profils gays, trans, bi près de chez toi. B.B.B & cie est présent dans toutes les grandes villes de France : Paris, Marseille, Lyon, Toulouse, Bordeaux, Lille…",
      },
      { property: "og:title", content: "Rencontres par ville — B.B.B & cie" },
      {
        property: "og:description",
        content:
          "Communauté queer dans toute la France. Choisis ta ville et découvre les profils autour de toi.",
      },
      { property: "og:url", content: "/villes" },
    ],
    links: [{ rel: "canonical", href: "/villes" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "/" },
            { "@type": "ListItem", position: 2, name: "Villes", item: "/villes" },
          ],
        }),
      },
    ],
  }),
  component: CitiesIndex,
});

function CitiesIndex() {
  const { data: cities } = useSuspenseQuery(indexOpts);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs uppercase tracking-widest text-yellow-400">SEO local</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Rencontres par ville en France</h1>
        <p className="mt-3 text-neutral-300">
          B.B.B & cie réunit une communauté gay, trans-friendly et queer dans toute la France.
          Choisis ta ville pour découvrir les profils autour de toi.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                to="/villes/$city"
                params={{ city: c.slug }}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 transition hover:border-yellow-400/60 hover:bg-neutral-900"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="size-4 text-yellow-400" />
                  <span className="font-medium">{c.name}</span>
                </span>
                {c.count > 0 && <span className="text-xs text-neutral-400">{c.count}</span>}
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <h2 className="text-lg font-semibold">Pourquoi une page par ville&nbsp;?</h2>
          <p className="mt-2 text-sm text-neutral-300">
            Pour que tu trouves rapidement des rencontres <strong>près de chez toi</strong>, chaque
            ville a sa propre page : un aperçu local, des profils de la communauté, et une entrée
            directe vers le chat et les soirées appart' de ta région.
          </p>
        </section>
      </div>
    </main>
  );
}
