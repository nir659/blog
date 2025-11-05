import { Space_Mono } from "next/font/google";
import { HomePageClient } from "@/app/components/home-page-client";
import { getPostIndex } from "@/app/lib/posts";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#archive", label: "Archive" },
  { href: "#contact", label: "Contact" },
];

export default async function HomePage() {
  const { directories, rootPosts } = await getPostIndex();
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
      navLinks={navLinks}
      fontClassName={spaceMono.className}
      initialSelectedSlug={initialSelectedSlug}
    />
  );
}
