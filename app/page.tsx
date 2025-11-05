"use client";

import { useState } from "react";
import { Main } from "@/app/components/home";
import { DirectoryPostList } from "@/app/components/directory-post-list";
import { BlogPostDisplay } from "@/app/components/blog-post-display";
import { Space_Mono } from "next/font/google";
import { SiteFooter } from "./components/site-footer";

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

const posts = [
  {
    category: "CTF",
    title: "Example CTF Writeup",
    slug: "example-ctf-writeup",
    date: "2025-11-04",
  },
  {
    category: "Development",
    title: "Building a Next.js Blog",
    slug: "building-nextjs-blog",
    date: "2025-11-04",
  },
  {
    category: "Security",
  },
  {
    category: "Other",
  },
];

// manages selected post state and renders layout
export default function HomePage() {
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);

  // updates selected post when user clicks from directory
  const handlePostSelect = (slug: string) => {
    setSelectedPostSlug(slug);
  };

  return (
    <main
      className={`${spaceMono.className} flex min-h-screen justify-center px-4 sm:px-6 md:overflow-x-visible`}
    >
      <div className="grid w-full max-w-[1900px] grid-cols-1 md:grid-cols-[minmax(250px,300px)_1px_minmax(0,1100px)_1px_minmax(3rem,1fr)] md:gap-x-[clamp(2rem,6vw,4rem)]">
        <aside className="col-start-1 py-[clamp(3rem,8vw,2rem)] md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <DirectoryPostList posts={posts} onPostSelect={handlePostSelect} />
        </aside>

        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-2 md:block"
        />

        <section className="col-start-1 flex flex-col gap-[clamp(2rem,6vw,3.5rem)] py-[clamp(3rem,8vw,2rem)] md:col-start-3">
          <Main navLinks={navLinks} />
          <BlogPostDisplay selectedPostSlug={selectedPostSlug} />
        </section>

        <span
          aria-hidden="true"
          className="hidden self-stretch bg-[var(--grid-lines)] md:col-start-4 md:block"
        />

        <SiteFooter />
      </div>
    </main>
  );
}
