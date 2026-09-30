export type Tier = "free" | "basic_lite" | "monthly" | "premium" | "ultra" | "day_pass";

export type TierConfig = {
  id: Tier;
  name: string;
  price: string;
  period: string;
  profileLimit: number; // -1 = illimité
  filtersAdvanced: boolean;
  noAds: boolean;
  incognito: boolean;
  icebreakersAI: boolean;
  /** Affiche un filigrane (pseudo) sur les photos de l'utilisateur partout dans l'app */
  watermark: boolean;
  highlight?: boolean;
};

export const TIERS: TierConfig[] = [
  {
    id: "free",
    name: "Gratuit",
    price: "0 €",
    period: "",
    profileLimit: 30,
    filtersAdvanced: false,
    noAds: false,
    incognito: false,
    icebreakersAI: false,
    watermark: false,
  },
  {
    id: "basic_lite",
    name: "Basic Lite",
    price: "4,99 €",
    period: "/ mois",
    profileLimit: 100,
    filtersAdvanced: false,
    noAds: true,
    incognito: false,
    icebreakersAI: false,
    watermark: false,
  },
  {
    id: "day_pass",
    name: "Pass 24h",
    price: "2,99 €",
    period: "/ 24h",
    profileLimit: 200,
    filtersAdvanced: true,
    noAds: true,
    incognito: false,
    icebreakersAI: true,
    watermark: false,
  },
  {
    id: "monthly",
    name: "Mensuel",
    price: "12,99 €",
    period: "/ mois",
    profileLimit: 300,
    filtersAdvanced: true,
    noAds: true,
    incognito: false,
    icebreakersAI: true,
    watermark: false,
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "19,99 €",
    period: "/ mois",
    profileLimit: 600,
    filtersAdvanced: true,
    noAds: true,
    incognito: true,
    icebreakersAI: true,
    watermark: false,
  },
  {
    id: "ultra",
    name: "Ultra",
    price: "29,99 €",
    period: "/ mois",
    profileLimit: -1,
    filtersAdvanced: true,
    noAds: true,
    incognito: true,
    icebreakersAI: true,
    watermark: true,
  },
];

export function getTierConfig(tier: Tier | string | null | undefined): TierConfig {
  return TIERS.find((t) => t.id === tier) ?? TIERS[0];
}
