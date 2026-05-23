export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tag: string;
  readingTime: string;
  content: { heading?: string; paragraphs: string[] }[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "premier-rdv",
    title: "Réussir son premier rendez-vous IRL",
    excerpt: "Les 7 règles d'or pour transformer un match en vraie rencontre.",
    date: "2026-05-20",
    tag: "Conseils",
    readingTime: "6 min",
    content: [
      {
        paragraphs: [
          "Passer d'un match en ligne à un vrai rendez-vous reste l'étape la plus délicate. Les attentes sont fortes, la pression aussi. Voici nos 7 règles d'or, testées par la communauté B.B.B & cie, pour vivre une rencontre fluide, respectueuse et mémorable.",
        ],
      },
      {
        heading: "1. Choisir un lieu neutre et confortable",
        paragraphs: [
          "Un bar calme, un café, une balade : privilégie un endroit où vous pouvez vous entendre parler et partir facilement. Évite ton appart' ou celui de l'autre pour un premier face-à-face — la confiance se construit avant l'intimité.",
        ],
      },
      {
        heading: "2. Prévenir un·e ami·e",
        paragraphs: [
          "Partage le lieu, l'heure et le pseudo de la personne. Ce n'est pas de la méfiance, c'est du bon sens. Notre fonctionnalité \"safe ping\" envoie automatiquement un message à ton contact d'urgence à l'heure prévue.",
        ],
      },
      {
        heading: "3. Clarifier les attentes avant",
        paragraphs: [
          "Un message la veille du type \"j'ai hâte, on prend juste un verre pour voir ?\" évite 80% des malaises. Personne n'aime deviner si c'est un date romantique, amical ou plus charnel.",
        ],
      },
      {
        heading: "4. Arriver à l'heure, partir quand tu veux",
        paragraphs: [
          "La ponctualité est une marque de respect. Le droit de partir aussi : si tu ne le sens pas, dis-le simplement et rentre. Pas besoin d'excuse élaborée.",
        ],
      },
      {
        heading: "5. Pose des questions ouvertes",
        paragraphs: [
          "Évite l'interrogatoire CV (\"tu fais quoi dans la vie ?\"). Préfère \"qu'est-ce qui t'a fait rire cette semaine ?\" ou \"c'est quoi ton dernier coup de cœur ?\". Tu apprendras 10x plus.",
        ],
      },
      {
        heading: "6. Le consentement, à chaque étape",
        paragraphs: [
          "Un baiser, une main sur l'épaule, un raccompagnement : demande, observe, écoute. \"Je peux ?\" reste la phrase la plus sexy de toutes.",
        ],
      },
      {
        heading: "7. Débriefer honnêtement",
        paragraphs: [
          "Dans les 24h, envoie un message clair : \"super soirée, on remet ça ?\" ou \"c'était sympa mais pas de match pour moi, prends soin de toi\". Ghoster c'est dépassé.",
        ],
      },
    ],
  },
  {
    slug: "soiree-appart",
    title: "Soirée appart' : le guide pour bien recevoir",
    excerpt: "Ambiance, safe sex, limites claires : organise une soirée mémorable.",
    date: "2026-05-12",
    tag: "Lifestyle",
    readingTime: "8 min",
    content: [
      {
        paragraphs: [
          "Organiser une soirée chez soi — qu'elle soit feutrée à 4 ou plus festive à 20 — demande un peu de préparation. Pas pour brider la spontanéité, mais pour que tout le monde se sente bien.",
        ],
      },
      {
        heading: "Définir le cadre dès l'invitation",
        paragraphs: [
          "Dress code, ambiance (chill, dancing, sensuelle), nombre de personnes, horaires de fin : plus tu es précis·e, plus tes invité·es arrivent détendu·es. Sur B.B.B, l'outil \"Soirée\" te permet de cocher tout ça d'un clic.",
          "Précise aussi ce qui n'est PAS prévu : pas de photos, pas de nudité, pas de drogues. Les non-dits créent des malaises.",
        ],
      },
      {
        heading: "Le brief de bienvenue",
        paragraphs: [
          "À l'arrivée, prends 30 secondes par invité·e pour rappeler les règles maison : où sont les toilettes, la zone calme, le contact d'urgence affiché sur le frigo. C'est l'équivalent du briefing sécurité en avion — bref et essentiel.",
        ],
      },
      {
        heading: "Safe sex, safe vibes",
        paragraphs: [
          "Une coupelle de préservatifs et de digues dentaires dans la salle de bain, du gel à base d'eau, des lingettes. Personne ne devrait avoir à demander.",
          "Si tu sers de l'alcool, prévois aussi du soft de qualité (cocktails sans alcool, kombucha). La sobriété est un choix valide et le consentement passe par la clarté d'esprit.",
        ],
      },
      {
        heading: "Une zone de retrait",
        paragraphs: [
          "Une pièce ou un coin calme avec couvertures, eau, chargeurs. Indispensable pour celles et ceux qui ont besoin d'une pause sans devoir partir.",
        ],
      },
      {
        heading: "Le lendemain",
        paragraphs: [
          "Un message groupé court : \"merci d'être venu·es, j'espère que vous avez passé un bon moment. Si quelque chose vous a dérangé, écrivez-moi en privé.\" Ouvrir la porte au feedback, c'est progresser.",
        ],
      },
    ],
  },
  {
    slug: "trans-friendly",
    title: "Pourquoi un espace vraiment trans-friendly compte",
    excerpt: "Notre démarche pour un espace inclusif et respectueux.",
    date: "2026-04-28",
    tag: "Communauté",
    readingTime: "5 min",
    content: [
      {
        paragraphs: [
          "Trans-friendly, c'est devenu un mot-valise. Tout le monde le revendique, peu de plateformes le pratiquent. Voici ce que ça veut dire concrètement chez B.B.B & cie.",
        ],
      },
      {
        heading: "Des champs d'identité qui ne forcent pas la case",
        paragraphs: [
          "Genre, pronoms, identité de genre : trois champs distincts, tous libres ou multi-sélection. Pas de \"homme/femme\" obligatoire, pas de menu déroulant qui efface les non-binaires.",
        ],
      },
      {
        heading: "Une modération formée",
        paragraphs: [
          "Nos modérateur·ices ont suivi une formation spécifique aux LGBTQIA+ avec une association partenaire. Les signalements pour transphobie sont traités en priorité absolue, avec bannissement immédiat en cas de violence avérée.",
        ],
      },
      {
        heading: "Un filtre \"trans-friendly\"",
        paragraphs: [
          "Pour les personnes trans qui veulent éviter les profils chasseurs ou exotisants : un filtre permet de ne voir que les profils ayant explicitement marqué leur ouverture, avec un engagement écrit sur le respect.",
        ],
      },
      {
        heading: "Ce qu'il nous reste à faire",
        paragraphs: [
          "On n'est pas parfait·es. On travaille sur la prise en charge des deadnames dans l'historique, sur des partenariats avec des assos locales, sur de la doc pédagogique pour les cis qui matchent une personne trans pour la première fois. Si tu as des suggestions, écris-nous.",
        ],
      },
    ],
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);
