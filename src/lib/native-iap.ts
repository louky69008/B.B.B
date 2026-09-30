/**
 * Native In-App Purchases via RevenueCat.
 *
 * Fonctionne SEULEMENT dans le build natif (Capacitor iOS/Android).
 * Sur le web (navigateur), toutes les fonctions sont no-op et renvoient `null`
 * — le code web continue d'utiliser le flow Stripe / démo dans /app/subscribe.
 *
 * Setup (à faire une fois que tu auras un compte RevenueCat) :
 *  1. Crée un projet RevenueCat → récupère les clés publiques iOS + Android
 *  2. Renseigne VITE_REVENUECAT_IOS_KEY et VITE_REVENUECAT_ANDROID_KEY dans .env
 *  3. Crée tes produits dans App Store Connect + Google Play Console
 *  4. Mappe-les dans RevenueCat → Offerings (ex: "default" avec packages monthly/premium/ultra)
 *  5. Appelle `initIAP(user.id)` au login, puis `purchasePackage(...)` depuis l'UI
 */
import type { Tier } from "./subscriptions";

type AnyPurchases = {
  configure: (opts: { apiKey: string; appUserID?: string | null }) => Promise<void>;
  logIn: (opts: { appUserID: string }) => Promise<unknown>;
  logOut: () => Promise<unknown>;
  getOfferings: () => Promise<{ current: { availablePackages: PurchasesPackage[] } | null }>;
  purchasePackage: (opts: { aPackage: PurchasesPackage }) => Promise<{
    customerInfo: { entitlements: { active: Record<string, { identifier: string }> } };
  }>;
  getCustomerInfo: () => Promise<{
    entitlements: { active: Record<string, { identifier: string }> };
  }>;
  restorePurchases: () => Promise<unknown>;
};

export type PurchasesPackage = {
  identifier: string;
  packageType: string;
  product: { identifier: string; priceString: string; title: string; description: string };
};

let purchasesModule: AnyPurchases | null = null;
let isNativeCached: boolean | null = null;

async function isNative(): Promise<boolean> {
  if (isNativeCached !== null) return isNativeCached;
  if (typeof window === "undefined") return (isNativeCached = false);
  try {
    const { Capacitor } = await import("@capacitor/core");
    isNativeCached = Capacitor.isNativePlatform();
  } catch {
    isNativeCached = false;
  }
  return isNativeCached;
}

async function getPurchases(): Promise<AnyPurchases | null> {
  if (!(await isNative())) return null;
  if (purchasesModule) return purchasesModule;
  try {
    const mod = await import("@revenuecat/purchases-capacitor");
    purchasesModule = mod.Purchases as unknown as AnyPurchases;
    return purchasesModule;
  } catch {
    return null;
  }
}

function platformApiKey(): string | null {
  // Renseigne ces variables dans Lovable → Settings → Secrets (build secrets)
  // ou directement dans .env si tu builds localement.
  const ios = import.meta.env.VITE_REVENUECAT_IOS_KEY as string | undefined;
  const android = import.meta.env.VITE_REVENUECAT_ANDROID_KEY as string | undefined;
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("iphone") || ua.includes("ipad")) return ios ?? null;
  if (ua.includes("android")) return android ?? null;
  return null;
}

/** À appeler une fois au démarrage de l'app (après login). */
export async function initIAP(userId: string | null) {
  const P = await getPurchases();
  if (!P) return;
  const apiKey = platformApiKey();
  if (!apiKey) return;
  await P.configure({ apiKey, appUserID: userId });
}

/** Récupère les offerings configurés dans RevenueCat. */
export async function getOfferings(): Promise<PurchasesPackage[] | null> {
  const P = await getPurchases();
  if (!P) return null;
  const offerings = await P.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

/** Achat d'un package. Retourne le tier actif après achat, ou null si pas natif. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<Tier | null> {
  const P = await getPurchases();
  if (!P) return null;
  const result = await P.purchasePackage({ aPackage: pkg });
  return entitlementToTier(result.customerInfo.entitlements.active);
}

/** Restaure les achats existants (obligatoire pour la review Apple). */
export async function restorePurchases(): Promise<Tier | null> {
  const P = await getPurchases();
  if (!P) return null;
  await P.restorePurchases();
  const info = await P.getCustomerInfo();
  return entitlementToTier(info.entitlements.active);
}

/** Mappe les entitlements RevenueCat → nos tiers internes. */
function entitlementToTier(active: Record<string, { identifier: string }>): Tier {
  if (active["ultra"]) return "ultra";
  if (active["premium"]) return "premium";
  if (active["monthly"]) return "monthly";
  if (active["basic_lite"]) return "basic_lite";
  if (active["day_pass"]) return "day_pass";
  return "free";
}

export const iap = {
  isNative,
  initIAP,
  getOfferings,
  purchasePackage,
  restorePurchases,
};
