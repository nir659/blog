"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useCallback,
} from "react";
import { Skeleton } from "@/app/components/skeleton";
import type { HeadingData } from "@/app/lib/markdown-plugins/extract-headings";

export type { HeadingData as Heading };

export type CompiledBundle = {
  html: string;
  headings: HeadingData[];
  frontmatter: Record<string, unknown>;
};

type BlogPostDisplayProps = {
  selectedPostSlug: string | null;
  initialCompiled?: CompiledBundle | null;
  onHeadingsChange?: (headings: HeadingData[]) => void;
};

type CacheEntry = {
  compiled: CompiledBundle | null;
  error: string | null;
};

const postCache = new Map<string, CacheEntry>();
const inFlightControllers = new Map<string, AbortController>();

function PostSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <Skeleton className="h-7 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-11/12" />
      <div className="space-y-3 rounded-md border border-white/10 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-9/12" />
    </div>
  );
}

function attachCopyButtons(container: HTMLElement) {
  const blocks = container.querySelectorAll("pre");
  blocks.forEach((pre) => {
    if (pre.querySelector(".copy-btn")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper group relative";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn absolute top-2 right-2 p-1.5 rounded bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity duration-150";
    btn.setAttribute("aria-label", "Copy code");
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

    btn.addEventListener("click", () => {
      const code = pre.querySelector("code");
      const text = code?.textContent || pre.textContent || "";
      navigator.clipboard.writeText(text).then(() => {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        btn.setAttribute("aria-label", "Copied!");
        setTimeout(() => {
          btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
          btn.setAttribute("aria-label", "Copy code");
        }, 2000);
      });
    });

    wrapper.appendChild(btn);
  });
}

export function BlogPostDisplay({
  selectedPostSlug,
  initialCompiled,
  onHeadingsChange,
}: BlogPostDisplayProps) {
  const [, forceRender] = useReducer((count: number) => count + 1, 0);
  const articleRef = useRef<HTMLElement>(null);
  const hasScrolledForSlug = useRef<string | null>(null);

  useEffect(() => {
    if (initialCompiled && selectedPostSlug && !postCache.has(selectedPostSlug)) {
      postCache.set(selectedPostSlug, { compiled: initialCompiled, error: null });
    }
  }, [initialCompiled, selectedPostSlug]);

  useEffect(() => {
    if (!selectedPostSlug) return;

    const cachedEntry = postCache.get(selectedPostSlug);
    if (cachedEntry && (cachedEntry.compiled !== null || cachedEntry.error !== null)) {
      return;
    }

    if (inFlightControllers.has(selectedPostSlug)) return;

    const abortController = new AbortController();
    inFlightControllers.set(selectedPostSlug, abortController);

    const encodedSlug = selectedPostSlug
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");

    fetch(`/api/posts/${encodedSlug}`, { signal: abortController.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((data: CompiledBundle) => {
        postCache.set(selectedPostSlug, { compiled: data, error: null });
        inFlightControllers.delete(selectedPostSlug);
        forceRender();
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          inFlightControllers.delete(selectedPostSlug);
          return;
        }
        postCache.set(selectedPostSlug, {
          compiled: null,
          error: err.message || "Failed to load post",
        });
        inFlightControllers.delete(selectedPostSlug);
        forceRender();
      });

    return () => {
      abortController.abort();
      inFlightControllers.delete(selectedPostSlug);
    };
  }, [selectedPostSlug]);

  const cachedEntry = selectedPostSlug ? postCache.get(selectedPostSlug) : null;
  const compiled = cachedEntry?.compiled ?? null;
  const error = cachedEntry?.error ?? null;

  const loading =
    !!selectedPostSlug &&
    (!cachedEntry ||
      (cachedEntry.compiled === null &&
        cachedEntry.error === null &&
        inFlightControllers.has(selectedPostSlug)));

  useEffect(() => {
    if (!compiled) {
      onHeadingsChange?.([]);
      return;
    }

    onHeadingsChange?.(compiled.headings);

    if (!articleRef.current) return;
    attachCopyButtons(articleRef.current);

    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || hasScrolledForSlug.current === `${selectedPostSlug}#${hash}`) return;

    const target = document.getElementById(decodeURIComponent(hash));
    if (target) {
      hasScrolledForSlug.current = `${selectedPostSlug}#${hash}`;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  }, [compiled, onHeadingsChange, selectedPostSlug]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      if (href.startsWith("http://") || href.startsWith("https://")) {
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute("rel", "noopener noreferrer");
      }
    },
    [],
  );

  return (
    <>
      {!selectedPostSlug ? (
        <div className="flex items-center justify-center py-20 opacity-50">
          <p className="text-[0.95rem]">Select a post from the directory</p>
        </div>
      ) : loading ? (
        <div className="py-10">
          <PostSkeleton />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 opacity-50">
          <p className="text-[0.95rem]">Error: {error}</p>
        </div>
      ) : !compiled ? (
        <div className="flex items-center justify-center py-20 opacity-50">
          <p className="text-[0.95rem]">Post not found</p>
        </div>
      ) : (
        <article
          ref={articleRef}
          className="note-body max-w-none min-w-0 overflow-x-hidden"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: compiled.html }}
        />
      )}
    </>
  );
}
