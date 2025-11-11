import { getPostLastModified } from "@/app/lib/post-paths";
import { getAllPostsFromTree, getPostIndex } from "@/app/lib/posts";
import { buildPostPermalink, getSiteUrl } from "@/app/lib/site";

export const dynamic = "force-static";
export const revalidate = false;

function formatDate(date: Date | null): string {
  return (date ?? new Date(0)).toISOString();
}

export async function GET() {
  const { directoryTree } = await getPostIndex();
  const posts = getAllPostsFromTree(directoryTree);
  const siteUrl = getSiteUrl();

  const postEntries = await Promise.all(
    posts.map(async (post) => {
      const lastmod = await getPostLastModified(post.slug);
      return {
        loc: buildPostPermalink(post.slug),
        lastmod: formatDate(lastmod),
      };
    })
  );

  const homeLastMod =
    postEntries.reduce<string | null>((latest, entry) => {
      if (!latest || entry.lastmod > latest) {
        return entry.lastmod;
      }
      return latest;
    }, null) ?? new Date().toISOString();

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `<url><loc>${siteUrl}</loc><lastmod>${homeLastMod}</lastmod></url>`,
    postEntries
      .map((entry) => `<url><loc>${entry.loc}</loc><lastmod>${entry.lastmod}</lastmod></url>`)
      .join(""),
    "</urlset>",
  ].join("");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=31536000",
    },
  });
}
