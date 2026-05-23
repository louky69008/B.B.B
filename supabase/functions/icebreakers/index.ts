import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { otherPseudo, otherBio } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY manquant");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu génères 3 messages d'ouverture courts (max 15 mots chacun), naturels, drôles ou flirts pour une app de rencontre gay. En français, sans emoji excessif. Retourne uniquement les 3 messages numérotés 1. 2. 3. sans intro." },
          { role: "user", content: `Pseudo: ${otherPseudo || "inconnu"}\nBio: ${otherBio || "(vide)"}` },
        ],
      }),
    });
    if (res.status === 429) return new Response(JSON.stringify({ error: "Trop de requêtes" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (res.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!res.ok) throw new Error("Gateway error");
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const suggestions = text
      .split("\n")
      .map((l) => l.replace(/^\s*\d+[\.\)]\s*/, "").trim())
      .filter((l) => l.length > 0 && l.length < 200)
      .slice(0, 3);
    return new Response(JSON.stringify({ suggestions }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
