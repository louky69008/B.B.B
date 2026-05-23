import { createFileRoute } from "@tanstack/react-router";
import { Mail, Shield, MessageCircle } from "lucide-react";

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

      <form className="mt-12 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = `mailto:hello@bbbcie.app`; }}>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9b94bf]">Email</label>
          <input type="email" required className="mt-1 w-full bg-white/5 border border-white/10 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#9b94bf]">Message</label>
          <textarea required rows={6} className="mt-1 w-full bg-white/5 border border-white/10 px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="neon-btn">Envoyer</button>
      </form>
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
