"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type BlogPostDisplayProps = {
  selectedPostSlug: string | null;
};

export function BlogPostDisplay({ selectedPostSlug }: BlogPostDisplayProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPostSlug) {
      return;
    }

    let isMounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setContent(null);

    // Fetch markdown content
    fetch(`/api/posts/${selectedPostSlug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Post not found");
        }
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load post");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPostSlug]);

  return (
    <div className="h-full overflow-y-auto">
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-[2rem] font-bold mb-6 mt-8" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-[1.5rem] font-semibold mb-4 mt-6" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-[1.2rem] font-semibold mb-3 mt-5" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="mb-4 leading-relaxed text-[0.95rem]" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="text-[0.95rem]" {...props} />
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code: (props: any) => {
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
          pre: ({ ...props }) => (
            <pre className="mb-4" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-2 border-[var(--grid-lines)] pl-4 italic opacity-80 my-4"
              {...props}
            />
          ),
          hr: ({ ...props }) => (
            <hr className="border-[var(--grid-lines)] my-8" {...props} />
          ),
          a: ({ ...props }) => (
            <a
              className="underline transition-opacity duration-150 hover:opacity-70"
              {...props}
            />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
        }}
      >
          {content}
        </ReactMarkdown>
      </article>
      )}
    </div>
  );
}

