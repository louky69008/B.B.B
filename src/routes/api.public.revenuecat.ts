/**
 * Webhook RevenueCat → Supabase
 *
 * URL à coller dans RevenueCat (Project Settings → Integrations → Webhooks) :
 *   https://project--43e583f9-0012-4d9b-8bac-3cdddf600e04.lovable.app/api/public/revenuecat
 *
 * RevenueCat envoie un header `Authorization: Bearer <ton secret>` que tu définis
 * toi-même dans leur UI. On vérifie ce secret avant tout traitement.
 *
 * Avant utilisation : ajoute le secret REVENUECAT_WEBHOOK_SECRET via Lovable.
 */
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type RCEvent = {
  event: {
    type: string;
    app_user_id: string;
    product_id?: string;
    entitlement_ids?: string[];
    expiration_at_ms?: number | null;
    environment?: "SANDBOX" | "PRODUCTION";
  };
};

const ENTITLEMENT_TO_TIER: Record<string, string> = {
  ultra: "ultra",
  premium: "premium",
  monthly: "monthly",
  basic_lite: "basic_lite",
  day_pass: "day_pass",
};

export const Route = createFileRoute("/api/public/revenuecat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const auth = request.headers.get("authorization") ?? "";
        if (auth !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: RCEvent;
        try {
          body = (await request.json()) as RCEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const ev = body.event;
        if (!ev?.app_user_id) {
          return new Response("Missing app_user_id", { status: 400 });
        }

        const type = ev.type;

        // Types d'événements qui activent un abonnement
        const ACTIVATE = new Set([
          "INITIAL_PURCHASE",
          "RENEWAL",
          "PRODUCT_CHANGE",
          "UNCANCELLATION",
          "NON_RENEWING_PURCHASE",
        ]);
        // Types qui désactivent
        const DEACTIVATE = new Set(["CANCELLATION", "EXPIRATION", "SUBSCRIPTION_PAUSED"]);

        if (ACTIVATE.has(type)) {
          const ent = ev.entitlement_ids?.[0];
          const tier = ent ? (ENTITLEMENT_TO_TIER[ent] ?? "monthly") : "monthly";
          const expires = ev.expiration_at_ms ? new Date(ev.expiration_at_ms).toISOString() : null;

          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: ev.app_user_id,
              tier,
              expires_at: expires,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) {
            console.error("RC webhook upsert error:", error);
            return new Response("DB error", { status: 500 });
          }
        } else if (DEACTIVATE.has(type)) {
          const { error } = await supabaseAdmin.from("subscriptions").upsert(
            {
              user_id: ev.app_user_id,
              tier: "free",
              expires_at: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) {
            console.error("RC webhook deactivate error:", error);
            return new Response("DB error", { status: 500 });
          }
        }
        // TEST / autres → on log et on répond 200
        console.log("RC webhook:", type, ev.app_user_id, ev.environment);
        return new Response("ok", { status: 200 });
      },
    },
  },
});
