import { NextRequest, NextResponse } from "next/server";
import { getPostContent } from "@/app/lib/getPostContent";

// api route to serve markdown post content from nested directories
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const slugSegments = Array.isArray(slug) ? slug : [];

  if (!slugSegments || slugSegments.length === 0) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const content = await getPostContent(slugSegments);

  if (!content) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
