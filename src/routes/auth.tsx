import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Heart, KeyRound, LockKeyhole, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type AuthMode = "login" | "signup" | "forgot" | "recovery";
type AuthSearch = { mode?: "signup" | "recovery" };

const fieldClass = "h-12 rounded-xl border-[#e1dcef] bg-[#faf9fe] px-4 shadow-none";
const textLinkClass =
  "inline-flex min-h-10 items-center rounded-md font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "signup" || search.mode === "recovery" ? search.mode : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<AuthMode>(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(search.mode ?? "login");
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

  const fr = lang === "fr";
  const copy = {
    login: {
      title: t("login"),
      description: fr ? "Ravi de te revoir sur B.B.B." : "Welcome back to B.B.B.",
      action: t("cta_login"),
      Icon: Heart,
    },
    signup: {
      title: t("signup"),
      description: fr ? "Rejoins la communauté B.B.B." : "Join the B.B.B. community.",
      action: fr ? "Créer un compte" : "Create an account",
      Icon: UserRoundPlus,
    },
    forgot: {
      title: fr ? "Mot de passe oublié" : "Forgot password",
      description: fr
        ? "Tu recevras un lien sécurisé pour choisir un nouveau mot de passe."
        : "We’ll send you a secure link to choose a new password.",
      action: fr ? "Envoyer le lien" : "Send the link",
      Icon: KeyRound,
    },
    recovery: {
      title: fr ? "Définir un nouveau mot de passe" : "Choose a new password",
      description: fr
        ? "Choisis un mot de passe unique d’au moins 8 caractères."
        : "Choose a unique password with at least 8 characters.",
      action: fr ? "Enregistrer le mot de passe" : "Save password",
      Icon: LockKeyhole,
    },
  }[mode];

  return (
    <main className="bg-[#f4f5fc] px-4 py-7 text-[#100936] sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[27rem]">
        <Link to="/" className={`${textLinkClass} mb-3 gap-2 text-sm`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {fr ? "Accueil" : "Home"}
        </Link>
        <section
          aria-labelledby="auth-title"
          className="rounded-[1.6rem] border border-[#eeebf8] bg-white px-6 py-7 shadow-[0_10px_34px_#2920640b] sm:px-9 sm:py-9"
        >
          <div className="text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[#fbe8fc] text-primary">
              <copy.Icon className="size-6" aria-hidden="true" />
            </span>
            <h1 id="auth-title" className="font-display text-3xl leading-tight font-bold">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#514982]">{copy.description}</p>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <div className="grid gap-2">
                <Label htmlFor="pseudo">{t("pseudo")}</Label>
                <Input
                  id="pseudo"
                  className={fieldClass}
                  autoComplete="nickname"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  required
                  minLength={2}
                  maxLength={30}
                />
              </div>
            )}
            {mode !== "recovery" && (
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  className={fieldClass}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            {mode !== "forgot" && (
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {mode === "recovery"
                    ? fr
                      ? "Nouveau mot de passe"
                      : "New password"
                    : t("password")}
                </Label>
                <Input
                  id="password"
                  className={fieldClass}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "recovery" ? 8 : 6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            )}
            {mode === "recovery" && (
              <div className="grid gap-2">
                <Label htmlFor="password-confirmation">
                  {fr ? "Confirmer le mot de passe" : "Confirm password"}
                </Label>
                <Input
                  id="password-confirmation"
                  className={fieldClass}
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
              <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-[#514982]">
                <Checkbox
                  className="size-[1.125rem] border-[#9c91ba]"
                  checked={adult}
                  onCheckedChange={(v) => setAdult(v === true)}
                />
                {t("age_confirm")}
              </label>
            )}
            <button
              type="submit"
              disabled={busy}
              className="neon-btn min-h-12 w-full gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {copy.action}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          {mode !== "recovery" && (
            <div className="mt-3 text-center text-sm text-[#514982]">
              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot")} className={textLinkClass}>
                  {fr ? "Mot de passe oublié ?" : "Forgot your password?"}
                </button>
              )}
              {mode === "forgot" ? (
                <button type="button" onClick={() => setMode("login")} className={textLinkClass}>
                  {fr ? "Retour à la connexion" : "Back to log in"}
                </button>
              ) : (
                <p className="mt-1 flex flex-wrap items-center justify-center gap-x-1.5 border-t border-[#eeebf8] pt-2">
                  {mode === "login" ? t("no_account") : t("have_account")}
                  <Link
                    to="/auth"
                    search={{ mode: mode === "login" ? "signup" : undefined }}
                    className={textLinkClass}
                  >
                    {mode === "login" ? (fr ? "S’inscrire" : "Sign up") : t("cta_login")}
                  </Link>
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
