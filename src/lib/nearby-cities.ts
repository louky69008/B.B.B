import { CITIES, cityMatchValues, type City } from "@/lib/cities";

type Coordinates = [latitude: number, longitude: number];
export type NearbyCity = City & { center: Coordinates };

// Public commune centres from https://geo.api.gouv.fr/decoupage-administratif/communes.
const centers: Record<string, Coordinates> = {
  paris: [48.8589, 2.347],
  marseille: [43.2803, 5.3806],
  lyon: [45.758, 4.8351],
  toulouse: [43.6007, 1.4328],
  nice: [43.7032, 7.2528],
  nantes: [47.2382, -1.5603],
  montpellier: [43.61, 3.8742],
  strasbourg: [48.5691, 7.7621],
  bordeaux: [44.8624, -0.5848],
  lille: [50.6311, 3.0468],
  rennes: [48.1159, -1.6884],
  reims: [49.2535, 4.0551],
  "le-havre": [49.4958, 0.1312],
  "saint-etienne": [45.4241, 4.3665],
  toulon: [43.1364, 5.9334],
  grenoble: [45.1842, 5.7155],
  dijon: [47.3319, 5.0322],
  angers: [47.4819, -0.5629],
  nimes: [43.8322, 4.3429],
  "clermont-ferrand": [45.787, 3.1127],
  tours: [47.3943, 0.6949],
  "le-mans": [47.9819, 0.1957],
  amiens: [49.8987, 2.2847],
  metz: [49.1048, 6.1962],
  perpignan: [42.699, 2.9045],
  besancon: [47.2602, 6.0123],
  orleans: [47.8734, 1.9122],
  rouen: [49.4412, 1.0912],
  mulhouse: [47.7526, 7.3255],
  caen: [49.1846, -0.3722],
  nancy: [48.6881, 6.1734],
  avignon: [43.9416, 4.8333],
  poitiers: [46.5846, 0.3715],
  "la-rochelle": [46.162, -1.1765],
  limoges: [45.8567, 1.226],
  annecy: [45.9024, 6.1264],
  brest: [48.4085, -4.4996],
  pau: [43.3219, -0.3435],
  bayonne: [43.4844, -1.4611],
  biarritz: [43.4709, -1.5557],
};

function normalizeCity(city: string) {
  return city
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[\s\p{Dash_Punctuation}]+/gu, "-");
}

export const nearbyCities: NearbyCity[] = CITIES.flatMap((city) => {
  const center = centers[city.slug];
  return center ? [{ ...city, center }] : [];
}).sort((first, second) => first.name.localeCompare(second.name, "fr"));

const citiesByName = new Map(
  nearbyCities.flatMap((city) =>
    [city.slug, ...cityMatchValues(city)].map((name) => [normalizeCity(name), city] as const),
  ),
);

export function getNearbyCity(name: string | null | undefined) {
  return name ? citiesByName.get(normalizeCity(name)) : undefined;
}

export function cityDistanceKm(from: NearbyCity, to: NearbyCity) {
  const radians = Math.PI / 180;
  const [fromLatitude, fromLongitude] = from.center;
  const [toLatitude, toLongitude] = to.center;
  const a =
    Math.sin(((toLatitude - fromLatitude) * radians) / 2) ** 2 +
    Math.cos(fromLatitude * radians) *
      Math.cos(toLatitude * radians) *
      Math.sin(((toLongitude - fromLongitude) * radians) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
}
