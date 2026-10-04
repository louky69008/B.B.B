import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot" | "recovery";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "recovery" ? ("recovery" as const) : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<AuthMode>(search.mode === "recovery" ? "recovery" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (search.mode === "recovery") setMode("recovery");
  }, [search.mode]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || mode === "recovery") return;

    let cancelled = false;
    const redirectAuthenticatedUser = async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancelled) return;
      const destination = (data ?? []).some(({ role }) => role === "admin")
        ? "/app/admin"
        : "/app/grid";
      navigate({ to: destination });
    };

    void redirectAuthenticatedUser();
    return () => {
      cancelled = true;
    };
  }, [user, mode, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=recovery`,
        });
        if (error) throw error;
        toast.success("Si ce compte existe, un lien de récupération vient d’être envoyé.");
        setMode("login");
        return;
      }

      if (mode === "recovery") {
        if (password.length < 8) {
          toast.error("Le mot de passe doit contenir au moins 8 caractères.");
          return;
        }
        if (password !== passwordConfirmation) {
          toast.error("Les mots de passe ne correspondent pas.");
          return;
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Mot de passe défini. Votre accès administrateur est prêt.");
        navigate({ to: "/app/admin" });
        return;
      }

      if (mode === "signup") {
        if (!adult) {
          toast.error("Vous devez avoir 18 ans ou plus.");
          return;
        }
        if (pseudo.length < 2) {
          toast.error("Pseudo trop court");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app/grid`,
            data: { pseudo },
          },
        });
        if (error) throw error;
        toast.success("Compte créé ! Vérifie ton email pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signup"
      ? t("signup")
      : mode === "forgot"
        ? "Mot de passe oublié"
        : mode === "recovery"
          ? "Définir un nouveau mot de passe"
          : t("login");

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {mode === "forgot" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.
          </p>
        )}
        {mode === "recovery" && (
          <p className="mt-2 text-sm text-muted-foreground">
            Choisissez un mot de passe unique d’au moins 8 caractères.
          </p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="pseudo">{t("pseudo")}</Label>
              <Input
                id="pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                required
                minLength={2}
                maxLength={30}
              />
            </div>
          )}
          {mode !== "recovery" && (
            <div>
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password">
                {mode === "recovery" ? "Nouveau mot de passe" : t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "recovery" ? 8 : 6}
                autoComplete={mode === "recovery" ? "new-password" : "current-password"}
              />
            </div>
          )}
          {mode === "recovery" && (
            <div>
              <Label htmlFor="password-confirmation">Confirmer le mot de passe</Label>
              <Input
                id="password-confirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          )}
          {mode === "signup" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={adult} onCheckedChange={(v) => setAdult(v === true)} />
              {t("age_confirm")}
            </label>
          )}
          <Button type="submit" disabled={busy} className="w-full">
            {mode === "signup"
              ? t("signup")
              : mode === "forgot"
                ? "Envoyer le lien"
                : mode === "recovery"
                  ? "Enregistrer le mot de passe"
                  : t("login")}
          </Button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setMode("forgot")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Mot de passe oublié ?
          </button>
        )}

        {mode !== "recovery" && (
          <button
            type="button"
            onClick={() =>
              setMode(mode === "signup" ? "login" : mode === "login" ? "signup" : "login")
            }
            className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signup"
              ? t("have_account")
              : mode === "login"
                ? t("no_account")
                : "Retour à la connexion"}
          </button>
        )}
      </div>
    </main>
  );
}
