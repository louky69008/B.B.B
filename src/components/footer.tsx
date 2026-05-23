import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0014] mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-display text-lg uppercase tracking-wide text-white">
              B.B.B & cie
            </h3>
            <p className="mt-2 text-sm text-[#9b94bf]">
              Rencontres authentiques, safe et sans tabou.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[color:var(--neon-cyan)]">
              Navigation
            </h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "Accueil", to: "/" },
                { label: "À propos", to: "/a-propos" },
                { label: "Tarifs", to: "/tarifs" },
                { label: "Blog", to: "/blog" },
                { label: "Contact", to: "/contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-[#bdb7d8] hover:text-[color:var(--neon-magenta)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-[color:var(--neon-cyan)]">
              Légal
            </h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "CGU", to: "/cgu" },
                { label: "Politique de confidentialité", to: "/politique-confidentialite" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-[#bdb7d8] hover:text-[color:var(--neon-magenta)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9b94bf]">
            © {new Date().getFullYear()} B.B.B & cie. Tous droits réservés.
          </p>
          <p className="text-xs text-[#9b94bf]">
            18+ uniquement · Modération active · RGPD conforme
          </p>
        </div>
      </div>
    </footer>
  );
}
