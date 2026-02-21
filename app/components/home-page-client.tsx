"use client";

import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function buildSlugUrl(slug: string, hash?: string): string {
  const url = `/?slug=${encodeURIComponent(slug)}`;
  return hash ? `${url}#${hash}` : url;
}

export function HomePageClient({
  rootPosts,
  directoryTree,
  navLinks,
  fontClassName,
  initialSelectedSlug,
}: HomePageClientProps) {
  const searchParams = useSearchParams();
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(
    initialSelectedSlug
  );
  const [headings, setHeadings] = useState<Heading[]>([]);
  const isInternalNav = useRef(false);

  useEffect(() => {
    setSelectedPostSlug(initialSelectedSlug);
  }, [initialSelectedSlug]);

  useEffect(() => {
    if (!initialSelectedSlug) return;
    const currentSlugParam = new URLSearchParams(window.location.search).get("slug");
    if (!currentSlugParam) {
      const hash = window.location.hash;
      window.history.replaceState(null, "", buildSlugUrl(initialSelectedSlug) + hash);
    }
  }, [initialSelectedSlug]);

  useEffect(() => {
    if (isInternalNav.current) {
      isInternalNav.current = false;
      return;
    }
    const slugParam = searchParams.get("slug");
    if (slugParam && slugParam !== selectedPostSlug) {
      setSelectedPostSlug(slugParam);
    }
  }, [searchParams, selectedPostSlug]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const slugParam = params.get("slug");
      if (slugParam) {
        setSelectedPostSlug(slugParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handlePostSelect = useCallback((slug: string) => {
    if (selectedPostSlug === slug) return;
    isInternalNav.current = true;
    setSelectedPostSlug(slug);
  }, [selectedPostSlug]);

  useEffect(() => {
    if (!selectedPostSlug || !isInternalNav.current) return;
    window.history.replaceState(null, "", buildSlugUrl(selectedPostSlug));
  }, [selectedPostSlug]);

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
          <TableOfContents headings={headings} currentSlug={selectedPostSlug} />
          <SiteFooter />
        </aside>
      </div>
    </main>
  );
}
