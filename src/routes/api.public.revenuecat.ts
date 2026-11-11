import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRevenueCatEntitlement } from "@/lib/revenuecat.server";

type RevenueCatEvent = {
  type: string;
  app_user_id?: string;
  transferred_from?: string[];
  transferred_to?: string[];
  environment?: "SANDBOX" | "PRODUCTION";
};

const userIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/api/public/revenuecat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook not configured", { status: 503 });
        if (request.headers.get("authorization") !== `Bearer ${secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        let event: RevenueCatEvent | undefined;
        try {
          event = ((await request.json()) as { event?: RevenueCatEvent } | null)?.event;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (typeof event?.type !== "string") return new Response("Invalid event", { status: 400 });
        if (event.type === "TEST") return new Response("ok");

        const sandbox = process.env.REVENUECAT_ALLOW_SANDBOX === "true";
        const environment = sandbox ? "sandbox" : "production";
        if (event.environment != null && typeof event.environment !== "string") {
          return new Response("Invalid event environment", { status: 400 });
        }
        if (event.environment && event.environment.toLowerCase() !== environment) {
          return new Response("Other environment ignored");
        }

        const candidates =
          event.type === "TRANSFER"
            ? [
                ...(Array.isArray(event.transferred_from) ? event.transferred_from : []),
                ...(Array.isArray(event.transferred_to) ? event.transferred_to : []),
              ]
            : [event.app_user_id];
        const users = [
          ...new Set(
            candidates.filter(
              (id): id is string => typeof id === "string" && userIdPattern.test(id),
            ),
          ),
        ];
        if (!users.length) return new Response("No B.B.B account");

        const project = process.env.REVENUECAT_PROJECT_ID;
        const key = process.env.REVENUECAT_SECRET_API_KEY;
        if (!project || !key) return new Response("RevenueCat API not configured", { status: 503 });

        try {
          for (const userId of users) {
            const checkedAt = new Date().toISOString();
            const { tier, expiresAt } = await getRevenueCatEntitlement(
              project,
              userId,
              environment,
              key,
            );
            const { error } = await supabaseAdmin.rpc("reconcile_revenuecat_entitlement", {
              _user_id: userId,
              _tier: tier,
              _expires_at: expiresAt,
              _checked_at: checkedAt,
            });
            if (error) return new Response("Entitlement update failed", { status: 500 });
          }
        } catch {
          return new Response("RevenueCat reconciliation failed", { status: 502 });
        }

        return new Response("ok");
      },
    },
  },
});
