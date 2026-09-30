import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CITIES, findCity, cityMatchValues } from "@/lib/cities";

/**
 * Stats publiques pour une ville : nombre de profils + petit échantillon
 * (pseudo + age + photo principale uniquement, jamais d'identifiants).
 * Sert au SEO et à la prévisualisation publique (photos floutées côté UI).
 */
export const getCityStats = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const city = findCity(data.slug);
    if (!city)
      return {
        city: null,
        count: 0,
        sample: [] as Array<{ pseudo: string; age: number | null; photo_url: string | null }>,
      };

    const variants = cityMatchValues(city);
    // ilike OR sur chaque variante
    const orClause = variants.map((v) => `city.ilike.${v}`).join(",");

    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .or(orClause)
      .eq("anonymous_mode", false)
      .eq("hide_status", false);

    const { data: rows } = await supabaseAdmin
      .from("profiles")
      .select("pseudo, age, photo_url")
      .or(orClause)
      .eq("anonymous_mode", false)
      .eq("hide_status", false)
      .not("photo_url", "is", null)
      .order("last_seen", { ascending: false })
      .limit(12);

    return {
      city: { slug: city.slug, name: city.name, region: city.region },
      count: count ?? 0,
      sample: rows ?? [],
    };
  });

/** Stats globales : nombre de profils par ville (pour la page /villes). */
export const getCitiesIndex = createServerFn({ method: "GET" }).handler(async () => {
  const results = await Promise.all(
    CITIES.map(async (c) => {
      const orClause = cityMatchValues(c)
        .map((v) => `city.ilike.${v}`)
        .join(",");
      const { count } = await supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .or(orClause)
        .eq("anonymous_mode", false)
        .eq("hide_status", false);
      return { slug: c.slug, name: c.name, region: c.region, count: count ?? 0 };
    }),
  );
  return results.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
});
