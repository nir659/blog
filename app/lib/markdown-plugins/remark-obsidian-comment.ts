import type { Root, Text, RootContent } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const BLOCK_COMMENT_RE = /%%[\s\S]*?%%/g;

const remarkObsidianComment: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, "text", (node: Text) => {
      if (!node.value.includes("%%")) return;
      node.value = node.value.replace(BLOCK_COMMENT_RE, "");
    });

    visit(tree, "paragraph", (node, index, parent) => {
      if (!parent || index === undefined) return;

      const allEmpty = node.children.every((child: RootContent) => {
        if (child.type === "text") return child.value.trim() === "";
        return false;
      });

      if (allEmpty) {
        parent.children.splice(index, 1);
        return index;
      }
    });
  };
};

export default remarkObsidianComment;
