import { Link, useLocation } from "@tanstack/react-router";
import { Heart, MessageSquare, User, Crown, PartyPopper, Grid3x3 } from "lucide-react";

const items = [
  { to: "/app/grid", label: "Grille", icon: Grid3x3 },
  { to: "/app/parties", label: "Soirées", icon: PartyPopper },
  { to: "/app/chat", label: "Matchs", icon: Heart },
  { to: "/app/chat", label: "Messages", icon: MessageSquare, key: "msg" },
  { to: "/app/subscribe", label: "Premium", icon: Crown, accent: true },
  { to: "/app/me", label: "Moi", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-black border-t border-neutral-800 z-30">
      <div className="flex justify-around items-stretch py-1.5 pb-5">
        {items.map((it, i) => {
          const Icon = it.icon;
          const active = pathname.startsWith(it.to);
          const color = it.accent
            ? "text-yellow-400"
            : active
            ? "text-yellow-400"
            : "text-neutral-400";
          return (
            <Link
              key={i}
              to={it.to}
              className="flex flex-col items-center justify-center gap-0.5 px-1 flex-1 min-w-0"
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <span className={`text-[10px] leading-none ${color} truncate max-w-full`}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
