import { NextResponse } from "next/server";
import { getPostContent } from "@/app/lib/getPostContent";

type SlugParam = string | string[] | undefined;

export function normalizeSlugParam(slug: SlugParam): string[] | null {
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

  return normalized;
}

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function buildPostContentResponse(slugSegments: string[]) {
  const content = await getPostContent(slugSegments);

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
