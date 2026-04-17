import "server-only";

import { getAllPostsFromTree, getPostIndex, type DirectoryTreeNode } from "@/app/lib/posts";
import { buildPostPath } from "@/app/lib/slug";

function normalize(name: string): string {
  return name.toLowerCase().replace(/[-_\s]+/g, " ").trim();
}

export async function buildWikilinkMap(): Promise<Map<string, string>> {
  const { directoryTree } = await getPostIndex();
  const posts = getAllPostsFromTree(directoryTree);
  const map = new Map<string, string>();

  for (const post of posts) {
    const segments = post.filePath.split("/");
    const fileName = segments[segments.length - 1];
    const key = normalize(fileName);
    const url = buildPostPath(post.slug);

    if (!map.has(key)) {
      map.set(key, url);
    }
  }

  return map;
}

export function createWikilinkResolver(map: Map<string, string>) {
  return (target: string): string | null => {
    const hashIndex = target.indexOf("#");
    const noteName = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
    const anchor = hashIndex >= 0 ? target.slice(hashIndex) : "";

    const key = normalize(noteName);
    const url = map.get(key);

    if (!url) {
      console.warn(`[wikilink] unresolved: [[${target}]]`);
      return null;
    }

    return anchor ? `${url}${anchor}` : url;
  };
}
