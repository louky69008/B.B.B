import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroNeon from "@/assets/hero-neon.jpg";
import { Heart, PartyPopper, MessageCircle, User, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({ component: Landing });


type HotspotKey = "trans" | "appart" | "chat" | "kyc";

type Hotspot = {
  key: HotspotKey;
  label: string;
  emoji: string;
  // Position over the hero image (percentages)
  top: string;
  left: string;
  color: string;
  title: string;
  body: string;
  cta: { label: string; to: "/auth" | "/app/parties" };
};

const HOTSPOTS: Hotspot[] = [
  {
    key: "trans",
    label: "Trans-friendly",
    emoji: "🏳️‍⚧️",
    top: "22%",
    left: "18%",
    color: "#5bcefa",
    title: "Espace Trans-friendly",
    body:
      "Un espace safe, sans jugement, avec filtres dédiés et modération renforcée. Pronoms respectés, profils vérifiés, zéro fétichisation.",
    cta: { label: "Découvrir", to: "/auth" },
  },
  {
    key: "appart",
    label: "Soirée appart'",
    emoji: "🎉",
    top: "30%",
    left: "78%",
    color: "#ff2d92",
    title: "Soirée appart' — gratuit",
    body:
      "Accès libre sans inscription. Trouve ou organise un after, à 3, 4… Options safe : capote, BBK, full chill-out, etc.",
    cta: { label: "Entrer", to: "/app/parties" },
  },
  {
    key: "chat",
    label: "Chat classique",
    emoji: "💬",
    top: "55%",
    left: "20%",
    color: "#8a2dff",
    title: "Chat & Match classique",
    body:
      "Swipe, match, discute. Messages privés chiffrés, photos éphémères, et stickers pour briser la glace.",
    cta: { label: "Créer un compte", to: "/auth" },
  },
  {
    key: "kyc",
    label: "Accès rapide / KYC",
    emoji: "⚡",
    top: "62%",
    left: "78%",
    color: "#2dd4ff",
    title: "Accès rapide vs KYC vérifié",
    body:
      "Accès rapide : profil basique en 30s, fonctions limitées. KYC vérifié (pièce d'identité) : badge bleu, accès soirées privées, messages illimités et matchs prioritaires.",
    cta: { label: "Commencer", to: "/auth" },
  },
];

function Landing() {
  const [open, setOpen] = useState<HotspotKey | null>(null);
  const { user } = useAuth();
  const authedTarget = "/app/grid" as const;
  const active = HOTSPOTS.find((h) => h.key === open) ?? null;


  return (
    <main
      className="min-h-screen w-full flex justify-center items-start"
      style={{
        background:
          "radial-gradient(circle at 30% 10%, #2a0a3a 0%, #0a0014 55%, #000 100%)",
      }}
    >
      <div className="relative w-full max-w-[390px] min-h-screen overflow-hidden bg-black">
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
            to={user ? authedTarget : "/auth"}
            aria-label="Enter the club"
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: "71%", width: "60%", height: "6%" }}
          />


          {/* Interactive animated hotspots */}
          {HOTSPOTS.map((h, i) => (
            <button
              key={h.key}
              onClick={() => setOpen(open === h.key ? null : h.key)}
              aria-label={h.label}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{
                top: h.top,
                left: h.left,
                animation: `floatY 3.${i}s ease-in-out infinite`,
              }}
            >
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: h.color,
                  opacity: 0.35,
                  animation: `pingSoft 2s cubic-bezier(0,0,0.2,1) infinite`,
                }}
              />
              {/* Dot */}
              <span
                className="relative flex items-center justify-center w-9 h-9 rounded-full text-base"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${h.color}, #0a0014 120%)`,
                  border: `1.5px solid ${h.color}`,
                  boxShadow: `0 0 14px ${h.color}, inset 0 0 8px ${h.color}80`,
                }}
              >
                {h.emoji}
              </span>
              {/* Mini label */}
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap px-1.5 py-0.5 rounded"
                style={{
                  color: h.color,
                  background: "rgba(0,0,0,0.6)",
                  textShadow: `0 0 4px ${h.color}`,
                }}
              >
                {h.label}
              </span>
            </button>
          ))}

          {/* Fade transition */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #0a0014 90%)",
            }}
          />
        </div>

        {/* Popover modal */}
        {active && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setOpen(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[390px] rounded-t-3xl p-5 pb-8 animate-[slideUp_0.25s_ease-out]"
              style={{
                background: "linear-gradient(180deg, #1a0530 0%, #0a0014 100%)",
                borderTop: `2px solid ${active.color}`,
                boxShadow: `0 -10px 40px ${active.color}40`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${active.color}, #0a0014 120%)`,
                    border: `1.5px solid ${active.color}`,
                    boxShadow: `0 0 16px ${active.color}`,
                  }}
                >
                  {active.emoji}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-white text-base font-bold leading-tight"
                    style={{ textShadow: `0 0 8px ${active.color}80` }}
                  >
                    {active.title}
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  aria-label="Fermer"
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-3 text-[13px] text-white/80 leading-relaxed">
                {active.body}
              </p>
              <Link
                to={user && active.cta.to === "/auth" ? authedTarget : active.cta.to}

                onClick={() => setOpen(null)}
                className="mt-4 block text-center rounded-xl py-3 text-white text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${active.color}, #8a2dff)`,
                  boxShadow: `0 0 20px ${active.color}60`,
                }}
              >
                {active.cta.label} ›
              </Link>
            </div>
          </div>
        )}

        {/* Teaser section to fill the gap above the tab bar */}
        <section className="relative px-6 pb-28 pt-2 -mt-2 z-10">
          <Link
            to="/app/parties"
            className="block rounded-2xl p-[1.5px]"
            style={{
              background:
                "linear-gradient(135deg, #ff2d92 0%, #8a2dff 50%, #2dd4ff 100%)",
              boxShadow: "0 0 24px rgba(255,45,146,0.35)",
            }}
          >
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(10,0,20,0.92)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{
                  background: "linear-gradient(135deg, #ff2d92, #8a2dff)",
                  boxShadow: "0 0 12px #ff2d92",
                }}
              >
                🎉
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-[13px] font-bold leading-tight">
                  Soirée appart' — Accès libre
                </div>
                <div className="text-[11px] text-white/60 leading-tight">
                  100% gratuit · entre potes ou nouvelles rencontres
                </div>
              </div>
              <span className="text-[#ff2d92] text-lg">›</span>
            </div>
          </Link>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              "💋 Match",
              "🔥 Trans-friendly",
              "🍑 BBK safe",
              "🏳️‍🌈 LGBTQ+",
              "🌙 After d'after",
            ].map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-white/80 px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,45,146,0.25)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-3 text-[10px] text-white/50 text-center italic">
            👆 Touche les points lumineux pour découvrir chaque univers
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {["#ff2d92", "#8a2dff", "#2dd4ff"].map((c) => (
                <div
                  key={c}
                  className="w-6 h-6 rounded-full border-2 border-black"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-[11px] text-white/60">
              Rejoins une communauté qui kiffe sans tabou
            </span>
          </div>
        </section>

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

      <style>{`
        @keyframes pingSoft {
          0% { transform: scale(1); opacity: 0.5; }
          80%, 100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes floatY {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 4px)); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
