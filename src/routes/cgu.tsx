import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://connect-kindly-61.lovable.app/cgu";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — B.B.B & cie" },
      {
        name: "description",
        content:
          "Conditions générales d'utilisation de B.B.B & cie. Règles de conduite, responsabilités et modalités d'accès au service de rencontres.",
      },
      { property: "og:title", content: "CGU — B.B.B & cie" },
      {
        property: "og:description",
        content: "Conditions générales d'utilisation du service de rencontres B.B.B & cie.",
      },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: CGUPage,
});

function CGUPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
        Conditions Générales d'Utilisation
      </h1>
      <p className="mt-4 text-sm text-[#9b94bf]">Dernière mise à jour : 23 mai 2026</p>

      <section className="mt-12 space-y-10">
        <LegalSection
          title="1. Objet du service"
          body="B.B.B & cie est une plateforme de rencontres en ligne destinée aux adultes consentants. Le service permet via son application web et mobile de créer un profil, consulter des profils d'autres utilisateur·rices, échanger des messages, et participer à des événements sociaux (« soirées appart' »). L'accès au service est soumis à l'acceptation des présentes CGU."
        />
        <LegalSection
          title="2. Accès au service et inscription"
          body="L'inscription est réservée aux personnes âgées de 18 ans et plus. En créant un compte, vous certifiez être majeur·e et disposer de la capacité juridique pour contracter. L'accès rapide (profil basique) est gratuit. L'accès complet nécessite une vérification d'identité (KYC) facultative ou un abonnement payant."
        />
        <LegalSection
          title="3. Abonnements et paiements"
          body="Les abonnements Premium, Ultra et les Pass 24h sont proposés via notre partenaire de paiement intégré. Les prix sont indiqués TTC. L'abonnement mensuel se renouvelle automatiquement sauf résiliation 24h avant la date de renouvellement. Le Pass 24h est non renouvelable et expire automatiquement."
        />
        <LegalSection
          title="4. Comportement des utilisateur·rices"
          body="Tout utilisateur·rice s'engage à : respecter la législation en vigueur, ne pas harceler ni discriminer, ne pas publier de contenu illicite ou pornographique, ne pas usurper l'identité d'autrui. La modération est assurée par une équipe humaine et des outils d'IA. Tout manquement entraîne un avertissement, une suspension ou une suppression définitive de compte sans remboursement."
        />
        <LegalSection
          title="5. Propriété intellectuelle"
          body="Les contenus publiés par les utilisateur·rices (photos, textes) restent leur propriété. En les publiant sur B.B.B & cie, vous nous accordez une licence non exclusive pour leur affichage dans le cadre du service. Le logo, le design et le code source de B.B.B & cie sont protégés par le droit d'auteur."
        />
        <LegalSection
          title="6. Responsabilité"
          body="B.B.B & cie n'est pas responsable des rencontres organisées hors de la plateforme. Nous mettons en œuvre des moyens de sécurité (modération, signalement, blocage) mais ne garantissons pas l'exactitude des profils ni la sincérité des utilisateur·rices. Chacun·e est invité·e à faire preuve de prudence."
        />
        <LegalSection
          title="7. Résiliation et suppression de compte"
          body="Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. La suppression est définitive et entraîne la perte de vos données et abonnements actifs. Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des CGU."
        />
        <LegalSection
          title="8. Modifications des CGU"
          body="Les présentes CGU peuvent être modifiées à tout moment. Les utilisateur·rices en seront informés·es par email ou notification in-app. L'utilisation continue du service vaut acceptation des nouvelles conditions."
        />
        <LegalSection
          title="9. Droit applicable et litiges"
          body="Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux compétents de Paris seront seuls compétents."
        />
      </section>

      <div className="mt-12">
        <Link to="/contact" className="neon-btn">
          Une question ? Contactez-nous
        </Link>
      </div>
    </main>
  );
}

function LegalSection({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[color:var(--neon-cyan)] pl-5">
      <h2 className="font-display text-xl uppercase tracking-wide text-[color:var(--neon-cyan)]">
        {title}
      </h2>
      <p className="mt-3 text-[#bdb7d8] leading-relaxed">{body}</p>
    </div>
  );
}
