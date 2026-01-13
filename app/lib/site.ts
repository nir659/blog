const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    const pathname =
      url.pathname === "/" ? "" : url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname}`;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

const SITE_URL = normalizeSiteUrl(
  process.env.SITE_URL ?? process.env.PROD_URL ?? FALLBACK_SITE_URL
);

export function getSiteUrl(): string {
  return SITE_URL;
}

export function withSiteUrl(pathname: string): string {
  const normalizedPath =
    pathname && pathname !== "/"
      ? pathname.startsWith("/")
        ? pathname
        : `/${pathname}`
      : "/";
  const baseUrl = new URL(SITE_URL.endsWith("/") ? SITE_URL : `${SITE_URL}/`);

  if (normalizedPath === "/") {
    return baseUrl.toString();
  }

  const basePath = baseUrl.pathname.endsWith("/")
    ? baseUrl.pathname.slice(0, -1)
    : baseUrl.pathname;

  baseUrl.pathname =
    basePath === "" || basePath === "/"
      ? normalizedPath
      : `${basePath}${normalizedPath}`;

  return baseUrl.toString().replace(/\/+$/, "");
}

export function buildPostPermalink(slug: string): string {
  const url = new URL(SITE_URL);
  url.hash = "";
  url.search = "";
  url.searchParams.set("slug", slug);
  return url.toString();
}
