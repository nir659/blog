import "server-only";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import matter from "gray-matter";
import type { LanguageFn } from "highlight.js";

import extractHeadings, { type HeadingData } from "./markdown-plugins/extract-headings";
import remarkObsidianCallouts from "./markdown-plugins/remark-obsidian-callouts";
import remarkHighlight from "./markdown-plugins/remark-highlight";
import remarkObsidianComment from "./markdown-plugins/remark-obsidian-comment";
import remarkWikilinks, { type WikilinkResolver } from "./markdown-plugins/remark-wikilinks";

import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import ini from "highlight.js/lib/languages/ini";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import nginx from "highlight.js/lib/languages/nginx";
import plaintext from "highlight.js/lib/languages/plaintext";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import shell from "highlight.js/lib/languages/shell";
import sql from "highlight.js/lib/languages/sql";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

export type PostFrontmatter = {
  title?: string;
  date?: string;
  tags?: string[];
  aliases?: string[];
  description?: string;
  [key: string]: unknown;
};

export type CompiledPost = {
  html: string;
  headings: HeadingData[];
  frontmatter: PostFrontmatter;
};

type CompileOptions = {
  resolveWikilink?: WikilinkResolver;
};

const hljsLanguages: Record<string, LanguageFn> = {
  bash, c, cpp, csharp, css, dockerfile, go, ini, java,
  javascript, json, nginx, plaintext, powershell, python,
  ruby, shell, sql, swift, typescript, xml, yaml,
};

export async function compileMarkdown(
  raw: string,
  options?: CompileOptions,
): Promise<CompiledPost> {
  const { data: frontmatter, content } = matter(raw);

  // unified v11's overloaded .use() chain doesn't fully infer through mixed
  // remark→rehype pipelines with custom plugins. Cast to any at the entry point
  // to keep the chain readable; the public API (CompiledPost) remains fully typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processor = (unified() as any)
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkObsidianComment)
    .use(remarkObsidianCallouts)
    .use(remarkHighlight)
    .use(remarkWikilinks, { resolve: options?.resolveWikilink })
    .use(extractHeadings)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      properties: { className: ["heading-anchor"], ariaHidden: true, tabIndex: -1 },
      content: {
        type: "element",
        tagName: "span",
        properties: { className: ["heading-anchor-icon"] },
        children: [{ type: "text", value: "#" }],
      },
    })
    .use(rehypeKatex)
    .use(rehypeHighlight, {
      languages: hljsLanguages,
      detect: true,
      ignoreMissing: true,
    })
    .use(rehypeStringify);

  const file = await processor.process(content);

  const headings = ((file.data as Record<string, unknown>).headings as HeadingData[]) ?? [];

  return {
    html: String(file),
    headings,
    frontmatter: frontmatter as PostFrontmatter,
  };
}
