import { NextResponse } from "next/server";
import { getPostContent } from "@/app/lib/getPostContent";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";

type SlugParam = string | string[] | undefined;

export function normalizeSlugParam(slug: SlugParam): string | null {
  if (!slug) {
    return null;
  }

  const segments = Array.isArray(slug) ? slug : slug.split("/");
  const normalized = segments
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean);

  if (normalized.length === 0) {
    return null;
  }

  return normalized.join("/");
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function buildPostContentResponse(slug: string) {
  const { directoryTree } = await getPostIndex();
  const allPosts = getAllPostsFromTree(directoryTree);
  const post = allPosts.find((p) => p.slug === slug);

  if (!post) {
    return createErrorResponse("Post not found", 404);
  }

  const content = await getPostContent(post.filePath);

  if (!content) {
    return createErrorResponse("Post not found", 404);
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
