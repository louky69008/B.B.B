import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { ArrowRight, Plus, MapPin, Users, CalendarDays, Euro, PartyPopper } from "lucide-react";

export const Route = createFileRoute("/app/parties/")({ component: PartiesList });

type Party = {
  id: string;
  title: string;
  city: string;
  starts_at: string;
  max_participants: number;
  is_paid: boolean;
  price_cents: number | null;
  status: string;
  host_id: string;
};

function PartiesList() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"search" | "host">("search");

  const { data, isPending, isError } = useQuery({
    queryKey: ["parties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parties")
        .select(
          "id, title, city, starts_at, max_participants, is_paid, price_cents, status, host_id",
        )
        .gte("starts_at", new Date(Date.now() - 6 * 3600_000).toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data as Party[];
    },
  });

  const hostParties = data?.filter((p) => p.host_id === user?.id) ?? [];
  const list = tab === "host" ? hostParties : (data ?? []);

  return (
    <main className="min-h-screen bg-secondary/40 text-foreground">
      <div className="mx-auto max-w-4xl px-4 pt-7 pb-24 sm:px-6 sm:pt-12">
        <header className="flex flex-wrap items-end justify-between gap-5 rounded-3xl border border-border bg-linear-to-br from-white to-violet-100/75 p-5 sm:p-8">
          <div>
            <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-neon)]">
              <PartyPopper className="size-5" aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl sm:text-5xl">Soirées appart’</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Retrouve la communauté en soirée ou organise la tienne.
            </p>
          </div>
          <Link to="/app/parties/new" className="neon-btn">
            <Plus className="size-4" aria-hidden="true" /> Organiser une soirée
          </Link>
        </header>

        <div className="mt-6">
          <div className="inline-flex gap-1 rounded-full border border-border bg-card p-1">
            <button
              type="button"
              aria-pressed={tab === "search"}
              onClick={() => setTab("search")}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                tab === "search"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              À venir
            </button>
            <button
              type="button"
              aria-pressed={tab === "host"}
              onClick={() => setTab("host")}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
                tab === "host"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              Mes soirées
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {isPending && (
            <p role="status" className="p-6 text-sm text-muted-foreground">
              Chargement des soirées…
            </p>
          )}
          {isError && (
            <p role="alert" className="p-6 text-sm text-destructive">
              Les soirées n’ont pas pu être chargées.
            </p>
          )}
          {!isPending && !isError && list.length === 0 && (
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <CalendarDays className="mx-auto mb-3 size-7 text-primary" aria-hidden="true" />
              <p className="font-semibold">
                {tab === "host"
                  ? "Tu n’organises aucune soirée pour le moment."
                  : "Aucune soirée à venir."}
              </p>
              <Link
                to="/app/parties/new"
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline"
              >
                Organiser ma soirée
              </Link>
            </div>
          )}
          {list.map((p) => (
            <Link
              key={p.id}
              to="/app/parties/$id"
              params={{ id: p.id }}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/45 sm:gap-5 sm:p-4"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-neon-magenta to-primary text-white sm:size-16">
                <CalendarDays className="size-5 sm:size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold sm:text-lg">{p.title}</h2>
                <p className="mt-1 text-xs font-semibold text-primary sm:text-sm">
                  {new Date(p.starts_at).toLocaleString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" aria-hidden="true" />
                    {p.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" aria-hidden="true" />
                    {p.max_participants} max
                  </span>
                  {p.is_paid && !!p.price_cents && (
                    <span className="flex items-center gap-1">
                      <Euro className="size-3" aria-hidden="true" />
                      {(p.price_cents / 100).toFixed(2)}
                    </span>
                  )}
                  {p.host_id === user?.id && (
                    <span className="font-semibold text-primary">Hôte</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.status === "open"
                      ? "bg-emerald-50 text-emerald-800"
                      : p.status === "full"
                        ? "bg-orange-50 text-orange-800"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.status === "open" ? "Ouvert" : p.status === "full" ? "Complet" : "Terminé"}
                </span>
                <ArrowRight
                  className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
