import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const { t } = useI18n();

  const plans = [
    { name: t("plan_free"), price: t("plan_free_price"), desc: t("plan_free_desc"), highlight: false },
    { name: t("plan_basic"), price: t("plan_basic_price"), desc: t("plan_basic_desc"), highlight: false },
    { name: t("plan_premium"), price: t("plan_premium_price"), desc: t("plan_premium_desc"), highlight: true },
    { name: t("plan_ultra"), price: t("plan_ultra_price"), desc: t("plan_ultra_desc"), highlight: false },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{ background: "var(--gradient-pride)" }}
        />
        <div className="absolute inset-0 -z-10 bg-background/60" />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary" /> {t("no_shareholders")}
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {t("landing_hero")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            {t("landing_sub")}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Heart className="size-4" fill="currentColor" /> {t("cta_join")}
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">{t("cta_login")}</Button>
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t("tagline")}</p>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">{t("pricing_title")}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border p-6 ${
                p.highlight
                  ? "border-primary bg-gradient-to-b from-primary/15 to-card"
                  : "border-border bg-card"
              }`}
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-2 text-2xl font-bold text-primary">{p.price}</p>
              <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="size-4 text-primary" />
          Nos prix ne changent pas sans préavis de 3 mois.
        </div>
      </section>
    </main>
  );
}
