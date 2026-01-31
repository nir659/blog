"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { Heading } from "./blog-post-display";

type TableOfContentsProps = {
  headings: Heading[];
};

type GroupedHeading = {
  h1: Heading;
  h2s: Heading[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isClickScrolling = useRef(false);

  // Group h2s under their preceding h1
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
        // h2 without a preceding h1 - create a standalone entry
        groups.push({ h1: heading, h2s: [] });
      }
    }

    return groups;
  }, [headings]);

  // Scroll-based tracking
  useEffect(() => {
    if (headings.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(null);
      return;
    }

    const handleScroll = () => {
      // Skip if we're in the middle of a click-initiated scroll
      if (isClickScrolling.current) return;

      // Get all heading elements in DOM order
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

      // Find the last heading that's at or above the offset threshold
      const offset = 120;
      let currentHeading: string | null = null;

      for (const { id, top } of headingElements) {
        if (top <= offset) {
          currentHeading = id;
        }
      }

      // If no heading has been scrolled past, use the first one
      if (currentHeading === null) {
        currentHeading = headingElements[0].id;
      }

      setActiveId(currentHeading);
    };

    // Run once on mount
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        // Mark that we're doing a click-initiated scroll
        isClickScrolling.current = true;
        setActiveId(id);

        element.scrollIntoView({ behavior: "smooth", block: "start" });

        // Update URL without triggering navigation
        window.history.pushState(null, "", `#${id}`);

        // Re-enable scroll tracking after smooth scroll completes
        setTimeout(() => {
          isClickScrolling.current = false;
        }, 800);
      }
    },
    []
  );

  if (groupedHeadings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className="hidden md:block sticky top-[clamp(3rem,8vw,2rem)] py-[clamp(3rem,8vw,2rem)]"
    >
      <p className="text-[0.85rem] uppercase tracking-[0.18em] opacity-80 mb-4">
        On This Page
      </p>
      <ul className="flex flex-col gap-1">
        {groupedHeadings.map((group) => {
          const isH1Active = activeId === group.h1.id;
          const hasActiveH2 = group.h2s.some((h2) => activeId === h2.id);

          return (
            <li key={group.h1.id}>
              {/* H1 heading */}
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

              {/* H2 headings nested under H1 */}
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
    </nav>
  );
}
