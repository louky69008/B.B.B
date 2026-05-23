import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { POSTS } from "@/lib/blog-posts";

const URL = "https://connect-kindly-61.lovable.app/blog";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — B.B.B & cie" },
      { name: "description", content: "Conseils rencontres, témoignages, actualité de la communauté B.B.B & cie. Des articles sans tabou pour mieux se rencontrer." },
      { property: "og:title", content: "Blog — B.B.B & cie" },
      { property: "og:description", content: "Conseils, témoignages et actu de la communauté." },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: BlogPage,
});

const posts = POSTS;

function BlogPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
        Blog
      </h1>
      <p className="mt-4 text-[#bdb7d8]">Conseils, témoignages, actu de la communauté.</p>

      <div className="mt-10 space-y-6">
        {posts.map((p) => (
          <article key={p.slug} className="p-6 border border-white/10 bg-white/[0.02] hover:border-[color:var(--neon-cyan)] transition-colors">
            <div className="flex items-center gap-3 text-xs font-mono text-[#9b94bf]">
              <span className="text-[color:var(--neon-cyan)]">{p.tag}</span>
              <span>·</span>
              <time>{new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</time>
            </div>
            <h2 className="mt-2 font-display text-xl">{p.title}</h2>
            <p className="mt-2 text-sm text-[#bdb7d8]">{p.excerpt}</p>
            <Link to="/blog/$slug" params={{ slug: p.slug }} className="mt-3 inline-block text-xs font-mono uppercase tracking-wider text-[color:var(--neon-magenta)] hover:text-[color:var(--neon-cyan)]">
              Lire l'article ›
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
