export function buildPostPath(slug: string, hash?: string): string {
  const segments = slug.split("/").map((s) => encodeURIComponent(s));
  const path = `/${segments.join("/")}`;
  return hash ? `${path}#${hash}` : path;
}
