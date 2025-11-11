import { getPostContent } from "@/app/lib/getPostContent";
import { getPostLastModified } from "@/app/lib/post-paths";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";
import { buildPostPermalink, getSiteUrl, withSiteUrl } from "@/app/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

const FEED_TITLE = "Blog";
const FEED_SUBTITLE = "Latest updates from the markdown archive.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function summarizeContent(content: string): string {
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, " ");
  const withoutLinks = withoutCodeBlocks
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const withoutMarkdownSyntax = withoutLinks
    .replace(/^#+\s*/gm, "")
    .replace(/[*_>`~]/g, "");
  const collapsed = withoutMarkdownSyntax.replace(/\s+/g, " ").trim();

  if (!collapsed) {
    return "";
  }

  return collapsed.length > 280 ? `${collapsed.slice(0, 277)}...` : collapsed;
}

export async function GET() {
  const { directoryTree } = await getPostIndex();
  const posts = getAllPostsFromTree(directoryTree);
  const siteUrl = getSiteUrl();
  const feedSelfUrl = withSiteUrl("/feed.xml");

  const entryResults = await Promise.all(
    posts.map(async (post) => {
      const [content, updatedDate] = await Promise.all([
        getPostContent(post.slug),
        getPostLastModified(post.slug),
      ]);

      const body = content ?? "";
      const summary = summarizeContent(body) || post.title;
      const permalink = buildPostPermalink(post.slug);
      const updated = (updatedDate ?? new Date(0)).toISOString();

      const xml = [
        "<entry>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link href="${permalink}"/>`,
        `<id>${permalink}</id>`,
        `<updated>${updated}</updated>`,
        `<summary>${escapeXml(summary)}</summary>`,
        `<content type="text">${escapeXml(body)}</content>`,
        "</entry>",
      ].join("");

      return { xml, updated };
    })
  );

  const latestUpdated =
    entryResults.reduce<string | null>((latest, entry) => {
      if (!latest || entry.updated > latest) {
        return entry.updated;
      }
      return latest;
    }, null) ?? new Date().toISOString();

  const feedXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<title>${escapeXml(FEED_TITLE)}</title>`,
    `<subtitle>${escapeXml(FEED_SUBTITLE)}</subtitle>`,
    `<id>${siteUrl}</id>`,
    `<link href="${feedSelfUrl}" rel="self"/>`,
    `<link href="${siteUrl}"/>`,
    `<updated>${latestUpdated}</updated>`,
    entryResults.map((entry) => entry.xml).join(""),
    "</feed>",
  ].join("");

  return new Response(feedXml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=31536000",
    },
  });
}
