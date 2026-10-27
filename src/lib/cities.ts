// Liste des villes FR pour les pages SEO géolocalisées.
// Chaque entrée devient une page indexable /villes/{slug}.

export type City = {
  slug: string;
  name: string;
  region: string;
  // variantes acceptées dans la colonne profiles.city (matching insensible à la casse)
  aliases?: string[];
};

export const CITIES: City[] = [
  { slug: "paris", name: "Paris", region: "Île-de-France" },
  { slug: "marseille", name: "Marseille", region: "PACA" },
  { slug: "lyon", name: "Lyon", region: "Auvergne-Rhône-Alpes" },
  { slug: "toulouse", name: "Toulouse", region: "Occitanie" },
  { slug: "nice", name: "Nice", region: "PACA" },
  { slug: "nantes", name: "Nantes", region: "Pays de la Loire" },
  { slug: "montpellier", name: "Montpellier", region: "Occitanie" },
  { slug: "strasbourg", name: "Strasbourg", region: "Grand Est" },
  { slug: "bordeaux", name: "Bordeaux", region: "Nouvelle-Aquitaine" },
  { slug: "lille", name: "Lille", region: "Hauts-de-France" },
  { slug: "rennes", name: "Rennes", region: "Bretagne" },
  { slug: "reims", name: "Reims", region: "Grand Est" },
  { slug: "le-havre", name: "Le Havre", region: "Normandie", aliases: ["Le Havre", "Havre"] },
  { slug: "saint-etienne", name: "Saint-Étienne", region: "Auvergne-Rhône-Alpes", aliases: ["Saint-Etienne", "St-Etienne"] },
  { slug: "toulon", name: "Toulon", region: "PACA" },
  { slug: "grenoble", name: "Grenoble", region: "Auvergne-Rhône-Alpes" },
  { slug: "dijon", name: "Dijon", region: "Bourgogne-Franche-Comté" },
  { slug: "angers", name: "Angers", region: "Pays de la Loire" },
  { slug: "nimes", name: "Nîmes", region: "Occitanie", aliases: ["Nimes"] },
  { slug: "clermont-ferrand", name: "Clermont-Ferrand", region: "Auvergne-Rhône-Alpes" },
  { slug: "tours", name: "Tours", region: "Centre-Val de Loire" },
  { slug: "le-mans", name: "Le Mans", region: "Pays de la Loire" },
  { slug: "amiens", name: "Amiens", region: "Hauts-de-France" },
  { slug: "metz", name: "Metz", region: "Grand Est" },
  { slug: "perpignan", name: "Perpignan", region: "Occitanie" },
  { slug: "besancon", name: "Besançon", region: "Bourgogne-Franche-Comté", aliases: ["Besancon"] },
  { slug: "orleans", name: "Orléans", region: "Centre-Val de Loire", aliases: ["Orleans"] },
  { slug: "rouen", name: "Rouen", region: "Normandie" },
  { slug: "mulhouse", name: "Mulhouse", region: "Grand Est" },
  { slug: "caen", name: "Caen", region: "Normandie" },
  { slug: "nancy", name: "Nancy", region: "Grand Est" },
  { slug: "avignon", name: "Avignon", region: "PACA" },
  { slug: "poitiers", name: "Poitiers", region: "Nouvelle-Aquitaine" },
  { slug: "la-rochelle", name: "La Rochelle", region: "Nouvelle-Aquitaine" },
  { slug: "limoges", name: "Limoges", region: "Nouvelle-Aquitaine" },
  { slug: "annecy", name: "Annecy", region: "Auvergne-Rhône-Alpes" },
  { slug: "brest", name: "Brest", region: "Bretagne" },
  { slug: "pau", name: "Pau", region: "Nouvelle-Aquitaine" },
  { slug: "bayonne", name: "Bayonne", region: "Nouvelle-Aquitaine" },
  { slug: "biarritz", name: "Biarritz", region: "Nouvelle-Aquitaine" },
];

export function findCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug.toLowerCase());
}

/** Variantes de string à matcher dans la colonne profiles.city (case-insensitive). */
export function cityMatchValues(city: City): string[] {
  return [city.name, ...(city.aliases ?? [])];
}
