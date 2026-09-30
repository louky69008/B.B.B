import { createFileRoute, Link } from "@tanstack/react-router";

const URL = "https://connect-kindly-61.lovable.app/politique-confidentialite";

export const Route = createFileRoute("/politique-confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de Confidentialité — B.B.B & cie" },
      {
        name: "description",
        content:
          "Politique de confidentialité de B.B.B & cie : collecte, utilisation, conservation et droits sur vos données personnelles.",
      },
      { property: "og:title", content: "Politique de Confidentialité — B.B.B & cie" },
      {
        property: "og:description",
        content: "Comment B.B.B & cie protège vos données personnelles et respecte le RGPD.",
      },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
        Politique de Confidentialité
      </h1>
      <p className="mt-4 text-sm text-[#9b94bf]">
        Dernière mise à jour : 23 mai 2026 — Conforme au RGPD
      </p>

      <section className="mt-12 space-y-10">
        <PrivacySection
          title="1. Responsable du traitement"
          body="Le responsable du traitement des données est B.B.B & cie, société par actions simplifiée immatriculée au RCS de Paris. Pour toute question relative à vos données, contactez notre DPO à l'adresse dpo@bbbcie.app."
        />
        <PrivacySection
          title="2. Données collectées"
          body="Nous collectons : vos données d'inscription (email, pseudonyme, date de naissance), votre photo de profil, votre localisation approximative (ville), vos préférences et filtres, vos messages (chiffrés de bout en bout), et les données de navigation anonymisées. La vérification d'identité (KYC) est facultative et gérée par un prestataire externe certifié."
        />
        <PrivacySection
          title="3. Finalités du traitement"
          body="Vos données sont utilisées pour : vous permettre de créer et gérer votre profil, vous suggérer des profils compatibles, assurer la sécurité et la modération, améliorer le service via des statistiques anonymisées, et vous communiquer des informations liées à votre compte."
        />
        <PrivacySection
          title="4. Base légale"
          body="Le traitement repose sur l'exécution du contrat (CGU) pour les fonctions essentielles, votre consentement explicite pour les données optionnelles (localisation précise, notifications), et l'intérêt légitime pour la modération et la sécurité."
        />
        <PrivacySection
          title="5. Conservation des données"
          body="Les données de compte actif sont conservées pendant la durée de votre inscription. En cas de suppression de compte, vos données personnelles sont anonymisées ou supprimées sous 30 jours, sauf obligation légale (ex : données de paiement conservées 10 ans). Les messages chiffrés ne sont pas stockés en clair sur nos serveurs."
        />
        <PrivacySection
          title="6. Partage des données"
          body="Vos données ne sont pas vendues. Elles peuvent être partagées avec : nos prestataires techniques (hébergement, chiffrement), notre partenaire de paiement pour la facturation, et les autorités compétentes en cas d'obligation légale. Les photos éphémères ne sont jamais stockées sur nos serveurs."
        />
        <PrivacySection
          title="7. Vos droits (RGPD)"
          body="Vous disposez des droits suivants : droit d'accès, de rectification, d'effacement (« droit à l'oubli »), de limitation du traitement, d'opposition, et de portabilité. Vous pouvez exercer ces droits depuis l'application (Paramètres → Données personnelles) ou par email à dpo@bbbcie.app. Réponse sous 30 jours."
        />
        <PrivacySection
          title="8. Sécurité"
          body="Nous mettons en œuvre des mesures techniques et organisationnelles : chiffrement TLS des connexions, chiffrement de bout en bout des messages, hachage des mots de passe (bcrypt), audit de sécurité régulier, et accès restreint aux données pour le personnel autorisé."
        />
        <PrivacySection
          title="9. Cookies et traceurs"
          body="Nous utilisons des cookies strictement nécessaires au fonctionnement du service (authentification, préférences). Aucun cookie de tracking publicitaire n'est déposé sans votre consentement explicite."
        />
        <PrivacySection
          title="10. Modifications"
          body="Cette politique peut être mise à jour. En cas de changement substantiel, vous serez notifié·e par email ou notification. L'utilisation continue du service vaut acceptation de la nouvelle politique."
        />
      </section>

      <div className="mt-12">
        <Link to="/contact" className="neon-btn">
          Contacter le DPO
        </Link>
      </div>
    </main>
  );
}

function PrivacySection({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-2 border-[color:var(--neon-cyan)] pl-5">
      <h2 className="font-display text-xl uppercase tracking-wide text-[color:var(--neon-cyan)]">
        {title}
      </h2>
      <p className="mt-3 text-[#bdb7d8] leading-relaxed">{body}</p>
    </div>
  );
}
