import { stat } from "fs/promises";
import { join, normalize, resolve, sep } from "path";

function isValidSegment(segment: string): boolean {
  return /^[a-z0-9.-]+$/i.test(segment) && !segment.startsWith(".") && !segment.endsWith(".");
}

const POSTS_DIRECTORY = process.env.POSTS_DIRECTORY
  ? resolve(process.env.POSTS_DIRECTORY)
  : join(process.cwd(), "app", "posts");

const NORMALIZED_POSTS_DIRECTORY = normalize(POSTS_DIRECTORY + sep);

function sanitizeSegments(slug: string | string[]): string[] | null {
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

  return safeSegments;
}

export function getPostsDirectory(): string {
  return POSTS_DIRECTORY;
}

export function resolvePostFilePath(slug: string | string[]): string | null {
  const safeSegments = sanitizeSegments(slug);

  if (!safeSegments) {
    return null;
  }

  const filePath = normalize(join(POSTS_DIRECTORY, ...safeSegments) + ".md");

  if (!filePath.startsWith(NORMALIZED_POSTS_DIRECTORY)) {
    return null;
  }

  return filePath;
}

export async function getPostLastModified(slug: string): Promise<Date | null> {
  const filePath = resolvePostFilePath(slug);

  if (!filePath) {
    return null;
  }

  try {
    const fileStat = await stat(filePath);
    return fileStat.mtime ?? fileStat.ctime ?? null;
  } catch {
    return null;
  }
}
