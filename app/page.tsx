import { Suspense } from "react";
import { Space_Mono } from "next/font/google";
import { HomePageClient } from "@/app/components/home-page-client";
import { Skeleton } from "@/app/components/skeleton";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const navLinks = [
  { href: "https://nir.rip", label: "Home", target: "_blank", rel: "noopener noreferrer" },
  { href: "https://github.com/nir659/notes", label: "Archive" },
  { href: "#contact", label: "Links" },
];

export const revalidate = 0;

function normalizedSlugTail(slug: string): string {
  const tail = slug.split("/").pop() ?? "";
  return tail.replace(/(\.[a-z0-9]+)+$/gi, "").toLowerCase();
}

type HomePageContentProps = {
  initialSlugFromQuery: string | null;
};

async function HomePageContent({ initialSlugFromQuery }: HomePageContentProps) {
  const { directories, rootPosts, directoryTree } = await getPostIndex();
  const allPosts = getAllPostsFromTree(directoryTree);

  const welcomePost = allPosts.find(
    (post) => normalizedSlugTail(post.slug) === "welcome"
  );

  const matchesQuerySlug = initialSlugFromQuery
    ? allPosts.some((post) => post.slug === initialSlugFromQuery)
    : false;

  const firstAvailableSlug = rootPosts[0]?.slug ?? allPosts[0]?.slug ?? null;

  const initialSelectedSlug =
    (matchesQuerySlug ? initialSlugFromQuery : null) ??
    welcomePost?.slug ??
    firstAvailableSlug ??
    null;

  return (
    <HomePageClient
      directories={directories}
      rootPosts={rootPosts}
      directoryTree={directoryTree}
      navLinks={navLinks}
      fontClassName={spaceMono.className}
      initialSelectedSlug={initialSelectedSlug}
    />
  );
}

type HomePageProps = {
  searchParams?: Promise<{ slug?: string | string[] } | undefined>;
};

function normalizeSlugFromSearchParams(
  value: string | string[] | undefined
): string | null {
  if (!value) {
    return null;
  }

  const slugValue = Array.isArray(value) ? value[0] : value;

  try {
    const decoded = decodeURIComponent(slugValue);
    const trimmed = decoded.trim().replace(/^\/+|\/+$/g, "");
    return trimmed || null;
  } catch {
    return null;
  }
}

export default async function HomePage({ searchParams }: HomePageProps = {}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const slugFromQuery = normalizeSlugFromSearchParams(resolvedSearchParams?.slug);

  return (
    <Suspense
      fallback={<HomePageSkeleton />}
    >
      <HomePageContent initialSlugFromQuery={slugFromQuery} />
    </Suspense>
  );
}

function HomePageSkeleton() {
  const gridTemplate =
    "grid w-full max-w-[1900px] grid-cols-1 md:grid-cols-[minmax(150px,200px)_1px_minmax(0,1100px)_1px_minmax(3rem,1fr)] md:gap-x-[clamp(2rem,6vw,4rem)]";
  const folderPlaceholder = Array.from({ length: 3 });
  const postPlaceholder = Array.from({ length: 4 });

  return (
    <main
      className={`${spaceMono.className} flex min-h-screen justify-center px-4 sm:px-6 md:overflow-x-visible`}
    >
      <div className={gridTemplate}>
        <aside className="col-start-1 py-[clamp(3rem,8vw,2rem)] md:sticky md:top-0 md:h-screen md:overflow-y-hidden">
          <div className="space-y-3">
            {folderPlaceholder.map((_, index) => (
              <div key={`folder-skeleton-${index}`} className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-2 md:block"
        />

        <section className="col-start-1 flex flex-col gap-[clamp(2rem,6vw,3.5rem)] py-[clamp(3rem,8vw,2rem)] md:col-start-3">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-1/2" />
          </div>
          <div className="space-y-4">
            {postPlaceholder.map((_, index) => (
              <Skeleton key={`post-line-${index}`} className="h-4 w-full" />
            ))}
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </section>

        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-4 md:block"
        />
      </div>
    </main>
  );
}
