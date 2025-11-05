import { readdir } from "fs/promises";
import { join } from "path";

export type PostMeta = {
  directory: string;
  slug: string;
  title: string;
};

export type DirectoryMeta = {
  path: string;
  label: string;
  posts: PostMeta[];
};

export type PostIndex = {
  directories: DirectoryMeta[];
  rootPosts: PostMeta[];
};

const POSTS_DIRECTORY = join(process.cwd(), "app", "posts");
const MD_EXTENSION = ".md";

function formatTitleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildSlug(pathSegments: string[], fileSlug: string): string {
  const slugSegments = [...pathSegments, fileSlug].filter(Boolean);
  return slugSegments.join("/");
}

function directoryLabel(pathSegments: string[]): string {
  return pathSegments.length === 0 ? "root" : pathSegments.join("/");
}

async function readDirectory(pathSegments: string[]): Promise<DirectoryMeta[]> {
  const directoryPath = join(POSTS_DIRECTORY, ...pathSegments);
  const entries = await readdir(directoryPath, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(MD_EXTENSION))
    .sort((a, b) => a.name.localeCompare(b.name));

  const posts: PostMeta[] = files.map((file) => {
    const baseName = file.name.slice(0, -MD_EXTENSION.length);
    return {
      directory: directoryLabel(pathSegments),
      slug: buildSlug(pathSegments, baseName),
      title: formatTitleFromSlug(baseName),
    };
  });

  const currentDirectory: DirectoryMeta = {
    path: pathSegments.join("/"),
    label: directoryLabel(pathSegments),
    posts,
  };

  const nestedDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const directories: DirectoryMeta[] = [currentDirectory];

  for (const directory of nestedDirectories) {
    const childSegments = [...pathSegments, directory.name];
    const nested = await readDirectory(childSegments);
    directories.push(...nested);
  }

  return directories;
}

export async function getPostIndex(): Promise<PostIndex> {
  const directories = await readDirectory([]);

  const [rootDirectory, ...rest] = directories;
  const sortedDirectories = rest.sort((a, b) => a.path.localeCompare(b.path));
  const rootPosts = (rootDirectory?.posts ?? []).sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return {
    directories: sortedDirectories,
    rootPosts,
  };
}
