import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Shield, MessageCircle, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { submitContact } from "@/lib/contact.functions";

const URL = "https://connect-kindly-61.lovable.app/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — B.B.B & cie" },
      { name: "description", content: "Une question, un signalement, un partenariat ? Contactez l'équipe B.B.B & cie. Réponse sous 48h." },
      { property: "og:title", content: "Contact — B.B.B & cie" },
      { property: "og:description", content: "Une question, un signalement, un partenariat ?" },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const submit = useServerFn(submitContact);
  const startedAt = useMemo(() => Date.now(), []);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await submit({
        data: {
          email: String(fd.get("email") || ""),
          subject: String(fd.get("subject") || ""),
          message: String(fd.get("message") || ""),
          website: String(fd.get("website") || ""),
          startedAt,
        },
      });
      setTicketId(res.id);
      setStatus("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg.replace(/^Error:\s*/, ""));
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
        Contact
      </h1>
      <p className="mt-4 text-[#bdb7d8]">
        On répond à tout, en 48h max. Choisis le bon canal.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ContactCard icon={Mail} title="Général" email="hello@bbbcie.app" desc="Questions, retours, presse" />
        <ContactCard icon={Shield} title="Modération" email="abuse@bbbcie.app" desc="Signalement, harcèlement" />
        <ContactCard icon={MessageCircle} title="Support" email="support@bbbcie.app" desc="Bug, paiement, compte" />
      </div>

      {status === "success" ? (
        <div className="mt-12 border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/5 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="size-6 text-[color:var(--neon-cyan)] shrink-0" />
            <div>
              <h2 className="font-display text-lg uppercase tracking-wide">Message reçu</h2>
              <p className="mt-2 text-sm text-[#bdb7d8]">
                Merci ! Nous avons bien reçu votre message et reviendrons vers vous sous 48h.
              </p>
              {ticketId && (
                <p className="mt-3 text-xs font-mono text-[#9b94bf]">
                  Réf. ticket : <span className="text-[color:var(--neon-cyan)] break-all">{ticketId}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <form className="mt-12 space-y-4" onSubmit={onSubmit} noValidate>
          {/* Honeypot field — hidden from real users */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label>
              Ne pas remplir
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#9b94bf]">Email</label>
            <input
              type="email"
              name="email"
              required
              maxLength={255}
              className="mt-1 w-full bg-white/5 border border-white/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#9b94bf]">Sujet (optionnel)</label>
            <input
              type="text"
              name="subject"
              maxLength={150}
              className="mt-1 w-full bg-white/5 border border-white/10 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#9b94bf]">Message</label>
            <textarea
              name="message"
              required
              rows={6}
              minLength={10}
              maxLength={5000}
              className="mt-1 w-full bg-white/5 border border-white/10 px-3 py-2 text-sm"
            />
          </div>

          {status === "error" && error && (
            <p className="text-sm text-red-400" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="neon-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Envoi…" : "Envoyer"}
          </button>

          <p className="text-xs text-[#7a749b]">
            Protégé contre le spam. Vos données ne sont pas partagées.
          </p>
        </form>
      )}
    </main>
  );
}

function ContactCard({ icon: Icon, title, email, desc }: { icon: typeof Mail; title: string; email: string; desc: string }) {
  return (
    <a href={`mailto:${email}`} className="block p-5 border border-white/10 bg-white/[0.02] hover:border-[color:var(--neon-cyan)] transition-colors">
      <Icon className="size-5 text-[color:var(--neon-cyan)]" />
      <h2 className="mt-3 font-display text-sm uppercase tracking-wide">{title}</h2>
      <p className="mt-1 text-xs text-[#9b94bf]">{desc}</p>
      <p className="mt-3 text-sm text-[color:var(--neon-cyan)] break-all">{email}</p>
    </a>
  );
}
