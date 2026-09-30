import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { POSTS, getPost, type BlogPost } from "@/lib/blog-posts";

const BASE = "https://connect-kindly-61.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Article — B.B.B & cie" }] };
    const url = `${BASE}/blog/${params.slug}`;
    return {
      meta: [
        { title: `${loaderData.title} — B.B.B & cie` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: loaderData.date },
        { property: "article:section", content: loaderData.tag },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            datePublished: loaderData.date,
            articleSection: loaderData.tag,
            author: { "@type": "Organization", name: "B.B.B & cie" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl uppercase">Article introuvable</h1>
      <Link
        to="/blog"
        className="mt-6 inline-block text-[color:var(--neon-magenta)] font-mono text-sm uppercase tracking-wider"
      >
        ← Retour au blog
      </Link>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl uppercase">Une erreur est survenue</h1>
      <button
        onClick={reset}
        className="mt-6 text-[color:var(--neon-cyan)] font-mono text-sm uppercase"
      >
        Réessayer
      </button>
    </main>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const post = Route.useLoaderData() as BlogPost;
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        to="/blog"
        className="text-xs font-mono uppercase tracking-wider text-[color:var(--neon-cyan)] hover:text-[color:var(--neon-magenta)]"
      >
        ← Blog
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3 text-xs font-mono text-[#9b94bf]">
          <span className="text-[color:var(--neon-cyan)]">{post.tag}</span>
          <span>·</span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime} de lecture</span>
        </div>
        <h1 className="mt-4 font-display text-4xl md:text-5xl uppercase tracking-tight neon-glow-magenta">
          {post.title}
        </h1>
        <p className="mt-4 text-lg text-[#bdb7d8]">{post.excerpt}</p>
      </header>

      <article className="mt-12 space-y-8">
        {post.content.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="font-display text-2xl uppercase text-[color:var(--neon-cyan)] mb-3">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-[#d4cfe8] leading-relaxed mb-4">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>

      {related.length > 0 && (
        <aside className="mt-20 pt-10 border-t border-white/10">
          <h2 className="font-display text-xl uppercase mb-6">À lire ensuite</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="p-5 border border-white/10 bg-white/[0.02] hover:border-[color:var(--neon-cyan)] transition-colors block"
              >
                <div className="text-xs font-mono text-[color:var(--neon-cyan)]">{p.tag}</div>
                <h3 className="mt-2 font-display text-lg">{p.title}</h3>
                <p className="mt-2 text-sm text-[#bdb7d8]">{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </main>
  );
}
