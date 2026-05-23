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
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Heart className="size-5 text-primary" fill="currentColor" />
          <span>{t("app_name")}</span>
        </Link>
        <nav className="flex items-center gap-1">
          {user ? (
            <>
              <Link to="/app/grid" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent/20">
                {t("nav_grid")}
              </Link>
              <Link to="/app/chat" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent/20">
                {t("nav_chat")}
              </Link>
              <Link to="/app/me" className="rounded-md px-3 py-1.5 text-sm hover:bg-accent/20">
                {t("nav_me")}
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} title={t("logout")}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm">{t("cta_login")}</Button>
            </Link>
          )}
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="ml-2 rounded-md border border-border px-2 py-1 text-xs uppercase text-muted-foreground hover:text-foreground"
          >
            {lang}
          </button>
        </nav>
      </div>
    </header>
  );
}
