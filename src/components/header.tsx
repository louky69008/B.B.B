import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, LogOut } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Heart className="size-5 text-[color:var(--neon-magenta)]" fill="currentColor" />
          <span>{t("app_name").split("").map((c, i) => i === 0 ? <span key={i} className="text-[color:var(--neon-magenta)]">{c}</span> : c)}</span>
        </Link>
        <nav className="flex items-center gap-1">
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
            <Link to="/auth" className="neon-btn">
              {t("cta_login")}
            </Link>
          )}
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="ml-3 border border-white/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9b94bf] hover:border-[color:var(--neon-cyan)] hover:text-[color:var(--neon-cyan)]"
          >
            {lang}
          </button>
        </nav>
      </div>
    </header>

  );
}
