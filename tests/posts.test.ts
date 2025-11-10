import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getPostIndex", () => {
  let tempRoot: string;

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), "blog-tests-"));

    const postsDir = join(tempRoot, "app", "posts");
    await mkdir(postsDir, { recursive: true });

    await writeFile(join(postsDir, "welcome.md"), "# Welcome");

    const guidesDir = join(postsDir, "guides");
    await mkdir(guidesDir, { recursive: true });
    await writeFile(join(guidesDir, "advanced-topics.md"), "# Advanced");
    await writeFile(join(guidesDir, "getting-started.md"), "# Getting Started");

    const basicsDir = join(guidesDir, "basics");
    await mkdir(basicsDir, { recursive: true });
    await writeFile(join(basicsDir, "quickstart.md"), "# Quickstart");

    vi.resetModules();
    vi.spyOn(process, "cwd").mockReturnValue(tempRoot);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(tempRoot, { recursive: true, force: true });
  });

  it("builds a directory-aware post index from markdown files", async () => {
    const { getPostIndex } = await import("../app/lib/posts");

    const index = await getPostIndex();

    expect(index.rootPosts).toEqual([
      {
        directory: "root",
        slug: "welcome",
        title: "Welcome",
      },
    ]);

    const directoryPaths = index.directories.map((directory) => directory.path);
    expect(directoryPaths).toEqual(["guides", "guides/basics"]);

    const guides = index.directories.find((directory) => directory.path === "guides");
    expect(guides?.label).toBe("guides");
    expect(guides?.posts.map((post) => post.slug)).toEqual([
      "guides/advanced-topics",
      "guides/getting-started",
      "guides/basics/quickstart",
    ]);
    expect(guides?.posts.map((post) => post.title)).toEqual([
      "Advanced Topics",
      "Getting Started",
      "Quickstart",
    ]);

    const basics = index.directories.find((directory) => directory.path === "guides/basics");
    expect(basics?.label).toBe("basics");
    expect(basics?.posts).toEqual([
      {
        directory: "guides/basics",
        slug: "guides/basics/quickstart",
        title: "Quickstart",
      },
    ]);

    expect(index.directoryTree.label).toBe("root");
    expect(index.directoryTree.path).toBe("");
    expect(index.directoryTree.posts.map((post) => post.slug)).toEqual(["welcome"]);

    const guidesTree = index.directoryTree.directories.find(
      (directory) => directory.label === "guides"
    );
    expect(guidesTree?.posts.map((post) => post.slug)).toEqual([
      "guides/advanced-topics",
      "guides/getting-started",
    ]);
    expect(guidesTree?.directories.map((child) => child.label)).toEqual(["basics"]);

    const basicsTree = guidesTree?.directories[0];
    expect(basicsTree?.posts.map((post) => post.slug)).toEqual(["guides/basics/quickstart"]);
  });
});
