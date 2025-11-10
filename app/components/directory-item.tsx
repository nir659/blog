"use client";

import type { ReactNode } from "react";
import type { DirectoryTreeNode, PostMeta } from "@/app/lib/posts";

type DirectoryItemProps =
  | {
      type: "directory";
      node: DirectoryTreeNode;
      depth: number;
      isOpen: boolean;
      onToggle: () => void;
      children?: ReactNode;
    }
  | {
      type: "post";
      post: PostMeta;
      depth?: number;
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

function directoryContentId(node: DirectoryTreeNode): string {
  const key = node.path || node.label || "root";
  const normalized = key.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `directory-content-${normalized || "root"}`;
}

function indentFromDepth(depth: number): string {
  const base = 0.4;
  const step = 0.3;
  return `${base + depth * step}rem`;
}

export function DirectoryItem(props: DirectoryItemProps) {
  if (props.type === "directory") {
    const { node, depth, isOpen, onToggle, children } = props;
    const contentId = directoryContentId(node);
    const buttonPaddingLeft = indentFromDepth(depth);
    const contentPaddingLeft = indentFromDepth(depth + 1);

    return (
      <div>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="flex w-full items-center gap-2 py-2 text-left transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
          style={{ paddingLeft: buttonPaddingLeft }}
        >
          <FolderClosedIcon />
          <span className="font-normal">{node.label}/</span>
        </button>

        <div
          id={contentId}
          className={`overflow-hidden transition-all duration-200 ${
            isOpen ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-1" style={{ paddingLeft: contentPaddingLeft }}>
            {children ?? (
              <p className="text-[0.85rem] opacity-50">nothing is here</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { post, depth = 0, onPostSelect } = props;
  const paddingLeft = indentFromDepth(depth);

  return (
    <li
      className="flex items-center gap-3 py-1 pr-2"
      style={{ paddingLeft }}
    >
      <DocumentIcon />
      <button
        type="button"
        onClick={() => onPostSelect?.(post.slug)}
        className="block w-full text-left text-[0.9rem] transition-opacity duration-150 hover:opacity-70 focus:outline-none focus:opacity-70 cursor-pointer"
      >
        {post.title}
      </button>
    </li>
  );
}
