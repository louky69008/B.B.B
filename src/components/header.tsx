import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const marketingLinks = [
    { to: "/a-propos", label: "À propos" },
    { to: "/tarifs", label: "Tarifs" },
    { to: "/villes", label: "Villes" },
    { to: "/blog", label: "Blog" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center gap-2.5 rounded-lg text-xl font-extrabold tracking-tight text-foreground sm:text-2xl"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-neon-magenta to-primary text-primary-foreground shadow-[var(--shadow-neon)]">
            <Heart className="size-6" fill="currentColor" aria-hidden="true" />
          </span>
          <span>{t("app_name")}</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1">
          {user ? (
            <>
              <Link
                to="/app/grid"
                className="rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_grid")}
              </Link>
              <Link
                to="/app/chat"
                className="rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_chat")}
              </Link>
              <Link
                to="/app/me"
                className="rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_me")}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title={t("logout")}
                aria-label={t("logout")}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              {marketingLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-full px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild className="ml-2">
                <Link to="/auth">{t("cta_login")}</Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="ml-2 uppercase"
            aria-label={lang === "fr" ? "Switch to English" : "Passer en français"}
          >
            {lang}
          </Button>
        </nav>

        {/* Mobile burger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Navigation mobile"
          className="lg:hidden max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border bg-background px-4 py-4 flex flex-col gap-2 shadow-[var(--shadow-surface)] sm:px-6"
        >
          {user ? (
            <>
              <Link
                onClick={() => setOpen(false)}
                to="/app/grid"
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_grid")}
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="/app/chat"
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_chat")}
              </Link>
              <Link
                onClick={() => setOpen(false)}
                to="/app/me"
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {t("nav_me")}
              </Link>
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="justify-start"
              >
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              {marketingLinks.map((l) => (
                <Link
                  key={l.to}
                  onClick={() => setOpen(false)}
                  to={l.to}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
                  activeProps={{ className: "bg-secondary text-primary" }}
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild className="mt-2">
                <Link onClick={() => setOpen(false)} to="/auth">
                  {t("cta_login")}
                </Link>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="justify-start"
          >
            {lang === "fr" ? "English" : "Français"}
          </Button>
        </nav>
      )}
    </header>
  );
}
