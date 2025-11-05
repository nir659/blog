"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPostDisplayProps = {
  selectedPostSlug: string | null;
};

// Memoized markdown components to avoid recreation on every render
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
    const { inline, ...rest } = props;
    return inline ? (
      <code
        className="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-[0.9rem]"
        {...rest}
      />
    ) : (
      <code
        className="block bg-[rgba(255,255,255,0.05)] p-4 overflow-x-auto text-[0.85rem] my-4"
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
  const [fetchState, setFetchState] = useState<{
    slug: string | null;
    content: string | null;
    error: string | null;
  }>({ slug: null, content: null, error: null });

  // fetches markdown content when post slug changes
  useEffect(() => {
    if (!selectedPostSlug) {
      return;
    }

    const abortController = new AbortController();

    fetch(`/api/posts/${selectedPostSlug}`, {
      signal: abortController.signal,
      next: { revalidate: 3600 },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Post not found");
        }
        return res.text();
      })
      .then((text) => {
        setFetchState({ slug: selectedPostSlug, content: text, error: null });
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setFetchState({
          slug: selectedPostSlug,
          content: null,
          error: err.message || "Failed to load post",
        });
      });

    return () => {
      abortController.abort();
    };
  }, [selectedPostSlug]);

  const loading = selectedPostSlug !== null && fetchState.slug !== selectedPostSlug;
  const content = fetchState.slug === selectedPostSlug ? fetchState.content : null;
  const error = fetchState.slug === selectedPostSlug ? fetchState.error : null;

  // Memoize the rendered markdown to avoid re-parsing identical content
  const renderedContent = useMemo(() => {
    if (!content) return null;
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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

