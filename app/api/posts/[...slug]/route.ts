import type { NextRequest } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import {
  buildPostContentResponse,
  createErrorResponse,
  normalizeSlugParam,
} from "@/app/api/posts/utils";

// api route to serve markdown post content from nested directories
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  noStore();

  const { slug } = await params;
  const slugSegments = normalizeSlugParam(slug);

  if (!slugSegments) {
    return createErrorResponse("Slug is required", 400);
  }

  return buildPostContentResponse(slugSegments);
}
