import type { Tier } from "@/lib/subscriptions";

type Environment = "production" | "sandbox";
type EntitlementList = { items: { lookup_key: string }[] };
type RevenueCatSubscription = {
  environment: Environment;
  gives_access: boolean;
  current_period_ends_at: number | null;
  ends_at: number | null;
  entitlements: EntitlementList;
};
type RevenueCatPurchase = {
  environment: Environment;
  status: string;
  purchased_at: number;
  entitlements: EntitlementList;
};

const apiOrigin = "https://api.revenuecat.com";
const tiers = ["ultra", "premium", "monthly", "basic_lite", "day_pass"] as const;

async function getItems<T>(path: string, environment: Environment, key: string) {
  let page: URL | null = new URL(path, apiOrigin);
  page.searchParams.set("limit", "100");
  const items: T[] = [];
  const signal = AbortSignal.timeout(8000);

  for (let count = 0; page && count < 10; count += 1) {
    if (page.origin !== apiOrigin || page.pathname !== path) throw new Error("Invalid RC page");
    page.searchParams.set("environment", environment);
    const response = await fetch(page, {
      headers: { Authorization: `Bearer ${key}` },
      redirect: "error",
      signal,
    });
    if (!response.ok) throw new Error(`RevenueCat HTTP ${response.status}`);
    const result = (await response.json()) as { items: T[]; next_page: string | null };
    if (!Array.isArray(result.items)) throw new Error("Missing RC items");
    items.push(...result.items);
    page = result.next_page ? new URL(result.next_page, apiOrigin) : null;
  }

  if (page) throw new Error("Incomplete RC history");
  return items;
}

export async function getRevenueCatEntitlement(
  project: string,
  userId: string,
  environment: Environment,
  key: string,
): Promise<{ tier: Tier; expiresAt: string | null }> {
  const customer = `/v2/projects/${encodeURIComponent(project)}/customers/${encodeURIComponent(userId)}`;
  const [subscriptions, purchases] = await Promise.all([
    getItems<RevenueCatSubscription>(`${customer}/subscriptions`, environment, key),
    getItems<RevenueCatPurchase>(`${customer}/purchases`, environment, key),
  ]);

  const now = Date.now();
  const expiryByTier = new Map<Tier, number>();
  for (const subscription of subscriptions) {
    if (subscription.environment !== environment || !subscription.gives_access) continue;
    const expires = subscription.ends_at ?? subscription.current_period_ends_at;
    if (typeof expires !== "number" || expires <= now) continue;

    for (const tier of tiers) {
      if (subscription.entitlements.items.some((item) => item.lookup_key === tier)) {
        expiryByTier.set(tier, Math.max(expiryByTier.get(tier) ?? 0, expires));
      }
    }
  }

  for (const purchase of purchases) {
    if (
      purchase.environment !== environment ||
      purchase.status !== "owned" ||
      !purchase.entitlements.items.some((item) => item.lookup_key === "day_pass")
    )
      continue;

    const expires = purchase.purchased_at + 24 * 60 * 60 * 1000;
    if (expires > now)
      expiryByTier.set("day_pass", Math.max(expiryByTier.get("day_pass") ?? 0, expires));
  }

  const tier = tiers.find((candidate) => expiryByTier.has(candidate));
  return tier
    ? { tier, expiresAt: new Date(expiryByTier.get(tier)!).toISOString() }
    : { tier: "free", expiresAt: null };
}
