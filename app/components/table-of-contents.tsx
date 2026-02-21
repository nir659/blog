"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { Heading } from "./blog-post-display";

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
  headings: Heading[];
  currentSlug: string | null;
};

type GroupedHeading = {
  h1: Heading;
  h2s: Heading[];
};

export function TableOfContents({ headings, currentSlug }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const isClickScrolling = useRef(false);

  const handleShare = useCallback(() => {
    if (!currentSlug) return;
    const origin = window.location.origin;
    const hash = window.location.hash;
    const url = `${origin}/?slug=${encodeURIComponent(currentSlug)}${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentSlug]);

  const groupedHeadings = useMemo(() => {
    const groups: GroupedHeading[] = [];
    let currentGroup: GroupedHeading | null = null;

    for (const heading of headings) {
      if (heading.level === 1) {
        currentGroup = { h1: heading, h2s: [] };
        groups.push(currentGroup);
      } else if (heading.level === 2 && currentGroup) {
        currentGroup.h2s.push(heading);
      } else if (heading.level === 2 && !currentGroup) {
        groups.push({ h1: heading, h2s: [] });
      }
    }

    return groups;
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
          ? `/?slug=${encodeURIComponent(currentSlug)}#${id}`
          : `#${id}`;
        window.history.pushState(null, "", url);

        setTimeout(() => {
          isClickScrolling.current = false;
        }, 800);
      }
    },
    [currentSlug]
  );

  const hasHeadings = groupedHeadings.length > 0;

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
          <ul className="flex flex-col gap-1">
            {groupedHeadings.map((group) => {
              const isH1Active = activeId === group.h1.id;
              const hasActiveH2 = group.h2s.some((h2) => activeId === h2.id);

              return (
                <li key={group.h1.id}>
                  <a
                    href={`#${group.h1.id}`}
                    onClick={(e) => handleClick(e, group.h1.id)}
                    className={[
                      "block py-1 text-[0.85rem] transition-all duration-150 border-l-2 pl-3",
                      isH1Active || hasActiveH2
                        ? "opacity-100 border-white/60"
                        : "opacity-60 border-transparent hover:opacity-100 hover:border-white/30",
                    ].join(" ")}
                  >
                    {group.h1.text}
                  </a>

                  {group.h2s.length > 0 && (
                    <ul className="flex flex-col gap-0.5 ml-3">
                      {group.h2s.map((h2) => {
                        const isH2Active = activeId === h2.id;

                        return (
                          <li key={h2.id}>
                            <a
                              href={`#${h2.id}`}
                              onClick={(e) => handleClick(e, h2.id)}
                              className={[
                                "block py-0.5 text-[0.75rem] transition-all duration-150 border-l pl-3",
                                isH2Active
                                  ? "opacity-100 border-white/40"
                                  : "opacity-50 border-transparent hover:opacity-80 hover:border-white/20",
                              ].join(" ")}
                            >
                              {h2.text}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </nav>
  );
}
