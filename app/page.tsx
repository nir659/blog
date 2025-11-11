import { Suspense } from "react";
import { Space_Mono } from "next/font/google";
import { HomePageClient } from "@/app/components/home-page-client";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const navLinks = [
  { href: "#about", label: "Home" },
  { href: "#archive", label: "Posts" },
  { href: "#contact", label: "Links" },
];

// Force dynamic rendering for fresh post data
export const revalidate = 0;

type HomePageContentProps = {
  initialSlugFromQuery: string | null;
};

async function HomePageContent({ initialSlugFromQuery }: HomePageContentProps) {
  const { directories, rootPosts, directoryTree } = await getPostIndex();
  const allPosts = getAllPostsFromTree(directoryTree);

  const welcomePost = allPosts.find(
    (post) => post.slug.split("/").pop()?.toLowerCase() === "welcome"
  );

  const matchesQuerySlug = initialSlugFromQuery
    ? allPosts.some((post) => post.slug === initialSlugFromQuery)
    : false;

  const initialSelectedSlug =
    (matchesQuerySlug ? initialSlugFromQuery : null) ??
    welcomePost?.slug ??
    allPosts[0]?.slug ??
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
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-[0.95rem] opacity-50">Loading...</p>
        </div>
      }
    >
      <HomePageContent initialSlugFromQuery={slugFromQuery} />
    </Suspense>
  );
}
