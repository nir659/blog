import "server-only";

import { readFile, stat } from "fs/promises";
import { resolvePostFilePath } from "@/app/lib/post-paths";
import { compileMarkdown, type CompiledPost } from "@/app/lib/markdown";
import { buildWikilinkMap, createWikilinkResolver } from "@/app/lib/post-index";

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

type CacheEntry = {
  mtime: number;
  compiled: CompiledPost;
};

const compiledCache = new Map<string, CacheEntry>();

export async function getCompiledPost(filePath: string | string[]): Promise<CompiledPost | null> {
  try {
    const resolvedPath = resolvePostFilePath(filePath);
    if (!resolvedPath) return null;

    const fileStat = await stat(resolvedPath);
    const mtime = fileStat.mtimeMs;

    const cached = compiledCache.get(resolvedPath);
    if (cached && cached.mtime === mtime) {
      return cached.compiled;
    }

    const raw = await readFile(resolvedPath, "utf-8");
    const wikilinkMap = await buildWikilinkMap();
    const resolver = createWikilinkResolver(wikilinkMap);

    const compiled = await compileMarkdown(raw, { resolveWikilink: resolver });

    compiledCache.set(resolvedPath, { mtime, compiled });

    if (compiledCache.size > 200) {
      const firstKey = compiledCache.keys().next().value;
      if (firstKey) compiledCache.delete(firstKey);
    }

    return compiled;
  } catch (error) {
    console.error(`Error compiling post ${filePath}:`, error);
    return null;
  }
}
