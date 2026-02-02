"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useState } from "react";
import type { DirectoryMeta, DirectoryTreeNode, PostMeta } from "@/app/lib/posts";
import { DirectoryPostList } from "./directory-post-list";
import { BlogPostDisplay, type Heading } from "./blog-post-display";
import { Main } from "./home";
import { SiteFooter, MobileFooter } from "./site-footer";
import { TableOfContents } from "./table-of-contents";

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

type ArchivePaneProps = {
  directoryTree: DirectoryTreeNode;
  rootPosts: PostMeta[];
  onPostSelect?: (slug: string) => void;
};

const ArchivePane = memo(function ArchivePane({
  directoryTree,
  rootPosts,
  onPostSelect,
}: ArchivePaneProps) {
  return (
    <aside className="col-start-1 py-[clamp(3rem,8vw,2rem)] md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <DirectoryPostList
        directoryTree={directoryTree}
        rootPosts={rootPosts}
        onPostSelect={onPostSelect}
      />
    </aside>
  );
});
ArchivePane.displayName = "ArchivePane";

function GridDivider({ column }: { column: number }) {
  return (
    <span
      aria-hidden="true"
      className="hidden self-stretch bg-[var(--grid-lines)] md:block"
      style={{ gridColumnStart: column }}
    />
  );
}

type ContentAreaProps = {
  navLinks: NavLink[];
  selectedPostSlug: string | null;
  onHeadingsChange: (headings: Heading[]) => void;
};

function ContentArea({
  navLinks,
  selectedPostSlug,
  onHeadingsChange,
}: ContentAreaProps) {
  return (
    <section className="col-start-1 flex flex-col gap-[clamp(1.5rem,6vw,1.5rem)] py-[clamp(1rem,8vw,2rem)] md:col-start-3">
      <Main navLinks={navLinks} />
      <div className="min-w-0 overflow-hidden">
        <BlogPostDisplay
          selectedPostSlug={selectedPostSlug}
          onHeadingsChange={onHeadingsChange}
        />
      </div>
      <MobileFooter />
    </section>
  );
}

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
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    setSelectedPostSlug(initialSelectedSlug);
  }, [initialSelectedSlug]);

  const handlePostSelect = useCallback((slug: string) => {
    setSelectedPostSlug((previous) => (previous === slug ? previous : slug));
  }, []);

  const handleHeadingsChange = useCallback((newHeadings: Heading[]) => {
    setHeadings(newHeadings);
  }, []);

  const gridClassName = clsx(
    "grid w-full max-w-[1900px] grid-cols-1",
    "md:grid-cols-[minmax(200px,300px)_1px_minmax(0,1100px)_1px_minmax(3rem,1fr)]",
    "md:gap-x-[var(--grid-gap)]"
  );

  return (
    <main
      className={clsx(
        fontClassName,
        "flex min-h-screen justify-center px-4 sm:px-6 [--grid-gap:clamp(2rem,6vw,4rem)]"
      )}
    >
      <div className={gridClassName}>
        <ArchivePane
          directoryTree={directoryTree}
          rootPosts={rootPosts}
          onPostSelect={handlePostSelect}
        />
        <GridDivider column={2} />
        <ContentArea
          navLinks={navLinks}
          selectedPostSlug={selectedPostSlug}
          onHeadingsChange={handleHeadingsChange}
        />
        <GridDivider column={4} />
        <aside className="col-start-5 hidden md:flex md:flex-col md:h-screen md:sticky md:top-0">
          <TableOfContents headings={headings} />
          <SiteFooter />
        </aside>
      </div>
    </main>
  );
}
