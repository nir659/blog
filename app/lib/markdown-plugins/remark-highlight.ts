import type { Root, Text, PhrasingContent } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const HIGHLIGHT_RE = /==([^=]+)==/g;

const remarkHighlight: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      if (!value.includes("==")) return;

      HIGHLIGHT_RE.lastIndex = 0;
      const parts: PhrasingContent[] = [];
      let lastIndex = 0;
      let matched = false;

      let match: RegExpExecArray | null;
      while ((match = HIGHLIGHT_RE.exec(value)) !== null) {
        matched = true;
        if (match.index > lastIndex) {
          parts.push({ type: "text", value: value.slice(lastIndex, match.index) } as Text);
        }
        parts.push({
          type: "html",
          value: `<mark>${escapeHtml(match[1])}</mark>`,
        } as PhrasingContent);
        lastIndex = match.index + match[0].length;
      }

      if (!matched) return;

      if (lastIndex < value.length) {
        parts.push({ type: "text", value: value.slice(lastIndex) } as Text);
      }

      parent.children.splice(index, 1, ...parts);
    });
  };
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default remarkHighlight;
