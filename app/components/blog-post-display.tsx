"use client";

import { useEffect, useMemo, useReducer } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type BlogPostDisplayProps = {
  selectedPostSlug: string | null;
};

type CacheEntry = {
  content: string | null;
  error: string | null;
};

const postContentCache = new Map<string, CacheEntry>();
const inFlightControllers = new Map<string, AbortController>();

// Memoized markdown components to avoid recreation on every render
function mergeClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(" ");
}

const markdownComponents = {
  h1: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-[2rem] font-bold mb-6 mt-8" {...props} />
  ),
  h2: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-[1.5rem] font-semibold mb-4 mt-6" {...props} />
  ),
  h3: ({ ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-[1.2rem] font-semibold mb-3 mt-5" {...props} />
  ),
  p: ({ ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 leading-relaxed text-[0.95rem]" {...props} />
  ),
  ul: ({ ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
  ),
  ol: ({ ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
  ),
  li: ({ ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[0.95rem]" {...props} />
  ),
  code: (props: { inline?: boolean } & React.HTMLAttributes<HTMLElement>) => {
    const { inline, className, ...rest } = props;
    const baseClassName = inline
      ? "bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-[0.9rem] rounded-sm"
      : "block bg-[rgba(255,255,255,0.05)] p-4 overflow-x-auto text-[0.85rem] my-4 rounded-md";
    return (
      <code
        className={mergeClassNames(baseClassName, className)}
        {...rest}
      />
    );
  },
  pre: ({ ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="mb-4" {...props} />
  ),
  blockquote: ({ ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-[var(--grid-lines)] pl-4 italic opacity-80 my-4"
      {...props}
    />
  ),
  hr: ({ ...props }: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="border-[var(--grid-lines)] my-8" {...props} />
  ),
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="underline transition-opacity duration-150 hover:opacity-70"
      {...props}
    />
  ),
  strong: ({ ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold" {...props} />
  ),
};

// renders markdown post content or loading/error states
export function BlogPostDisplay({ selectedPostSlug }: BlogPostDisplayProps) {
  const [, forceRender] = useReducer((count) => count + 1, 0);

  // fetches markdown content when post slug changes
  useEffect(() => {
    if (!selectedPostSlug) {
      return;
    }

    const cachedEntry = postContentCache.get(selectedPostSlug);
    if (cachedEntry && (cachedEntry.content !== null || cachedEntry.error !== null)) {
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
        postContentCache.set(selectedPostSlug, { content: null, error: errorMessage });
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

  // Memoize the rendered markdown to avoid re-parsing identical content
  const renderedContent = useMemo(() => {
    if (!content) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
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
        <div className="flex items-center justify-center py-20 opacity-50">
          <p className="text-[0.95rem]">Loading...</p>
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
        <article className="prose prose-invert max-w-none">
          {renderedContent}
        </article>
      )}
    </>
  );
}
