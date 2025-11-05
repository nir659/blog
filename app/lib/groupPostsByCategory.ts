import type { PostSummary, GroupedPosts } from "@/app/components/post-list";

// groups posts by category and sorts categories alphabetically
export function groupPostsByCategory(posts: PostSummary[]): GroupedPosts {
  const grouped: GroupedPosts = {};

  posts.forEach((post) => {
    const category = post.category || "Other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(post);
  });

  const sortedGrouped: GroupedPosts = {};
  Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .forEach((category) => {
      sortedGrouped[category] = grouped[category];
    });

  return sortedGrouped;
}

