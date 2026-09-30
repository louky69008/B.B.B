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
    <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-black border-t border-neutral-800 z-30">
      <div className="flex justify-around items-stretch py-1.5 pb-5">
        {items.map((it, i) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          const color = it.accent
            ? "text-yellow-400"
            : active
              ? "text-yellow-400"
              : "text-neutral-400";
          const badge = it.badgeKey ? counts[it.badgeKey] : 0;
          return (
            <Link
              key={i}
              to={it.to}
              className="flex flex-col items-center justify-center gap-0.5 px-1 flex-1 min-w-0"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${color}`} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-black">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none ${color} truncate max-w-full`}>
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
