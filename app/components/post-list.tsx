type PostSummary = {
  href: string;
  title: string;
  excerpt: string;
};

type PostListProps = {
  posts: PostSummary[];
};

export function PostListSection({ posts }: PostListProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      className="grid gap-[clamp(1.75rem,5vw,2.5rem)] md:grid-cols-2"
      id="archive"
    >
      {posts.map((post) => (
        <article
          key={post.href}
          className="border border-white/[0.08] bg-white/[0.01] p-[clamp(1.5rem,4vw,2rem)] transition-colors duration-150 hover:border-white/[0.15] hover:bg-white/[0.03]"
        >
          <a className="mt-3 block no-underline" href={post.href}>
            <h3 className="mb-3 text-[1.2rem] font-semibold">{post.title}</h3>
            <p className="mb-5 leading-[1.6] opacity-80">{post.excerpt}</p>
            <span className="text-[0.85rem] uppercase tracking-[0.14em] opacity-70">
              Open notes →
            </span>
          </a>
        </article>
      ))}
    </section>
  );
}
