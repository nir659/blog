import type { NextRequest } from "next/server";
import {
  buildPostContentResponse,
  createErrorResponse,
  normalizeSlugParam,
} from "@/app/api/posts/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const normalizedSlug = normalizeSlugParam(slug);

  if (!normalizedSlug) {
    return createErrorResponse("Slug is required", 400);
  }

  return buildPostContentResponse(normalizedSlug);
}
