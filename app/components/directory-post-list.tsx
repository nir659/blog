"use client";

import clsx from "clsx";
import { memo, useMemo, useState } from "react";
import type { DirectoryTreeNode, PostMeta } from "@/app/lib/posts";
import { DirectoryItem } from "./directory-item";

type DirectoryPostListProps = {
  directoryTree: DirectoryTreeNode;
  rootPosts: PostMeta[];
  onPostSelect?: (slug: string) => void;
};

type DirectoryBranchProps = {
  node: DirectoryTreeNode;
  depth: number;
  defaultOpen?: boolean;
  onPostSelect?: (slug: string) => void;
};

function DirectoryBranch({
  node,
  depth,
  defaultOpen = false,
  onPostSelect,
}: DirectoryBranchProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const content = (
    <div className="flex flex-col">
      {node.posts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {node.posts.map((post) => (
            <DirectoryItem
              key={post.slug}
              type="post"
              post={post}
              depth={depth + 1}
              onPostSelect={onPostSelect}
            />
          ))}
        </ul>
      )}

      {node.directories.length > 0 && (
        <div className="flex flex-col">
          {node.directories.map((child) => (
            <MemoizedDirectoryBranch
              key={child.path || child.label}
              node={child}
              depth={depth + 1}
              onPostSelect={onPostSelect}
            />
          ))}
        </div>
      )}

      {node.posts.length === 0 && node.directories.length === 0 && (
        <p className="text-[0.85rem] opacity-50">nothing is here</p>
      )}
    </div>
  );

  return (
    <DirectoryItem
      type="directory"
      node={node}
      depth={depth}
      isOpen={isOpen}
      onToggle={() => setIsOpen((previous) => !previous)}
    >
      {content}
    </DirectoryItem>
  );
}

// renders expandable directory folders, including empty directories
function DirectoryPostListComponent({
  directoryTree,
  rootPosts,
  onPostSelect,
}: DirectoryPostListProps) {
  const topLevelDirectories = useMemo(
    () => directoryTree.directories,
    [directoryTree]
  );
  const firstDirectoryPath = topLevelDirectories[0]?.path ?? null;

  const hasDirectories = topLevelDirectories.length > 0;
  const hasRootPosts = rootPosts.length > 0;

  if (!hasDirectories && !hasRootPosts) {
    return null;
  }

  const rootPostContainerClass = clsx(
    "flex flex-col",
    !hasDirectories && hasRootPosts && "pt-2"
  );

  return (
    <section id="archive" className="flex flex-col">
      {topLevelDirectories.map((directory) => (
        <MemoizedDirectoryBranch
          key={directory.path || directory.label}
          node={directory}
          depth={0}
          defaultOpen={directory.path === firstDirectoryPath}
          onPostSelect={onPostSelect}
        />
      ))}

      {hasRootPosts && (
        <div className={rootPostContainerClass}>
          <ul className="flex flex-col">
            {rootPosts.map((post) => (
              <DirectoryItem
                key={post.slug}
                type="post"
                post={post}
                onPostSelect={onPostSelect}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

const MemoizedDirectoryBranch = memo(DirectoryBranch);

export const DirectoryPostList = memo(DirectoryPostListComponent);
