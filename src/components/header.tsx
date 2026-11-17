import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Heart, Link2, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

const navLink =
  "flex min-h-11 items-center px-2.5 text-[0.85rem] font-medium text-muted-foreground transition-colors hover:text-primary lg:border-b-2 lg:border-transparent";

const activeLink = { className: "text-primary lg:border-b-neon-magenta" };

export function Header() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const compact = useLocation({ select: (location) => location.pathname === "/app/grid" });
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const french = lang === "fr";

  const logout = async () => {
    close();
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const links = user
    ? ([
        { to: "/app/grid", label: french ? "Découvrir" : "Discover" },
        { to: "/app/parties", label: french ? "Soirées" : "Events" },
        { to: "/app/matches", label: "Likes" },
        { to: "/app/chat", label: t("nav_chat") },
        { to: "/app/subscribe", label: "Premium" },
        { to: "/app/me", label: t("nav_me") },
      ] as const)
    : ([
        { to: "/", label: french ? "Accueil" : "Home" },
        { to: "/", hash: "decouvrir", label: french ? "Découvrir" : "Discover" },
        { to: "/app/parties", label: french ? "Événements" : "Events" },
        { to: "/a-propos", label: french ? "Communauté" : "Community" },
        { to: "/tarifs", label: "Premium" },
      ] as const);

  const renderLinks = () => (
    <>
      {links.map(({ to, label, ...options }) => (
        <Link
          key={label}
          to={to}
          hash={"hash" in options ? options.hash : undefined}
          onClick={close}
          className={navLink}
          activeOptions={{ exact: to === "/", includeHash: to === "/" }}
          activeProps={activeLink}
        >
          {label}
        </Link>
      ))}
      {user ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title={t("logout")}
          aria-label={t("logout")}
        >
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 py-1 lg:py-0">
          <Link to="/auth" onClick={close} className="neon-btn neon-btn-ghost !px-4">
            {french ? "Connexion" : "Log in"}
          </Link>
          <Link to="/auth" search={{ mode: "signup" }} onClick={close} className="neon-btn !px-4">
            {french ? "S’inscrire" : "Sign up"}
          </Link>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLang(french ? "en" : "fr")}
        className="self-start rounded-full font-bold text-muted-foreground uppercase lg:self-center"
        aria-label={french ? "Switch to English" : "Passer en français"}
      >
        {lang}
      </Button>
    </>
  );

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-7 lg:h-20 lg:px-10 ${compact ? "h-14" : "h-17"}`}
      >
        <Link to="/" onClick={close} className="flex shrink-0 items-center gap-2.5 rounded-xl">
          <span className="relative grid size-11 place-items-center">
            <Heart
              className="size-11"
              fill="url(#bbb-header-heart)"
              stroke="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="bbb-header-heart" x2="75%" y2="100%">
                  <stop stopColor="#fc00e4" />
                  <stop offset="1" stopColor="#5600f9" />
                </linearGradient>
              </defs>
            </Heart>
            <Link2 className="absolute size-[1.15rem] -rotate-45 text-white" aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[1.65rem] leading-none text-foreground sm:text-[1.85rem]">
              B.B.B
            </span>
            <span className="mt-0.5 text-[0.6rem] leading-tight text-muted-foreground">
              Boys · Boys · Belong
            </span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {renderLinks()}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </Button>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Navigation mobile"
          className="flex max-h-[calc(100dvh-4.25rem)] flex-col gap-1 overflow-y-auto border-t border-border bg-background p-4 shadow-[var(--shadow-surface)] sm:px-7 lg:hidden"
        >
          {renderLinks()}
        </nav>
      )}
    </header>
  );
}
