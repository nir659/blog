import { Suspense } from "react";
import { Space_Mono } from "next/font/google";
import { HomePageClient } from "@/app/components/home-page-client";
import { getPostIndex } from "@/app/lib/posts";

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

async function HomePageContent() {
  const { directories, rootPosts, directoryTree } = await getPostIndex();
  const allPosts = [
    ...rootPosts,
    ...directories.flatMap((directory) => directory.posts),
  ];

  const welcomePost = allPosts.find(
    (post) => post.slug.split("/").pop()?.toLowerCase() === "welcome"
  );

  const initialSelectedSlug =
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-[0.95rem] opacity-50">Loading...</p>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
