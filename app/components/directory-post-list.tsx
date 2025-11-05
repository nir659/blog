"use client";

import { useMemo, useState } from "react";
import type { DirectoryMeta, PostMeta } from "@/app/lib/posts";
import { DirectoryItem } from "./directory-item";

type DirectoryPostListProps = {
  directories: DirectoryMeta[];
  rootPosts: PostMeta[];
  onPostSelect?: (slug: string) => void;
};

// renders expandable directory folders, including empty directories
export function DirectoryPostList({ directories, rootPosts, onPostSelect }: DirectoryPostListProps) {
  const directoryKeys = useMemo(
    () => directories.map((directory) => directory.path),
    [directories]
  );
  const [openDirectory, setOpenDirectory] = useState<string | null>(
    directoryKeys[0] ?? null
  );
  const activeDirectory =
    openDirectory && directoryKeys.includes(openDirectory)
      ? openDirectory
      : directoryKeys[0] ?? null;

  if (directories.length === 0 && rootPosts.length === 0) {
    return null;
  }

  const handleToggle = (key: string) => {
    setOpenDirectory((previous) => (previous === key ? null : key));
  };

  const containerClass = rootPosts.length > 0 && directories.length > 0
    ? ""
    : rootPosts.length > 0 ? "pt-2" : "";

  return (
    <section id="archive" className="flex flex-col">
      {directories.map((directory) => {
        const key = directory.path;
        return (
          <DirectoryItem
            key={key}
            type="directory"
            directory={directory}
            isOpen={activeDirectory === key}
            onToggle={() => handleToggle(key)}
            onPostSelect={onPostSelect}
          />
        );
      })}
      {rootPosts.length > 0 && (
        <div className={containerClass}>
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
