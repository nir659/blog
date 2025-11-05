"use client";

import { useState } from "react";
import type { PostSummary } from "./post-list";
import { groupPostsByCategory } from "@/app/lib/groupPostsByCategory";
import { DirectoryGroup } from "./directory-group";

type DirectoryPostListProps = {
  posts: PostSummary[];
  onPostSelect?: (slug: string) => void;
};

// renders expandable directory folders grouped by category
export function DirectoryPostList({ posts, onPostSelect }: DirectoryPostListProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (posts.length === 0) {
    return null;
  }

  const groupedPosts = groupPostsByCategory(posts);
  const categories = Object.keys(groupedPosts);

  // accordion behavior: only one category open at a time
  const handleToggle = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  return (
    <section id="archive" className="flex flex-col">
      {categories.map((category) => (
        <DirectoryGroup
          key={category}
          category={category}
          posts={groupedPosts[category]}
          isOpen={openCategory === category}
          onToggle={() => handleToggle(category)}
          onPostSelect={onPostSelect}
        />
      ))}
    </section>
  );
}

