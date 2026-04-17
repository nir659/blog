import { NextResponse } from "next/server";
import { getCompiledPost } from "@/app/lib/getPostContent";
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

  const compiled = await getCompiledPost(post.filePath);

  if (!compiled) {
    return createErrorResponse("Post not found", 404);
  }

  return NextResponse.json(
    {
      html: compiled.html,
      headings: compiled.headings,
      frontmatter: compiled.frontmatter,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, must-revalidate",
      },
    },
  );
}
