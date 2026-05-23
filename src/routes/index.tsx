import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, User, Search, Sparkles, Bell, Settings, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main
      className="min-h-screen w-full flex justify-center"
      style={{
        background:
          "radial-gradient(circle at 20% 10%, #2a0a3a 0%, #0a0014 55%, #000 100%)",
      }}
    >
      {/* iPhone frame */}
      <div
        className="relative w-full max-w-[390px] min-h-screen overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #18002b 0%, #0a0014 60%, #000010 100%)",
        }}
      >
        {/* Status bar */}
        <div className="flex justify-between items-center px-7 pt-3 pb-1 text-white text-[15px] font-semibold">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="text-xs">●●●</span>
            <span className="text-xs">📶</span>
            <span className="text-xs">🔋</span>
          </div>
        </div>

        {/* Dynamic island */}
        <div className="flex justify-center -mt-1">
          <div className="w-28 h-7 bg-black rounded-full" />
        </div>

        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <Heart
              className="w-7 h-7"
              fill="#ff2d92"
              color="#ff2d92"
              style={{ filter: "drop-shadow(0 0 8px #ff2d92)" }}
            />
            <h1
              className="text-2xl font-bold text-white tracking-tight"
              style={{ fontFamily: "'SF Pro Display', system-ui" }}
            >
              Kindly
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="px-5 mt-5">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-2xl px-4 py-3">
            <Search className="w-4 h-4 text-white/60" />
            <span className="text-white/60 text-sm">Search dancers nearby…</span>
          </div>
        </div>

        {/* Hero card */}
        <section className="px-5 mt-6">
          <div
            className="relative rounded-3xl overflow-hidden p-6"
            style={{
              background:
                "linear-gradient(135deg, #ff2d92 0%, #7c3aed 60%, #00f0ff 100%)",
              boxShadow:
                "0 20px 60px -10px rgba(255,45,146,0.5), 0 0 40px rgba(0,240,255,0.3)",
            }}
          >
            <div className="flex items-center gap-2 text-white/90 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Tonight
            </div>
            <h2
              className="text-white text-2xl font-bold mt-2 leading-tight"
              style={{ fontFamily: "'SF Pro Display', system-ui" }}
            >
              Neon Club Night
            </h2>
            <p className="text-white/80 text-sm mt-1">
              12 matches waiting nearby
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 mt-4 bg-white text-black text-sm font-semibold px-4 py-2 rounded-full"
            >
              Enter the club <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Stories row */}
        <section className="mt-6">
          <h3 className="px-5 text-white/90 text-base font-semibold mb-3">
            Live now
          </h3>
          <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar">
            {["Luna", "Max", "Iris", "Theo", "Zoe"].map((name, i) => (
              <div key={name} className="flex flex-col items-center gap-1 shrink-0">
                <div
                  className="w-16 h-16 rounded-full p-[2px]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #ff2d92, #00f0ff, #ff2d92)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `linear-gradient(135deg, hsl(${i * 60},80%,55%), hsl(${i * 60 + 40},80%,40%))`,
                    }}
                  />
                </div>
                <span className="text-white/80 text-xs">{name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* List */}
        <section className="px-5 mt-6 pb-32">
          <h3 className="text-white/90 text-base font-semibold mb-3">
            Suggested for you
          </h3>
          <div className="rounded-2xl bg-white/5 backdrop-blur divide-y divide-white/10">
            {[
              { name: "Aria, 24", sub: "0.4 km · loves techno", c: "#ff2d92" },
              { name: "Noah, 27", sub: "1.2 km · house & disco", c: "#00f0ff" },
              { name: "Mila, 22", sub: "2.0 km · just joined", c: "#a855f7" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3 p-3">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${p.c}, #1a0030)`,
                    boxShadow: `0 0 16px ${p.c}80`,
                  }}
                />
                <div className="flex-1">
                  <div className="text-white font-semibold text-sm">{p.name}</div>
                  <div className="text-white/50 text-xs">{p.sub}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </div>
            ))}
          </div>
        </section>

        {/* Tab bar */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] backdrop-blur-2xl"
          style={{
            background: "rgba(10,0,20,0.75)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="flex justify-around items-center py-2 pb-6">
            {[
              { icon: Heart, label: "Match", active: true },
              { icon: Search, label: "Explore" },
              { icon: MessageCircle, label: "Chat" },
              { icon: User, label: "Me" },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className="flex flex-col items-center gap-1 px-3 py-1"
              >
                <Icon
                  className="w-6 h-6"
                  color={active ? "#ff2d92" : "#ffffff90"}
                  fill={active ? "#ff2d92" : "none"}
                  style={active ? { filter: "drop-shadow(0 0 6px #ff2d92)" } : {}}
                />
                <span
                  className="text-[10px]"
                  style={{ color: active ? "#ff2d92" : "#ffffff90" }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
