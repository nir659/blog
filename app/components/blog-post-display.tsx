"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Skeleton } from "@/app/components/skeleton";

export type Heading = {
  id: string;
  text: string;
  level: 1 | 2;
};

type BlogPostDisplayProps = {
  selectedPostSlug: string | null;
  onHeadingsChange?: (headings: Heading[]) => void;
};

type CacheEntry = {
  content: string | null;
  error: string | null;
};

const postContentCache = new Map<string, CacheEntry>();
const inFlightControllers = new Map<string, AbortController>();

// Extract headings from the rendered DOM to ensure IDs match exactly
function extractHeadingsFromDOM(container: HTMLElement): Heading[] {
  const headings: Heading[] = [];
  const elements = container.querySelectorAll("h1[id], h2[id]");

  elements.forEach((el) => {
    const level = el.tagName === "H1" ? 1 : 2;
    const id = el.getAttribute("id");
    const text = el.textContent?.trim() || "";

    if (id && text) {
      headings.push({ id, text, level: level as 1 | 2 });
    }
  });

  return headings;
}

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

// renders markdown post content or loading/error states
export function BlogPostDisplay({
  selectedPostSlug,
  onHeadingsChange,
}: BlogPostDisplayProps) {
  const [, forceRender] = useReducer((count) => count + 1, 0);
  const articleRef = useRef<HTMLElement>(null);

  // fetches markdown content when post slug changes
  useEffect(() => {
    if (!selectedPostSlug) {
      return;
    }

    const cachedEntry = postContentCache.get(selectedPostSlug);
    if (
      cachedEntry &&
      (cachedEntry.content !== null || cachedEntry.error !== null)
    ) {
      return;
    }

    if (inFlightControllers.has(selectedPostSlug)) {
      return;
    }

    const abortController = new AbortController();
    inFlightControllers.set(selectedPostSlug, abortController);

    fetch(`/api/posts/${selectedPostSlug}`, {
      signal: abortController.signal,
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Post not found");
        }
        return res.text();
      })
      .then((text) => {
        postContentCache.set(selectedPostSlug, { content: text, error: null });
        inFlightControllers.delete(selectedPostSlug);
        forceRender();
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          inFlightControllers.delete(selectedPostSlug);
          return;
        }
        const errorMessage = err.message || "Failed to load post";
        postContentCache.set(selectedPostSlug, {
          content: null,
          error: errorMessage,
        });
        inFlightControllers.delete(selectedPostSlug);
        forceRender();
      });

    return () => {
      abortController.abort();
      inFlightControllers.delete(selectedPostSlug);
    };
  }, [selectedPostSlug]);

  const cachedEntry = selectedPostSlug
    ? postContentCache.get(selectedPostSlug)
    : null;
  const content =
    cachedEntry && cachedEntry.content !== null ? cachedEntry.content : null;
  const error = cachedEntry?.error ?? null;

  const loading =
    !!selectedPostSlug &&
    (!cachedEntry ||
      (cachedEntry.content === null &&
        cachedEntry.error === null &&
        inFlightControllers.has(selectedPostSlug)));

  // Extract headings from DOM after render and notify parent
  useEffect(() => {
    if (!content || !articleRef.current) {
      onHeadingsChange?.([]);
      return;
    }

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      if (articleRef.current) {
        const headings = extractHeadingsFromDOM(articleRef.current);
        onHeadingsChange?.(headings);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [content, onHeadingsChange]);

  // Memoize the rendered markdown to avoid re-parsing identical content
  const renderedContent = useMemo(() => {
    if (!content) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          h1: (props) => (
            <h1 className="text-[2rem] font-bold mb-6 mt-8" {...props} />
          ),
          h2: (props) => (
            <h2
              className="text-[1.5rem] font-semibold mb-4 mt-6 scroll-mt-6"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="text-[1.2rem] font-semibold mb-3 mt-5 scroll-mt-6"
              {...props}
            />
          ),
          p: (props) => (
            <p className="mb-4 leading-relaxed text-[0.95rem]" {...props} />
          ),
          ul: (props) => (
            <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
          ),
          ol: (props) => (
            <ol
              className="list-decimal list-inside mb-4 space-y-2"
              {...props}
            />
          ),
          li: (props) => <li className="text-[0.95rem]" {...props} />,
          code: (props) => {
            const { className, ...rest } = props;
            const isInline = !className?.includes("language-");
            const baseClassName = isInline
              ? "bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-[0.9rem] rounded-sm"
              : "block bg-[rgba(255,255,255,0.05)] p-4 overflow-x-auto text-[0.85rem] my-4 rounded-md";
            return (
              <code
                className={[baseClassName, className].filter(Boolean).join(" ")}
                {...rest}
              />
            );
          },
          pre: (props) => <pre className="mb-4" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-[var(--grid-lines)] pl-4 italic opacity-80 my-4"
              {...props}
            />
          ),
          hr: (props) => (
            <hr className="border-[var(--grid-lines)] my-8" {...props} />
          ),
          a: (props) => (
            <a
              className="underline transition-opacity duration-150 hover:opacity-70"
              {...props}
            />
          ),
          strong: (props) => <strong className="font-semibold" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content]);

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
      ) : !content ? (
        <div className="flex items-center justify-center py-20 opacity-50">
          <p className="text-[0.95rem]">Post not found</p>
        </div>
      ) : (
        <article ref={articleRef} className="prose prose-invert max-w-none">
          {renderedContent}
        </article>
      )}
    </>
  );
}
