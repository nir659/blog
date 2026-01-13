"use client";

import clsx from "clsx";
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

const buttonBaseClasses =
  "cursor-pointer flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[0.9rem]";
const buttonStateClasses =
  "transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white/30 hover:bg-white/5 focus-visible:bg-white/10";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      aria-hidden="true"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
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
  const base = 0.25;
  const step = 0.65;
  return `${base + depth * step}rem`;
}

export function DirectoryItem(props: DirectoryItemProps) {
  if (props.type === "directory") {
    const { node, depth, isOpen, onToggle, children } = props;
    const contentId = directoryContentId(node);
    const paddingLeft = indentFromDepth(depth);
    const childPaddingLeft = indentFromDepth(depth + 1);
    const buttonClassName = clsx(buttonBaseClasses, buttonStateClasses);

    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={buttonClassName}
          style={{ paddingLeft }}
        >
          <ChevronIcon open={isOpen} />
          <FolderIcon />
          <span className="font-normal">{node.label}</span>
        </button>

        <div
          id={contentId}
          className={`overflow-hidden transition-all duration-200 ${
            isOpen ? "max-h-[1500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pb-1" style={{ paddingLeft: childPaddingLeft }}>
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
  const buttonClassName = clsx(buttonBaseClasses, buttonStateClasses);

  return (
    <li>
      <button
        type="button"
        onClick={() => onPostSelect?.(post.slug)}
        className={buttonClassName}
        style={{ paddingLeft }}
      >
        <DocumentIcon />
        <span>{post.title}</span>
      </button>
    </li>
  );
}
