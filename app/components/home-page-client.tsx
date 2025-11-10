"use client";

import { useEffect, useState } from "react";
import type { DirectoryMeta, DirectoryTreeNode, PostMeta } from "@/app/lib/posts";
import { DirectoryPostList } from "./directory-post-list";
import { BlogPostDisplay } from "./blog-post-display";
import { Main } from "./home";
import { SiteFooter } from "./site-footer";

type NavLink = {
  href: string;
  label: string;
};

type HomePageClientProps = {
  directories: DirectoryMeta[];
  rootPosts: PostMeta[];
  directoryTree: DirectoryTreeNode;
  navLinks: NavLink[];
  fontClassName: string;
  initialSelectedSlug: string | null;
};

// client shell responsible for selection state and overall layout chrome
export function HomePageClient({
  rootPosts,
  directoryTree,
  navLinks,
  fontClassName,
  initialSelectedSlug,
}: HomePageClientProps) {
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(
    initialSelectedSlug
  );

  useEffect(() => {
    setSelectedPostSlug(initialSelectedSlug);
  }, [initialSelectedSlug]);

  const gridClassName = "grid w-full max-w-[1900px] grid-cols-1 md:grid-cols-[minmax(150px,200px)_1px_minmax(0,1100px)_1px_minmax(3rem,1fr)] md:gap-x-[clamp(2rem,6vw,4rem)]";

  return (
    <main
      className={`${fontClassName} flex min-h-screen justify-center px-4 sm:px-6 md:overflow-x-visible`}
    >
      <div className={gridClassName}>
        <aside className="col-start-1 py-[clamp(3rem,8vw,2rem)] md:sticky md:top-0 md:h-screen md:overflow-y-auto">
          <DirectoryPostList
            directoryTree={directoryTree}
            rootPosts={rootPosts}
            onPostSelect={setSelectedPostSlug}
          />
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
