import "server-only";

import { readFile } from "fs/promises";
import { join, normalize, resolve, sep } from "path";

function isValidSegment(segment: string): boolean {
  return /^[a-z0-9.-]+$/i.test(segment) && !segment.startsWith('.') && !segment.endsWith('.');
}

// reads markdown file from app/posts/ directory
export async function getPostContent(slug: string | string[]): Promise<string | null> {
  try {
    const postsDirectory = process.env.POSTS_DIRECTORY
      ? resolve(process.env.POSTS_DIRECTORY)
      : join(process.cwd(), "app", "posts");
    const normalizedPostsDirectory = normalize(postsDirectory + sep);

    const slugSegments = Array.isArray(slug) ? slug : slug.split("/");

    const safeSegments = slugSegments
      .map((segment) => decodeURIComponent(segment).trim())
      .filter(Boolean)
      .filter((segment) => !segment.includes("..") && !segment.includes("\\"))
      .filter(isValidSegment);

    if (safeSegments.length !== slugSegments.length) {
      return null;
    }

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
