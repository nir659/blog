import type { PostSummary, GroupedPosts } from "@/app/components/post-list";

export function groupPostsByCategory(posts: PostSummary[]): GroupedPosts {
  const grouped: GroupedPosts = {};

  // Group posts by category
  posts.forEach((post) => {
    const category = post.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(post);
  });

  // Sort categories alphabetically
  const sortedGrouped: GroupedPosts = {};
  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .forEach((category) => {
      sortedGrouped[category] = grouped[category];
    });

  return sortedGrouped;
}

