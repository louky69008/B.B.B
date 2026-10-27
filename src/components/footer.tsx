import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary mt-auto text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl text-foreground">B.B.B & cie</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Rencontres authentiques, safe et sans tabou.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-primary">Navigation</h4>
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
                    className="rounded-sm text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-primary">Légal</h4>
            <ul className="mt-3 space-y-2">
              {[
                { label: "CGU", to: "/cgu" },
                { label: "Politique de confidentialité", to: "/politique-confidentialite" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="rounded-sm text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 pb-16 md:pb-0 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} B.B.B & cie. Tous droits réservés.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            18+ uniquement · Modération active · RGPD conforme
          </p>
        </div>
      </div>
    </footer>
  );
}
