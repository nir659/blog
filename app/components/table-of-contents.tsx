"use client";

import { useEffect, useState, useCallback } from "react";
import type { Heading } from "./blog-post-display";

type TableOfContentsProps = {
  headings: Heading[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(null);
      return;
    }

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length > 0) {
          // Get the topmost visible heading
          const topEntry = visibleEntries.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top
              ? prev
              : curr;
          });
          setActiveId(topEntry.target.id);
        } else {
          // No heading is visible - find the one that was most recently passed
          const scrollY = window.scrollY;
          let closestAbove: HTMLElement | null = null;
          let closestDistance = Infinity;

          for (const el of headingElements) {
            const rect = el.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            const distance = scrollY - elementTop;

            if (distance >= 0 && distance < closestDistance) {
              closestDistance = distance;
              closestAbove = el;
            }
          }

          if (closestAbove) {
            setActiveId(closestAbove.id);
          }
        }
      },
      {
        rootMargin: "-10% 0px -70% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
        // Update URL without triggering navigation
        window.history.pushState(null, "", `#${id}`);
      }
    },
    []
  );

  if (headings.length === 0) {
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
      <ul className="flex flex-col gap-2 text-[0.85rem]">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH3 = heading.level === 3;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={[
                  "block py-1 transition-all duration-150 border-l-2",
                  isH3 ? "pl-4" : "pl-3",
                  isActive
                    ? "opacity-100 border-white/60"
                    : "opacity-60 border-transparent hover:opacity-100 hover:border-white/30",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
