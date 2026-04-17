import { describe, expect, it } from "vitest";
import { compileMarkdown } from "../app/lib/markdown";

describe("compileMarkdown", () => {
  it("extracts YAML frontmatter", async () => {
    const md = `---
title: Test Post
date: 2026-01-01
tags:
  - security
  - notes
description: A test post
---

# Hello`;

    const result = await compileMarkdown(md);
    expect(result.frontmatter.title).toBe("Test Post");
    expect(new Date(result.frontmatter.date as string).toISOString()).toContain("2026-01-01");
    expect(result.frontmatter.tags).toEqual(["security", "notes"]);
    expect(result.frontmatter.description).toBe("A test post");
    expect(result.html).toContain("<h1");
    expect(result.html).toContain("Hello");
  });

  it("returns empty frontmatter for posts without it", async () => {
    const result = await compileMarkdown("# Just a heading");
    expect(result.frontmatter).toEqual({});
  });

  it("extracts headings H1-H6", async () => {
    const md = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;

    const result = await compileMarkdown(md);
    expect(result.headings).toHaveLength(6);
    expect(result.headings[0]).toEqual({ id: "h1", text: "H1", level: 1 });
    expect(result.headings[1]).toEqual({ id: "h2", text: "H2", level: 2 });
    expect(result.headings[2]).toEqual({ id: "h3", text: "H3", level: 3 });
    expect(result.headings[3]).toEqual({ id: "h4", text: "H4", level: 4 });
    expect(result.headings[4]).toEqual({ id: "h5", text: "H5", level: 5 });
    expect(result.headings[5]).toEqual({ id: "h6", text: "H6", level: 6 });
  });

  it("renders GFM tables", async () => {
    const md = `| Col A | Col B |
| --- | --- |
| 1 | 2 |`;

    const result = await compileMarkdown(md);
    expect(result.html).toContain("<table>");
    expect(result.html).toContain("<th>Col A</th>");
    expect(result.html).toContain("<td>1</td>");
  });

  it("renders GFM task lists", async () => {
    const md = `- [x] done
- [ ] not done`;

    const result = await compileMarkdown(md);
    expect(result.html).toContain('type="checkbox"');
    expect(result.html).toContain("checked");
  });

  it("renders inline math", async () => {
    const md = "The formula $E = mc^2$ is famous.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("katex");
  });

  it("renders block math", async () => {
    const md = `$$
\\int_0^1 x^2 dx = \\frac{1}{3}
$$`;

    const result = await compileMarkdown(md);
    expect(result.html).toContain("katex-display");
  });

  it("resolves wikilinks when resolver is provided", async () => {
    const md = "See [[My Note]] for details.";
    const resolve = (target: string) =>
      target === "My Note" ? "/notes/my-note" : null;

    const result = await compileMarkdown(md, { resolveWikilink: resolve });
    expect(result.html).toContain('href="/notes/my-note"');
    expect(result.html).toContain("My Note");
  });

  it("renders unresolved wikilinks as spans", async () => {
    const md = "See [[Missing Note]] for details.";
    const resolve = () => null;

    const result = await compileMarkdown(md, { resolveWikilink: resolve });
    expect(result.html).toContain("wikilink-unresolved");
    expect(result.html).toContain("Missing Note");
  });

  it("supports wikilink aliases", async () => {
    const md = "See [[My Note|custom text]] here.";
    const resolve = (target: string) =>
      target === "My Note" ? "/notes/my-note" : null;

    const result = await compileMarkdown(md, { resolveWikilink: resolve });
    expect(result.html).toContain('href="/notes/my-note"');
    expect(result.html).toContain("custom text");
  });

  it("does not transform wikilink syntax inside code blocks", async () => {
    const md = "```bash\nif [[ $x -eq 1 ]]; then echo yes; fi\n```";
    const result = await compileMarkdown(md);
    expect(result.html).not.toContain("wikilink");
  });

  it("renders callouts from > [!TYPE]", async () => {
    const md = `> [!WARNING] Be careful
> This is dangerous.`;

    const result = await compileMarkdown(md);
    expect(result.html).toContain("callout");
    expect(result.html).toContain("callout-warning");
    expect(result.html).toContain("Be careful");
  });

  it("renders callouts with body on the same line as type", async () => {
    const md = `> [!WARNING] This will allow you to exfiltrate values.`;
    const result = await compileMarkdown(md);
    expect(result.html).toContain("callout-warning");
  });

  it("renders highlights ==text==", async () => {
    const md = "This is ==highlighted== text.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<mark>");
    expect(result.html).toContain("highlighted");
    expect(result.html).toContain("</mark>");
  });

  it("strips obsidian comments %%...%%", async () => {
    const md = "Visible %%hidden comment%% text.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("Visible");
    expect(result.html).toContain("text.");
    expect(result.html).not.toContain("hidden comment");
    expect(result.html).not.toContain("%%");
  });

  it("produces exactly one <pre> per fenced code block", async () => {
    const md = "```javascript\nconsole.log('hello');\n```";
    const result = await compileMarkdown(md);
    const preCount = (result.html.match(/<pre/g) || []).length;
    expect(preCount).toBe(1);
  });

  it("applies syntax highlighting to fenced code blocks", async () => {
    const md = "```python\ndef hello():\n    return 'world'\n```";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("hljs");
  });

  it("adds heading anchor links", async () => {
    const md = "## My Section";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("heading-anchor");
    expect(result.html).toContain('id="my-section"');
  });

  it("handles strikethrough", async () => {
    const md = "This is ~~deleted~~ text.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<del>");
  });

  it("handles bold and italic", async () => {
    const md = "This is **bold** and *italic* and ***both***.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<strong>");
    expect(result.html).toContain("<em>");
  });

  it("renders external links", async () => {
    const md = "[Google](https://google.com)";
    const result = await compileMarkdown(md);
    expect(result.html).toContain('href="https://google.com"');
  });

  it("renders inline code", async () => {
    const md = "Use the `console.log` function.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<code>");
    expect(result.html).toContain("console.log");
  });

  it("renders blockquotes", async () => {
    const md = "> This is a quote.";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<blockquote>");
  });

  it("renders horizontal rules", async () => {
    const md = "Above\n\n---\n\nBelow";
    const result = await compileMarkdown(md);
    expect(result.html).toContain("<hr");
  });

  it("renders footnotes", async () => {
    const md = `Here is a statement[^1].

[^1]: This is the footnote.`;

    const result = await compileMarkdown(md);
    expect(result.html).toContain("footnote");
  });
});
