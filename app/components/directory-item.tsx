"use client";

import type { DirectoryMeta, PostMeta } from "@/app/lib/posts";

type DirectoryItemProps =
  | {
      type: "directory";
      directory: DirectoryMeta;
      isOpen: boolean;
      onToggle: () => void;
      onPostSelect?: (slug: string) => void;
    }
  | {
      type: "post";
      post: PostMeta;
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

function DocumentIcon() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// unified component that renders either a directory folder or item
export function DirectoryItem(props: DirectoryItemProps) {
  if (props.type === "directory") {
    const { directory, isOpen, onToggle, onPostSelect } = props;
    const key = directory.path || directory.label;
    const contentId = `directory-content-${key
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || "root"}`;

    return (
      <div>
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex w-full items-center gap-3 py-3 px-4 text-left transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
        >
          <FolderClosedIcon />
          <span className="font-normal">{directory.label}/</span>
        </button>

        <div
          id={contentId}
          className={`overflow-hidden transition-all duration-200 ${
            isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pl-12 pr-4 pb-4">
            {directory.posts.length === 0 ? (
              <p className="text-[0.85rem] opacity-50">nothing is here</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {directory.posts.map((post) => (
                  <li key={post.slug} className="flex items-center gap-2">
                    <DocumentIcon />
                    <button
                      onClick={() => onPostSelect?.(post.slug)}
                      className="block w-full text-left text-[0.9rem] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
                    >
                      {post.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // type === "post"
  const { post, onPostSelect } = props;
  return (
    <li className="flex items-center gap-3 py-3 px-4">
      <DocumentIcon />
      <button
        onClick={() => onPostSelect?.(post.slug)}
        className="block w-full text-left text-[0.9rem] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
      >
        {post.title}
      </button>
    </li>
  );
}

