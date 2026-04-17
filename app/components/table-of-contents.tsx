"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { HeadingData } from "@/app/lib/markdown-plugins/extract-headings";
import { buildPostPath } from "@/app/lib/slug";

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

type TableOfContentsProps = {
  headings: HeadingData[];
  currentSlug: string | null;
};

export function TableOfContents({ headings, currentSlug }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isClickScrolling = useRef(false);

  const handleShare = useCallback(() => {
    if (!currentSlug) return;
    const origin = window.location.origin;
    const hash = window.location.hash;
    const url = `${origin}${buildPostPath(currentSlug)}${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentSlug]);

  const minLevel = useMemo(() => {
    if (headings.length === 0) return 1;
    return Math.min(...headings.map((h) => h.level));
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId(null);
      return;
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const headingElements: { id: string; top: number }[] = [];
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (el) {
          headingElements.push({
            id: heading.id,
            top: el.getBoundingClientRect().top,
          });
        }
      }

      if (headingElements.length === 0) return;

      const offset = 120;
      let currentHeading: string | null = null;

      for (const { id, top } of headingElements) {
        if (top <= offset) {
          currentHeading = id;
        }
      }

      if (currentHeading === null) {
        currentHeading = headingElements[0].id;
      }

      setActiveId(currentHeading);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleHashChange = () => {
      if (isClickScrolling.current) return;
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;

      const decoded = decodeURIComponent(hash);
      const valid = headings.some((h) => h.id === decoded);
      if (!valid) return;

      const el = document.getElementById(decoded);
      if (el) {
        setActiveId(decoded);
        el.scrollIntoView({ behavior: "auto", block: "start" });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        isClickScrolling.current = true;
        setActiveId(id);

        element.scrollIntoView({ behavior: "smooth", block: "start" });

        const url = currentSlug
          ? `${buildPostPath(currentSlug)}#${id}`
          : `#${id}`;
        window.history.pushState(null, "", url);

        setTimeout(() => {
          isClickScrolling.current = false;
        }, 800);
      }
    },
    [currentSlug]
  );

  const hasHeadings = headings.length > 0;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden md:block sticky top-[clamp(3rem,8vw,2rem)] py-[clamp(3rem,8vw,2rem)]"
    >
      {currentSlug && (
        <button
          type="button"
          onClick={handleShare}
          className={[
            "cursor-pointer flex items-center gap-1.5 text-[0.8rem] mb-4 px-1 py-2 transition-all duration-150",
            copied
              ? "opacity-100"
              : "opacity-60 hover:opacity-100",
          ].join(" ")}
          aria-label={copied ? "Link copied!" : "Copy link to this note"}
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
      )}
      {hasHeadings && (
        <>
          <p className="text-[0.85rem] uppercase tracking-[0.18em] opacity-80 mb-4">
            On This Page
          </p>
          <ul className="flex flex-col gap-0.5">
            {headings.map((heading) => {
              const indent = heading.level - minLevel;
              const isActive = activeId === heading.id;
              const isTopLevel = indent === 0;

              return (
                <li key={heading.id} style={{ paddingLeft: `${indent * 0.75}rem` }}>
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    className={[
                      "block py-0.5 transition-all duration-150 border-l-2 pl-3",
                      isTopLevel ? "text-[0.85rem]" : "text-[0.75rem]",
                      isActive
                        ? "opacity-100 border-white/60"
                        : "opacity-50 border-transparent hover:opacity-90 hover:border-white/30",
                    ].join(" ")}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </nav>
  );
}
