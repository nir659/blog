import "server-only";

import { readFile } from "fs/promises";
import { resolvePostFilePath } from "@/app/lib/post-paths";

// reads markdown file from app/posts/ directory
export async function getPostContent(slug: string | string[]): Promise<string | null> {
  try {
    const filePath = resolvePostFilePath(slug);

    if (!filePath) {
      return null;
    }

    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}
