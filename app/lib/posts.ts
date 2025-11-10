import "server-only";

import type { Dirent } from "fs";
import { readdir } from "fs/promises";
import { join, resolve } from "path";

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

export type DirectoryTreeNode = {
  path: string;
  label: string;
  posts: PostMeta[];
  directories: DirectoryTreeNode[];
};

export type PostIndex = {
  directories: DirectoryMeta[];
  rootPosts: PostMeta[];
  directoryTree: DirectoryTreeNode;
};

const POSTS_DIRECTORY = process.env.POSTS_DIRECTORY
  ? resolve(process.env.POSTS_DIRECTORY)
  : join(process.cwd(), "app", "posts");
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
  if (pathSegments.length === 0) {
    return "root";
  }
  return pathSegments[pathSegments.length - 1];
}

function directoryIdentifier(pathSegments: string[]): string {
  return pathSegments.length === 0 ? "root" : pathSegments.join("/");
}

async function readDirectoryEntries(pathSegments: string[]): Promise<Dirent[]> {
  const directoryPath = join(POSTS_DIRECTORY, ...pathSegments);
  try {
    return await readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function buildDirectoryTree(pathSegments: string[]): Promise<DirectoryTreeNode> {
  const entries = await readDirectoryEntries(pathSegments);
  const directoryPath = pathSegments.join("/");
  const displayLabel = directoryLabel(pathSegments);
  const directoryValue = directoryIdentifier(pathSegments);

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(MD_EXTENSION))
    .sort((a, b) => a.name.localeCompare(b.name));

  const posts: PostMeta[] = files.map((file) => {
    const baseName = file.name.slice(0, -MD_EXTENSION.length);
    return {
      directory: directoryValue,
      slug: buildSlug(pathSegments, baseName),
      title: formatTitleFromSlug(baseName),
    };
  });

  const directories: DirectoryTreeNode[] = [];
  const subdirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const subdir of subdirectories) {
    const childSegments = [...pathSegments, subdir.name];
    const childTree = await buildDirectoryTree(childSegments);
    directories.push(childTree);
  }

  return {
    path: directoryPath,
    label: displayLabel,
    posts,
    directories,
  };
}

function collectPostsFromSubtree(node: DirectoryTreeNode): PostMeta[] {
  return node.directories.reduce<PostMeta[]>(
    (acc, child) => [...acc, ...collectPostsFromSubtree(child)],
    [...node.posts]
  );
}

function flattenDirectoryTree(node: DirectoryTreeNode): DirectoryMeta[] {
  const flattened: DirectoryMeta[] = [];

  for (const child of node.directories) {
    flattened.push({
      path: child.path,
      label: child.label,
      posts: collectPostsFromSubtree(child),
    });
    flattened.push(...flattenDirectoryTree(child));
  }

  return flattened;
}

export async function getPostIndex(): Promise<PostIndex> {
  const directoryTree = await buildDirectoryTree([]);
  const directories = flattenDirectoryTree(directoryTree).sort((a, b) =>
    a.path.localeCompare(b.path)
  );
  const rootPosts = [...directoryTree.posts].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  return {
    directories,
    rootPosts,
    directoryTree,
  };
}
