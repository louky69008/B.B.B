import { createFileRoute, Link } from "@tanstack/react-router";
import heroNeon from "@/assets/hero-neon.jpg";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  return (
    <main className="relative min-h-screen bg-black">
      <img
        src={heroNeon}
        alt="Kindly — Neon cyberpunk dating club"
        width={1280}
        height={1280}
        className="block w-full h-auto"
      />
      <Link
        to="/auth"
        aria-label="Enter the club"
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "71%", width: "32%", height: "5%" }}
      />
    </main>
  );
}
