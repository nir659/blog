"use client";

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Skeleton } from "@/app/components/skeleton";

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(() => {
    if (preRef.current) {
      const code = preRef.current.querySelector("code");
      const text = code?.textContent || preRef.current.textContent || "";
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

  return (
    <div className="group relative">
      <pre
        ref={preRef}
        className="mb-4 bg-[rgba(255,255,255,0.05)] p-4 rounded-md overflow-x-auto text-[0.85rem] font-mono [&>code]:block [&>code]:w-full"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 transition-opacity duration-150"
        aria-label={copied ? "Copied!" : "Copy code"}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

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

export function BlogPostDisplay({
  selectedPostSlug,
  onHeadingsChange,
}: BlogPostDisplayProps) {
  const [, forceRender] = useReducer((count) => count + 1, 0);
  const articleRef = useRef<HTMLElement>(null);

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

    const encodedSlug = selectedPostSlug
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");

    fetch(`/api/posts/${encodedSlug}`, {
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

  const hasScrolledForSlug = useRef<string | null>(null);

  useEffect(() => {
    if (!content || !articleRef.current) {
      onHeadingsChange?.([]);
      return;
    }

    const timer = setTimeout(() => {
      if (!articleRef.current) return;
      const headings = extractHeadingsFromDOM(articleRef.current);
      onHeadingsChange?.(headings);

      const hash = window.location.hash.replace(/^#/, "");
      if (!hash || hasScrolledForSlug.current === `${selectedPostSlug}#${hash}`) return;

      const target = document.getElementById(decodeURIComponent(hash));
      if (target) {
        hasScrolledForSlug.current = `${selectedPostSlug}#${hash}`;
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [content, onHeadingsChange, selectedPostSlug]);

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
            const { className, children, ...rest } = props;
            const isInline = !className?.includes("language-");
            if (isInline) {
              return (
                <code
                  className="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 text-[0.9em] rounded-sm font-mono"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
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
              target={props.href?.startsWith("http") ? "_blank" : undefined}
              rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
              {...props}
            />
          ),
          strong: (props) => <strong className="font-semibold" {...props} />,
          em: (props) => <em className="italic" {...props} />,
          del: (props) => <del className="line-through opacity-70" {...props} />,
          table: (props) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse text-[0.9rem]" {...props} />
            </div>
          ),
          thead: (props) => (
            <thead className="border-b border-[var(--grid-lines)]" {...props} />
          ),
          tbody: (props) => <tbody {...props} />,
          tr: (props) => (
            <tr className="border-b border-[var(--grid-lines)] last:border-0" {...props} />
          ),
          th: (props) => (
            <th className="px-3 py-2 text-left font-semibold" {...props} />
          ),
          td: (props) => <td className="px-3 py-2" {...props} />,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="max-w-full h-auto rounded-md my-4"
              loading="lazy"
              alt={props.alt || ""}
              {...props}
            />
          ),
          input: (props) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="mr-2 accent-white"
                  disabled
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
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
        <article ref={articleRef} className="prose prose-invert max-w-none min-w-0 overflow-x-hidden">
          {renderedContent}
        </article>
      )}
    </>
  );
}
