"use client";

import type { PostSummary } from "./post-list";

type DirectoryGroupProps = {
  category: string;
  posts: PostSummary[];
  isOpen: boolean;
  onToggle: () => void;
  onPostSelect?: (slug: string) => void;
};

function FolderClosedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-9l-2-2H5a2 2 0 0 0-2 2z" />
    </svg>
  );
}

// renders single category folder with expandable post list
export function DirectoryGroup({
  category,
  posts,
  isOpen,
  onToggle,
  onPostSelect,
}: DirectoryGroupProps) {
  const contentId = `directory-content-${category
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center gap-3 py-3 px-4 text-left transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
      >
        <FolderClosedIcon />
        <span className="font-normal">{category}/</span>
      </button>

      <div
        id={contentId}
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-12 pr-4 pb-4">
          {posts.length === 0 ? (
            <p className="text-[0.85rem] opacity-50">nothing is here</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {posts.map((post, index) => (
                <li key={post.slug || `${post.category}-${index}`}>
                  {post.slug ? (
                    <button
                      onClick={() => onPostSelect?.(post.slug!)}
                      className="block w-full text-left text-[0.9rem] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
                    >
                      {post.title || post.category}
                      {post.date && (
                        <span className="ml-3 text-[0.8rem] opacity-50">
                          {post.date}
                        </span>
                      )}
                    </button>
                  ) : (
                    <span className="block text-[0.9rem] opacity-70">
                      {post.title || post.category}
                      {post.date && (
                        <span className="ml-3 text-[0.8rem] opacity-50">
                          {post.date}
                        </span>
                      )}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}