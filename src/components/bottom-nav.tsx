import { Link, useLocation } from "@tanstack/react-router";
import { Heart, MessageSquare, User, Crown, PartyPopper, Grid3x3 } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

type Item = {
  to: string;
  label: string;
  icon: typeof Heart;
  accent?: boolean;
  badgeKey?: "messages" | "parties";
};

const items: Item[] = [
  { to: "/app/grid", label: "Grille", icon: Grid3x3 },
  { to: "/app/parties", label: "Soirée appart'", icon: PartyPopper, badgeKey: "parties" },
  { to: "/app/matches", label: "Matchs", icon: Heart },
  { to: "/app/chat", label: "Messages", icon: MessageSquare, badgeKey: "messages" },
  { to: "/app/subscribe", label: "Premium", icon: Crown, accent: true },
  { to: "/app/me", label: "Moi", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { counts } = useNotifications();
  return (
    <nav
      aria-label="Navigation de l’application"
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] rounded-t-2xl bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_24px_rgba(32,16,57,0.06)] z-30"
    >
      <div className="flex justify-around items-stretch px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((it) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          const color = it.accent
            ? "text-neon-magenta"
            : active
              ? "text-primary"
              : "text-muted-foreground";
          const badge = it.badgeKey ? counts[it.badgeKey] : 0;
          return (
            <Link
              key={it.to}
              to={it.to}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 flex-1 min-w-0 transition-colors hover:bg-secondary ${active ? "bg-secondary" : ""}`}
            >
              <div className="relative">
                <Icon className={`size-5 ${color}`} aria-hidden="true" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-neon-magenta text-primary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-background">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium leading-tight ${color} truncate max-w-full`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
