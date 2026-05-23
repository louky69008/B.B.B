# 📱 Build natif iOS / Android — B.B.B & cie

Ton app est **prête pour Capacitor + RevenueCat**. Voici comment la transformer en app iOS/Android avec de vrais achats in-app, **à faire sur ta machine** (Lovable ne peut pas builder du natif).

---

## 1. Cloner le projet sur ta machine

Connecte ton projet Lovable à GitHub (bouton en haut à droite → GitHub), puis :

```bash
git clone https://github.com/<ton-user>/<ton-repo>.git
cd <ton-repo>
bun install   # ou npm install
```

## 2. Ajouter les plateformes natives

```bash
bun run build           # génère le dossier dist/
npx cap add ios         # nécessite un Mac + Xcode
npx cap add android     # nécessite Android Studio
npx cap sync
```

## 3. Configurer RevenueCat

1. Crée un compte sur https://app.revenuecat.com (gratuit jusqu'à 2 500 $/mois de revenus)
2. Crée un projet → ajoute ton app iOS et Android
3. Récupère les **public API keys** (une par plateforme)
4. Crée un fichier `.env.local` (déjà gitignoré) :

```env
VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxx
VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxx
```

5. Dans RevenueCat → **Entitlements**, crée :
   - `basic_lite`, `day_pass`, `monthly`, `premium`, `ultra`
6. Dans **Products**, lie chaque produit App Store Connect / Play Console
7. Dans **Offerings → default**, ajoute un Package par tier

## 4. Créer les produits dans les stores

### Apple (App Store Connect)
- Compte Apple Developer requis : **99 $/an**
- App Store Connect → Mon app → **Achats intégrés** → créer :
  - Abonnement auto-renouvelable : `monthly`, `premium`, `ultra`, `basic_lite`
  - Non-consommable / consommable : `day_pass`

### Google (Play Console)
- Compte Play Console requis : **25 $ une fois**
- Play Console → Monétisation → **Abonnements** → mêmes IDs

## 5. Brancher l'IAP natif dans l'UI

Dans `src/routes/app.subscribe.tsx`, importe :

```ts
import { iap } from "@/lib/native-iap";
```

Au chargement de la page :

```ts
useEffect(() => {
  iap.isNative().then(async (native) => {
    if (!native) return;
    await iap.initIAP(user?.id ?? null);
    const offerings = await iap.getOfferings();
    setNativeOfferings(offerings);
  });
}, [user?.id]);
```

Quand l'utilisateur clique sur "Choisir" :

```ts
const native = await iap.isNative();
if (native) {
  const pkg = nativeOfferings?.find(p => p.identifier === tier);
  if (pkg) {
    const newTier = await iap.purchasePackage(pkg);
    // newTier est synchronisé via webhook RevenueCat → Supabase (voir étape 6)
  }
} else {
  // fallback web (Stripe ou démo actuelle)
  await choose(tier);
}
```

Ajoute aussi un bouton **"Restaurer mes achats"** (obligatoire pour la review Apple) :

```tsx
<button onClick={() => iap.restorePurchases()}>Restaurer mes achats</button>
```

## 6. Synchroniser RevenueCat → Supabase

Crée une route serveur publique pour recevoir les webhooks RevenueCat :

- URL : `https://project--43e583f9-0012-4d9b-8bac-3cdddf600e04.lovable.app/api/public/revenuecat`
- Dans RevenueCat → Project Settings → Integrations → Webhooks, colle l'URL + un secret
- Le handler vérifie la signature et fait un `upsert` sur la table `subscriptions`

(Je peux te générer ce handler quand tu auras le compte RevenueCat ouvert.)

## 7. Lancer l'app

```bash
npx cap run ios       # ouvre Xcode → simulateur ou device
npx cap run android   # ouvre Android Studio
```

## 8. Tester les achats

- iOS : crée un **Sandbox Tester** dans App Store Connect → Users
- Android : ajoute ton compte Gmail comme **License Tester** dans Play Console

---

## Fichiers déjà préparés dans ton projet

- `capacitor.config.ts` — config Capacitor (appId `com.bbbcie.app`)
- `src/lib/native-iap.ts` — wrapper RevenueCat, no-op sur le web
- Paquets installés : `@capacitor/core`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/cli`, `@revenuecat/purchases-capacitor`

Le code web continue de fonctionner normalement — RevenueCat ne s'active qu'en natif.
