import { NextRequest, NextResponse } from "next/server";
import { getPostContent } from "@/app/lib/getPostContent";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  
  if (!slug) {
    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
  }

  const content = await getPostContent(slug);

  if (!content) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

