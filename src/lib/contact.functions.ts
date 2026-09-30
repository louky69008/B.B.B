import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ContactSchema = z.object({
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message trop court").max(5000),
  // Honeypot — must be empty
  website: z.string().max(0).optional().or(z.literal("")),
  // Time-based — must be >= 3 seconds since render
  startedAt: z.number().int().nonnegative(),
});

// Simple in-memory rate limit (per IP): 3 / 10 minutes
const RATE_LIMIT = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (RATE_LIMIT.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) return false;
  arr.push(now);
  RATE_LIMIT.set(ip, arr);
  return true;
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ContactSchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot
    if (data.website && data.website.length > 0) {
      return { ok: true as const, id: "ignored" };
    }
    // Time check
    const elapsed = Date.now() - data.startedAt;
    if (elapsed < 3000) {
      throw new Error("Soumission trop rapide. Veuillez réessayer.");
    }

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const userAgent = getRequestHeader("user-agent") || null;

    if (!rateLimit(ip)) {
      throw new Error("Trop de messages envoyés. Réessayez plus tard.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        email: data.email,
        subject: data.subject || null,
        message: data.message,
        ip,
        user_agent: userAgent,
      })
      .select("id")
      .single();

    if (error) {
      console.error("contact insert failed:", error);
      throw new Error("Impossible d'enregistrer le message.");
    }

    return { ok: true as const, id: row.id as string };
  });
