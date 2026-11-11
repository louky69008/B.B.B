import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import heroCouple from "@/assets/hero-couple.png";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "B.B.B — Rencontres LGBT+" }] }),
  component: Landing,
});

const copy = {
  fr: {
    heading: ["Rencontres", "LGBT+"],
    intro: "Des connexions vraies pour des histoires uniques.",
    heroAlt:
      "Deux hommes s’enlacent, l’un embrassant l’autre sur la joue sous des lumières violettes",
    adults: "Réservé aux adultes de 18 ans et plus",
    signup: "Créer un compte",
    discover: "Découvrir l’app",
    highlights: [
      "Rencontres sérieuses ou sans prise de tête",
      "Communauté bienveillante",
      "Événements et sorties LGBT+",
      "Profils avec option de vérification",
      "Options de confidentialité",
    ],
    community: "Rencontre la communauté",
    profiles: "Profils et matchs",
    profilesBody: "Explore les profils et découvre avec qui le courant passe.",
    messages: "Messages privés",
    messagesBody: "Échange en privé et apprends à connaître tes matchs à ton rythme.",
    safety: "Confiance et consentement",
    safetyBody: "Profils vérifiés, blocage et signalement pour garder la main sur tes échanges.",
    events: "Soirées entre membres",
    eventsBody: "Trouve une soirée près de chez toi ou organise la tienne.",
    eventsCta: "Voir les soirées",
    premiumBody: "Affine tes recherches avec les filtres avancés et découvre plus de profils.",
    premiumCta: "Comparer les offres",
  },
  en: {
    heading: ["LGBT+", "Dating"],
    intro: "Real connections for unique stories.",
    heroAlt: "Two men embrace, one kissing the other on the cheek under purple lights",
    adults: "For adults aged 18 and over",
    signup: "Create an account",
    discover: "Discover the app",
    highlights: [
      "Serious or casual dating",
      "Welcoming community",
      "LGBT+ events and outings",
      "Optional profile verification",
      "Privacy settings",
    ],
    community: "Meet the community",
    profiles: "Profiles and matches",
    profilesBody: "Browse profiles and see who you connect with.",
    messages: "Private messages",
    messagesBody: "Chat privately and get to know your matches at your own pace.",
    safety: "Trust and consent",
    safetyBody:
      "Verified profiles, blocking and reporting put you in control of your conversations.",
    events: "Community events",
    eventsBody: "Find an event near you or host your own.",
    eventsCta: "Explore events",
    premiumBody: "Narrow your search with advanced filters and discover more profiles.",
    premiumCta: "Compare plans",
  },
} as const;

const highlightIcons = [UsersRound, Heart, CalendarDays, ShieldCheck, LockKeyhole];

function Landing() {
  const { user } = useAuth();
  const { lang, t } = useI18n();
  const content = copy[lang];

  const features = [
    {
      icon: Heart,
      title: content.profiles,
      body: content.profilesBody,
      accent: "bg-pink-100 text-pink-800",
    },
    {
      icon: MessageCircle,
      title: content.messages,
      body: content.messagesBody,
      accent: "bg-violet-100 text-violet-800",
    },
    {
      icon: ShieldCheck,
      title: content.safety,
      body: content.safetyBody,
      accent: "bg-indigo-100 text-indigo-800",
    },
  ];

  return (
    <main className="bg-[#f4f5fc] text-foreground" lang={lang}>
      <section
        aria-labelledby="landing-title"
        className="mx-auto max-w-[88rem] overflow-hidden bg-white sm:rounded-b-3xl"
      >
        <div className="relative mx-auto grid max-w-[78rem] items-center gap-6 px-5 pt-9 pb-10 sm:px-9 md:grid-cols-[47%_53%] md:gap-0 md:pt-14 md:pb-14 lg:pt-20 lg:pb-20">
          <div className="relative z-10 min-w-0">
            <h1
              id="landing-title"
              className="font-display text-[clamp(2.95rem,7.1vw,6.4rem)] leading-[0.93] tracking-[-0.075em]"
            >
              {content.heading.map((word) => (
                <span
                  key={word}
                  className={
                    word === "LGBT+"
                      ? "block w-fit bg-[linear-gradient(125deg,#3000ff_15%,#a300ff_49%,#f700ce_78%)] bg-clip-text pb-[0.09em] text-transparent"
                      : "block w-fit bg-[linear-gradient(98deg,#100936_13%,#21064f_47%,#ec009e_99%)] bg-clip-text pb-[0.08em] text-transparent"
                  }
                >
                  {word}{" "}
                </span>
              ))}
            </h1>

            <p className="mt-2 max-w-[29rem] text-[clamp(1.3rem,3vw,2.4rem)] leading-[1.16] tracking-tight text-[#21164f]">
              {content.intro}
            </p>

            <ul className="mt-5 grid gap-1.5 sm:mt-6 sm:gap-2">
              {content.highlights.map((label, index) => {
                const Icon = highlightIcons[index];
                return (
                  <li
                    key={label}
                    className="flex items-center gap-2.5 text-sm text-[#3b306d] sm:gap-3 sm:text-base"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#ffd7f2] text-[#d100a8] sm:size-8">
                      <Icon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    {label}
                  </li>
                );
              })}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              {user ? (
                <Link to="/app/grid" className="neon-btn">
                  {t("nav_grid")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link to="/auth" search={{ mode: "signup" }} className="neon-btn">
                  {content.signup}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              <a href="#decouvrir" className="neon-btn neon-btn-ghost">
                {content.discover}
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {content.adults}
            </p>
          </div>

          <div className="relative min-w-0 md:-mt-5 md:-ml-6 md:self-start lg:-mt-8 lg:-ml-8">
            <img
              src={heroCouple}
              alt={content.heroAlt}
              width={354}
              height={274}
              fetchPriority="high"
              className="block h-auto w-full object-contain [mask-composite:intersect] [mask-image:linear-gradient(to_bottom,black_83%,transparent_100%),linear-gradient(to_right,transparent,black_6%)]"
            />
          </div>
        </div>
      </section>

      <section
        id="decouvrir"
        aria-labelledby="community-title"
        className="mx-auto max-w-[88rem] scroll-mt-28 px-5 pt-12 pb-14 sm:px-9 sm:pt-16 sm:pb-20"
      >
        <h2
          id="community-title"
          className="text-center font-display text-3xl leading-tight text-balance sm:text-4xl"
        >
          {content.community}
        </h2>

        <ul className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
          {features.map(({ icon: Icon, title, body, accent }) => (
            <li
              key={title}
              className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-surface)] sm:p-6"
            >
              <span
                className={`inline-flex size-12 items-center justify-center rounded-2xl ${accent}`}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold leading-snug">{title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-6">
          <section
            aria-labelledby="events-title"
            className="flex flex-col items-start rounded-3xl border border-border bg-linear-to-br from-pink-50 to-white p-5 sm:p-7"
          >
            <CalendarDays className="size-6 text-pink-700" aria-hidden="true" />
            <h3 id="events-title" className="mt-4 font-display text-2xl">
              {content.events}
            </h3>
            <p className="mt-2 grow text-sm leading-relaxed text-muted-foreground">
              {content.eventsBody}
            </p>
            <Link
              to="/app/parties"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline"
            >
              {content.eventsCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>

          <section
            aria-labelledby="premium-title"
            className="flex flex-col items-start rounded-3xl border border-border bg-linear-to-br from-violet-100 to-white p-5 sm:p-7"
          >
            <Sparkles className="size-6 text-violet-700" aria-hidden="true" />
            <h3 id="premium-title" className="mt-4 font-display text-2xl">
              {t("plan_premium")}
            </h3>
            <p className="mt-2 grow text-sm leading-relaxed text-muted-foreground">
              {content.premiumBody}
            </p>
            <Link
              to="/tarifs"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline"
            >
              {content.premiumCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
