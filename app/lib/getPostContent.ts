import "server-only";

import { readFile } from "fs/promises";
import { join, normalize, sep } from "path";

// reads markdown file from app/posts/ directory
export async function getPostContent(slug: string | string[]): Promise<string | null> {
  try {
    const postsDirectory = join(process.cwd(), "app", "posts");
    const normalizedPostsDirectory = normalize(postsDirectory + sep);

    const slugSegments = Array.isArray(slug) ? slug : slug.split("/");

    const safeSegments = slugSegments
      .map((segment) => segment.trim())
      .filter(Boolean)
      .filter((segment) => !segment.includes("..") && !segment.includes("\\"));

    if (safeSegments.length === 0) {
      return null;
    }

    const filePath = normalize(join(postsDirectory, ...safeSegments) + ".md");

    if (!filePath.startsWith(normalizedPostsDirectory)) {
      return null;
    }

    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}
