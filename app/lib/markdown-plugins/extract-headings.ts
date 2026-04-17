import type { Root, Heading as MdastHeading } from "mdast";
import type { Plugin } from "unified";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";

export type HeadingData = {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const extractHeadings: Plugin<[], Root> = function () {
  return (tree, file) => {
    const headings: HeadingData[] = [];

    visit(tree, "heading", (node: MdastHeading) => {
      const text = toString(node);
      const id = slugify(text);
      if (text && id) {
        headings.push({
          id,
          text,
          level: node.depth as HeadingData["level"],
        });
      }
    });

    (file.data as Record<string, unknown>).headings = headings;
  };
};

export default extractHeadings;
