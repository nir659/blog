import type { Root, Blockquote, Paragraph, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const CALLOUT_RE = /^\[!(\w+)\]\s*(.*)/;

const remarkObsidianCallouts: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, "blockquote", (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== "paragraph") return;

      const firstInline = firstChild.children[0];
      if (!firstInline || firstInline.type !== "text") return;

      const match = CALLOUT_RE.exec(firstInline.value);
      if (!match) return;

      const calloutType = match[1].toLowerCase();
      const titleText = match[2]?.trim() || calloutType.charAt(0).toUpperCase() + calloutType.slice(1);

      const restOfFirstLine = firstInline.value.slice(match[0].length);

      const bodyChildren = [...node.children];

      const remainingInline = firstChild.children.slice(1);
      if (restOfFirstLine.trim() || remainingInline.length > 0) {
        const newParagraph: Paragraph = {
          type: "paragraph",
          children: [],
        };
        if (restOfFirstLine.trim()) {
          newParagraph.children.push({
            type: "text",
            value: restOfFirstLine.trimStart(),
          } as Text);
        }
        newParagraph.children.push(...remainingInline);
        if (newParagraph.children.length > 0) {
          bodyChildren[0] = newParagraph;
        } else {
          bodyChildren.shift();
        }
      } else {
        bodyChildren.shift();
      }

      const titleNode: Paragraph = {
        type: "paragraph",
        children: [{ type: "text", value: titleText } as Text],
        data: {
          hName: "strong",
          hProperties: { className: ["callout-title"] },
        },
      };

      const calloutNode = {
        type: "blockquote" as const,
        children: [titleNode, ...bodyChildren],
        data: {
          hName: "aside",
          hProperties: {
            className: ["callout", `callout-${calloutType}`],
          },
        },
      };

      (parent.children as typeof parent.children)[index] = calloutNode as Blockquote;
    });
  };
};

export default remarkObsidianCallouts;
