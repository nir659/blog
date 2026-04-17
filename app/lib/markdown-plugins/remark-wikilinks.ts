import type { Root, Text, PhrasingContent } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export type WikilinkResolver = (target: string) => string | null;

type Options = {
  resolve?: WikilinkResolver;
};

const WIKILINK_RE = /(?<!!)\[\[([^\]]+)\]\]/g;

const remarkWikilinks: Plugin<[Options?], Root> = function (options) {
  const resolve = options?.resolve ?? (() => null);

  return (tree) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      if (!value.includes("[[")) return;

      WIKILINK_RE.lastIndex = 0;
      const parts: PhrasingContent[] = [];
      let lastIndex = 0;
      let matched = false;

      let match: RegExpExecArray | null;
      while ((match = WIKILINK_RE.exec(value)) !== null) {
        matched = true;

        if (match.index > lastIndex) {
          parts.push({ type: "text", value: value.slice(lastIndex, match.index) } as Text);
        }

        const inner = match[1];
        const pipeIndex = inner.indexOf("|");
        const target = pipeIndex >= 0 ? inner.slice(0, pipeIndex).trim() : inner.trim();
        const alias = pipeIndex >= 0 ? inner.slice(pipeIndex + 1).trim() : target;

        const resolved = resolve(target);

        if (resolved) {
          parts.push({
            type: "link",
            url: resolved,
            children: [{ type: "text", value: alias } as Text],
          });
        } else {
          parts.push({
            type: "html",
            value: `<span class="wikilink wikilink-unresolved" title="Unresolved: ${escapeAttr(target)}">${escapeHtml(alias)}</span>`,
          } as PhrasingContent);
        }

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

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

export default remarkWikilinks;
