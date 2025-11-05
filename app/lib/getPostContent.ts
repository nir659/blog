import { readFile } from "fs/promises";
import { join } from "path";

// reads markdown file from app/posts/ directory
export async function getPostContent(slug: string): Promise<string | null> {
  try {
    const postsDirectory = join(process.cwd(), "app", "posts");
    const filePath = join(postsDirectory, `${slug}.md`);
    const content = await readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

