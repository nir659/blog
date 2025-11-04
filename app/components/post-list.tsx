export type PostSummary = {
  category: string;
  title?: string;
  slug?: string;
  date?: string;
  description?: string;
};

export type GroupedPosts = {
  [category: string]: PostSummary[];
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
        <article key={post.title} className="p-[clamp(1.5rem,4vw,2rem)]">
          <h3 className="mb-3 text-[1.2rem] font-semibold">{post.title}</h3>
        </article>
      ))}
    </section>
  );
}
