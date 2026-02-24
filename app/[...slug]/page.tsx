import { notFound } from "next/navigation";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";
import { getPostContent } from "@/app/lib/getPostContent";
import { HomePageClient } from "@/app/components/home-page-client";
import { getSiteUrl } from "@/app/lib/site";
import { Space_Mono } from "next/font/google";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const navLinks = [
  {
    href: "https://nir.rip",
    label: "Home",
    target: "_blank",
    rel: "noopener noreferrer",
  },
  { href: "https://github.com/nir659/notes", label: "Archive" },
  { href: "https://nir.rip", label: "Contact" },
];

export async function generateStaticParams() {
  const { directoryTree } = await getPostIndex();
  const posts = getAllPostsFromTree(directoryTree);
  return posts.map((post) => ({
    slug: post.slug.split("/"),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = slug.join("/");

  const { directoryTree } = await getPostIndex();
  const posts = getAllPostsFromTree(directoryTree);
  const post = posts.find((p) => p.slug === slugString);

  if (!post) return {};

  const title = `${post.title} | NIR Lab`;
  const url = `${getSiteUrl()}/${slugString}`;

  return {
    title,
    description: `Engineering notes and research on ${post.title}.`,
    alternates: { canonical: url },
    openGraph: { title, url, type: "article" },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugString = slug.join("/");

  const { directories, rootPosts, directoryTree } = await getPostIndex();
  const allPosts = getAllPostsFromTree(directoryTree);

  const post = allPosts.find((p) => p.slug === slugString);
  if (!post) notFound();

  const content = await getPostContent(post.filePath);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: slugString.split("/").pop()?.replace(/-/g, " "),
    url: `${getSiteUrl()}/${slugString}`,
    author: {
      "@type": "Person",
      name: "NIR",
      url: "https://nir.rip",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomePageClient
        directories={directories}
        rootPosts={rootPosts}
        directoryTree={directoryTree}
        navLinks={navLinks}
        fontClassName={spaceMono.className}
        initialSelectedSlug={slugString}
        initialContent={content}
      />
    </>
  );
}