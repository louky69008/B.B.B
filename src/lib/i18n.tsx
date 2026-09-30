import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "fr" | "en";

const dict = {
  fr: {
    app_name: "Kindly",
    tagline: "L'app de rencontre pensée pour la communauté, pas pour les actionnaires.",
    cta_join: "Rejoindre gratuitement",
    cta_login: "Se connecter",
    landing_hero: "Inclusif. Transparent. Réellement gratuit.",
    landing_sub: "Gay, bi, trans, allié·e — un espace bienveillant, sans prix surprise.",
    pricing_title: "Des prix honnêtes",
    plan_free: "Basic Lite",
    plan_free_price: "Gratuit",
    plan_free_desc: "30 profils, filtre en ligne, pubs non intrusives.",
    plan_basic: "Basic",
    plan_basic_price: "~15 €/mois",
    plan_basic_desc: "100 profils, tous les filtres, sans pub, 1 boost/semaine.",
    plan_premium: "Premium",
    plan_premium_price: "~25 €/mois",
    plan_premium_desc: "500 profils, incognito, voir qui vous like, badge vérifié.",
    plan_ultra: "Ultra",
    plan_ultra_price: "30 €/mois",
    plan_ultra_desc: "Tout illimité, tous les privilèges.",
    no_shareholders: "Pas d'actionnaires, juste vous.",
    nav_grid: "Profils",
    nav_chat: "Messages",
    nav_me: "Mon profil",
    logout: "Se déconnecter",
    signup: "Inscription",
    login: "Connexion",
    email: "Email",
    password: "Mot de passe",
    pseudo: "Pseudo",
    age_confirm: "Je confirme avoir 18 ans ou plus",
    no_account: "Pas encore de compte ?",
    have_account: "Déjà inscrit·e ?",
    bio: "Bio",
    gender: "Identité de genre",
    pronouns: "Pronoms",
    age: "Âge",
    city: "Ville",
    photo_url: "URL de la photo",
    save: "Enregistrer",
    online: "En ligne",
    recent: "Actif récemment",
    offline: "Hors ligne",
    send_message: "Envoyer un message",
    type_message: "Écrire un message…",
    send: "Envoyer",
    no_conversations: "Aucune conversation pour le moment.",
    hide_status: "Masquer mon statut",
    profile_updated: "Profil mis à jour",
    rules_title: "Règles communautaires",
    rules_text:
      "Bienveillance, anti-transphobie, anti-racisme, consentement. Tout manquement entraîne sanction.",
  },
  en: {
    app_name: "Kindly",
    tagline: "A dating app built for the community, not shareholders.",
    cta_join: "Join for free",
    cta_login: "Log in",
    landing_hero: "Inclusive. Transparent. Actually free.",
    landing_sub: "Gay, bi, trans, ally — a kind space, no surprise pricing.",
    pricing_title: "Honest pricing",
    plan_free: "Basic Lite",
    plan_free_price: "Free",
    plan_free_desc: "30 profiles, online filter, non-intrusive ads.",
    plan_basic: "Basic",
    plan_basic_price: "~€15/mo",
    plan_basic_desc: "100 profiles, all filters, ad-free, 1 boost/week.",
    plan_premium: "Premium",
    plan_premium_price: "~€25/mo",
    plan_premium_desc: "500 profiles, incognito, see who liked you, verified badge.",
    plan_ultra: "Ultra",
    plan_ultra_price: "€30/mo",
    plan_ultra_desc: "Everything unlimited, all perks.",
    no_shareholders: "No shareholders, just you.",
    nav_grid: "Profiles",
    nav_chat: "Messages",
    nav_me: "My profile",
    logout: "Log out",
    signup: "Sign up",
    login: "Log in",
    email: "Email",
    password: "Password",
    pseudo: "Username",
    age_confirm: "I confirm I am 18+",
    no_account: "No account yet?",
    have_account: "Already a member?",
    bio: "Bio",
    gender: "Gender identity",
    pronouns: "Pronouns",
    age: "Age",
    city: "City",
    photo_url: "Photo URL",
    save: "Save",
    online: "Online",
    recent: "Recently active",
    offline: "Offline",
    send_message: "Send a message",
    type_message: "Type a message…",
    send: "Send",
    no_conversations: "No conversations yet.",
    hide_status: "Hide my status",
    profile_updated: "Profile updated",
    rules_title: "Community rules",
    rules_text:
      "Kindness, anti-transphobia, anti-racism, consent. Any violation leads to sanctions.",
  },
} as const;

type Key = keyof (typeof dict)["fr"];

const I18nCtx = createContext<{ lang: Lang; t: (k: Key) => string; setLang: (l: Lang) => void }>({
  lang: "fr",
  t: (k) => k,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);
  const changeLang = (l: Lang) => {
    setLang(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const t = (k: Key) => dict[lang][k];
  return <I18nCtx.Provider value={{ lang, t, setLang: changeLang }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
