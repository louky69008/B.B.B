import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://connect-kindly-61.lovable.app/a-propos";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — B.B.B & cie" },
      {
        name: "description",
        content:
          "B.B.B & cie : la communauté de rencontres authentiques, safe et sans tabou. Notre mission, notre charte, notre équipe.",
      },
      { property: "og:title", content: "À propos — B.B.B & cie" },
      {
        property: "og:description",
        content: "Une communauté de rencontres safe, inclusive et sans tabou.",
      },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
        À propos de B.B.B &amp; cie
      </h1>
      <p className="mt-6 text-lg text-[#bdb7d8]">
        B.B.B & cie est née d'un constat simple : la plupart des apps de rencontre traitent leurs
        utilisateur·rices comme du bétail à matcher. Nous voulions un espace plus humain, plus
        libre, et radicalement plus safe.
      </p>

      <section className="mt-12 space-y-8">
        <Block
          title="Notre mission"
          body="Permettre aux adultes consentants de se rencontrer pour ce qu'ils sont vraiment — sans pression, sans filtres absurdes, sans algorithmes opaques. Du chat classique aux soirées appart', vous gardez la main."
        />
        <Block
          title="Notre charte"
          body="Zéro nudité publique. Zéro mineur. Zéro fétichisation. Modération humaine + IA, blocage instantané, suppression de compte immédiate. La sécurité passe avant la croissance."
        />
        <Block
          title="Notre équipe"
          body="Une petite équipe indépendante basée en France. Pas de levée de fonds, pas d'investisseurs à qui rendre des comptes — juste une communauté à qui rendre service."
        />
      </section>

      <div className="mt-12">
        <Link to="/auth" className="neon-btn">
          Rejoindre la communauté
        </Link>
      </div>
    </main>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[color:var(--neon-cyan)] pl-5">
      <h2 className="font-display text-xl uppercase tracking-wide text-[color:var(--neon-cyan)]">
        {title}
      </h2>
      <p className="mt-2 text-[#bdb7d8] leading-relaxed">{body}</p>
    </div>
  );
}
