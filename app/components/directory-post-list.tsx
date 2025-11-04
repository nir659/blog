"use client";

import { useState } from "react";
import type { PostSummary } from "./post-list";
import { groupPostsByCategory } from "@/app/lib/groupPostsByCategory";
import { DirectoryGroup } from "./directory-group";

type DirectoryPostListProps = {
  posts: PostSummary[];
};

export function DirectoryPostList({ posts }: DirectoryPostListProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  if (posts.length === 0) {
    return null;
  }

  const groupedPosts = groupPostsByCategory(posts);
  const categories = Object.keys(groupedPosts);

  const handleToggle = (category: string) => {
    // Accordion behavior: if already open, close it; otherwise open it
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
        />
      ))}
    </section>
  );
}

