import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, MapPin, PartyPopper, Plus, Users } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/parties/")({ component: PartiesList });

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const priceFormat = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

const tabs = [
  { value: "all", label: "Tous" },
  { value: "host", label: "Mes soirées" },
] as const;

const statusLabels = new Map([
  ["open", "Ouvert"],
  ["full", "Complet"],
  ["closed", "Inscriptions fermées"],
]);

function PartiesList() {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]["value"]>("all");

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["parties", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parties")
        .select(
          "id, title, city, starts_at, max_participants, is_paid, price_cents, status, host_id",
        )
        .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const list = (data ?? []).filter((party) => tab === "all" || party.host_id === user?.id);

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-3 pt-5 pb-24 sm:px-6 sm:pt-9">
        <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="font-display text-2xl sm:text-4xl">Événements</h1>
          <Link
            to="/app/parties/new"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-primary transition-colors hover:bg-secondary sm:px-4"
          >
            <Plus className="size-4" aria-hidden="true" />
            Organiser<span className="hidden sm:inline">une soirée</span>
          </Link>
        </header>

        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={tab === value}
              onClick={() => setTab(value)}
              className="group inline-flex min-h-11 items-center rounded-full text-sm font-semibold"
            >
              <span
                className={
                  tab === value
                    ? "rounded-full bg-linear-to-r from-[#ad0dc8] to-[#5a16dc] px-5 py-1.5 text-white"
                    : "rounded-full bg-secondary px-5 py-1.5 text-muted-foreground transition-colors group-hover:text-primary"
                }
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2">
          {isPending && (
            <p role="status" className="p-6 text-sm text-muted-foreground">
              Chargement des événements…
            </p>
          )}
          {isError && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p role="alert" className="text-sm text-destructive">
                Les événements n’ont pas pu être chargés.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex min-h-11 items-center rounded-full text-sm font-semibold text-primary hover:underline"
              >
                Réessayer
              </button>
            </div>
          )}
          {!isPending && !isError && list.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <CalendarDays className="mx-auto mb-3 size-7 text-primary" aria-hidden="true" />
              <p className="font-semibold">
                {tab === "host"
                  ? "Tu n’organises aucune soirée pour le moment."
                  : "Aucun événement à venir."}
              </p>
              <Link
                to="/app/parties/new"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
              >
                Organiser ma soirée
              </Link>
            </div>
          )}
          {list.length > 0 && (
            <ul className="space-y-2">
              {list.map((party) => {
                const isHost = party.host_id === user?.id;
                const canRequest = party.status === "open" && !isHost;
                const statusLabel = statusLabels.get(party.status);

                return (
                  <li key={party.id}>
                    <Link
                      to="/app/parties/$id"
                      params={{ id: party.id }}
                      className="group grid min-h-24 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-2 overflow-hidden rounded-xl border border-[#42236d] bg-linear-to-r from-[#170a2c] to-[#100921] pr-2 text-white transition-colors hover:border-[#aa57e0] min-[380px]:grid-cols-[4.75rem_minmax(0,1fr)_auto] sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-4 sm:pr-4"
                    >
                      <span
                        className="grid h-full place-items-center border-r border-white/10 bg-[radial-gradient(ellipse_at_25%_18%,#921794,transparent_70%),linear-gradient(155deg,#4a146b,#1c103b_85%)] text-fuchsia-100"
                        aria-hidden="true"
                      >
                        <PartyPopper className="size-6 drop-shadow-[0_0_9px_#f0abfc] sm:size-8" />
                      </span>
                      <div className="min-w-0 py-2">
                        <h2 className="font-bold [overflow-wrap:anywhere]">{party.title}</h2>
                        <div className="mt-0.5 flex items-start gap-1.5 text-xs text-violet-100 sm:text-sm">
                          <Clock className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                          <time dateTime={party.starts_at}>
                            {dateFormat.format(new Date(party.starts_at))}
                          </time>
                        </div>
                        <div className="mt-0.5 flex items-start gap-1.5 text-xs text-violet-100 sm:text-sm">
                          <MapPin className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                          <span className="[overflow-wrap:anywhere]">{party.city}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-violet-200">
                          <span className="flex items-center gap-1">
                            <Users className="size-3 shrink-0" aria-hidden="true" />
                            {party.max_participants} max.
                          </span>
                          {party.is_paid && party.price_cents != null && (
                            <span>{priceFormat.format(party.price_cents / 100)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex max-w-24 flex-col items-center gap-1.5 text-center sm:max-w-none">
                        <span
                          className={
                            canRequest
                              ? "grid min-h-9 place-items-center rounded-full bg-linear-to-r from-[#b40bc7] to-[#6a16e3] px-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffff66,0_0_17px_#961fe655] sm:px-4 sm:text-sm"
                              : "grid min-h-9 place-items-center rounded-full border border-[#a154e7] px-2 text-xs font-semibold text-violet-100 group-hover:bg-[#31164b] sm:px-4 sm:text-sm"
                          }
                        >
                          {isHost ? "Gérer" : canRequest ? "Participer" : "Infos"}
                        </span>
                        {statusLabel && (
                          <span className="text-[11px] leading-tight font-medium text-violet-200">
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
