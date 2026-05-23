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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Heart className="size-5 text-[color:var(--neon-magenta)]" fill="currentColor" />
          <span>{t("app_name").split("").map((c, i) => i === 0 ? <span key={i} className="text-[color:var(--neon-magenta)]">{c}</span> : c)}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/app/grid" className="px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8] hover:text-[color:var(--neon-cyan)]">
                {t("nav_grid")}
              </Link>
              <Link to="/app/chat" className="px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8] hover:text-[color:var(--neon-cyan)]">
                {t("nav_chat")}
              </Link>
              <Link to="/app/me" className="px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8] hover:text-[color:var(--neon-cyan)]">
                {t("nav_me")}
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} title={t("logout")}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              {marketingLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8] hover:text-[color:var(--neon-cyan)]"
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/auth" className="neon-btn ml-2">
                {t("cta_login")}
              </Link>
            </>
          )}
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="ml-3 border border-white/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9b94bf] hover:border-[color:var(--neon-cyan)] hover:text-[color:var(--neon-cyan)]"
          >
            {lang}
          </button>
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-[#bdb7d8]"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link onClick={() => setOpen(false)} to="/app/grid" className="font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8]">{t("nav_grid")}</Link>
              <Link onClick={() => setOpen(false)} to="/app/chat" className="font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8]">{t("nav_chat")}</Link>
              <Link onClick={() => setOpen(false)} to="/app/me" className="font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8]">{t("nav_me")}</Link>
              <button onClick={() => { setOpen(false); logout(); }} className="text-left font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8]">{t("logout")}</button>
            </>
          ) : (
            <>
              {marketingLinks.map((l) => (
                <Link key={l.to} onClick={() => setOpen(false)} to={l.to} className="font-mono text-xs uppercase tracking-[0.18em] text-[#bdb7d8]">
                  {l.label}
                </Link>
              ))}
              <Link onClick={() => setOpen(false)} to="/auth" className="neon-btn w-fit">{t("cta_login")}</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
