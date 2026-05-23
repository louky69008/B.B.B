import { createFileRoute, Link } from "@tanstack/react-router";
import heroNeon from "@/assets/hero-neon.jpg";
import { Heart, PartyPopper, MessageCircle, User } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main
      className="min-h-screen w-full flex justify-center items-start"
      style={{
        background:
          "radial-gradient(circle at 30% 10%, #2a0a3a 0%, #0a0014 55%, #000 100%)",
      }}
    >
      <div
        className="relative w-full max-w-[390px] min-h-screen overflow-hidden bg-black"
      >
        {/* Status bar */}
        <div className="flex justify-between items-center px-7 pt-3 pb-1 text-white text-[15px] font-semibold relative z-20">
          <span>9:41</span>
          <span className="text-xs">●●● 📶 🔋</span>
        </div>
        {/* Dynamic island */}
        <div className="flex justify-center -mt-1 relative z-20">
          <div className="w-28 h-7 bg-black rounded-full" />
        </div>

        {/* Hero image full-bleed */}
        <div className="relative mt-3">
          <img
            src={heroNeon}
            alt="Kindly — Neon cyberpunk dating club"
            className="block w-full h-auto"
          />
          {/* Hotspot Enter the club */}
          <Link
            to="/auth"
            aria-label="Enter the club"
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: "71%", width: "60%", height: "6%" }}
          />
        </div>

        {/* iOS Tab bar */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] backdrop-blur-2xl z-30"
          style={{
            background: "rgba(10,0,20,0.78)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex justify-around items-center py-2 pb-6">
            {[
              { icon: Heart, label: "Match", to: "/auth" as const, active: true },
              { icon: PartyPopper, label: "Soirée appart'", to: "/app/parties" as const },
              { icon: MessageCircle, label: "Chat", to: "/auth" as const },
              { icon: User, label: "Moi", to: "/auth" as const },
            ].map(({ icon: Icon, label, to, active }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <Icon
                  className="w-6 h-6"
                  color={active ? "#ff2d92" : "#ffffff90"}
                  fill={active ? "#ff2d92" : "none"}
                  style={active ? { filter: "drop-shadow(0 0 6px #ff2d92)" } : {}}
                />
                <span
                  className="text-[10px] truncate max-w-[70px] text-center"
                  style={{ color: active ? "#ff2d92" : "#ffffff90" }}
                >
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
