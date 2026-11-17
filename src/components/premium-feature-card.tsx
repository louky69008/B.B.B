import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Crown } from "lucide-react";
import couplePhoto from "@/assets/hero-couple.png";
import { getTierConfig } from "@/lib/subscriptions";

export function PremiumFeatureCard({ plansSection = false }: { plansSection?: boolean }) {
  const premium = getTierConfig("premium");
  const actionClass =
    "relative flex min-h-11 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#b40bc7] via-[#8c13dd] to-[#5919db] px-4 py-2 text-center text-sm font-bold text-white shadow-[inset_0_1px_5px_#ffffff60,0_5px_24px_#9b1bdf55] transition-shadow hover:shadow-[inset_0_1px_7px_#ffffff80,0_5px_28px_#9b1bdf88] focus-visible:outline-white";
  const actionLabel = (
    <>
      Passer en Premium <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
    </>
  );

  return (
    <aside className="relative isolate overflow-hidden rounded-2xl bg-[#130a25] p-4 text-white shadow-[0_8px_26px_#26124526] sm:p-5">
      <img
        src={couplePhoto}
        alt=""
        width={354}
        height={274}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 right-0 -z-20 h-full w-[63%] object-cover object-center opacity-75"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#130a25_25%,#130a25ef_43%,#30084133_100%),linear-gradient(0deg,#130a25,transparent_70%)]"
        aria-hidden="true"
      />
      <div className="mb-4 min-h-24">
        <h2 className="flex items-center gap-2.5 text-lg leading-tight font-bold sm:text-xl">
          <Crown className="size-7 shrink-0 fill-amber-300/20 text-amber-300" aria-hidden="true" />
          B.B.B Premium
        </h2>
        <p className="mt-2.5 flex items-center gap-2 text-sm font-medium">
          <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#c9167e]">
            <Check className="size-3" aria-hidden="true" />
          </span>
          Jusqu’à {premium.profileLimit} profils à découvrir
        </p>
      </div>
      {plansSection ? (
        <a href="#plans" className={actionClass}>
          {actionLabel}
        </a>
      ) : (
        <Link to="/app/subscribe" className={actionClass}>
          {actionLabel}
        </Link>
      )}
    </aside>
  );
}
