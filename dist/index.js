/**
 * @module deflistWithLists
 * @description
 * Remark plugin that extends `remark-deflist` to handle nested lists inside
 * description details. It elegantly solves issues where lists are direct
 * children of `<dd>` tags by performing post-processing transformations.
 *
 * For detailed functionality, see the {@link deflistWithLists} function documentation.
 *
 * Usage:
 * ```ts
 * import { remark } from "remark";
 * import html from "remark-html";
 * import deflistWithLists from "./index.ts";
 *
 * const markdown = `
 * Term
 * : - item A
 *   - item B
 * `;
 *
 * remark().use(deflistWithLists).use(html).process(markdown);
 * ```
 */

import deflist from "remark-deflist";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that extends `remark-deflist` to handle nested lists inside
 * descriptiondetails. It first runs the original `remark-deflist` plugin and
 * then performs additional processing.
 *
 * Features:
 * - merges paragraph children containing list items into proper lists
 * - merges descriptionlist nodes with following lists
 * - groups multiple descriptionlist nodes into a single node
 *
 * Nodes handled:
 * - `descriptionlist` (`<dl>`)
 * - `descriptionterm` (`<dt>`)
 * - `descriptiondetails` (`<dd>`)
 *
 * @returns A remark plugin transformer that post-processes `remark-deflist`.
 *
 * @example
 * ```ts
 * import { remark } from "remark";
 * import html from "remark-html";
 * import deflistWithLists from "./index.ts";
 *
 * const markdown = `
 * Term
 * : - item A
 *   - item B
 * `;
 *
 * const output = await remark()
 *   .use(deflistWithLists)
 *   .use(html)
 *   .process(markdown);
 *
 * console.log(String(output));
 * ```
 */
const deflistWithLists = () => {
  const base = deflist();
  return (tree, file) => {
    base(tree, file, () => {});
    visit(tree, "descriptiondetails", (dd) => {
      const ulItems = [];
      const newChildren = [];
      const createListNode = (children) => ({
        type: "list",
        ordered: false,
        spread: false,
        children: children,
      });
      const patchListItem = (textNode) => {
        const value = textNode.value.replace(/^\*\s/, "");
        const paragraph = {
          type: "paragraph",
          children: [{ type: "text", value }],
        };
        return {
          type: "listItem",
          spread: false,
          checked: null,
          children: [paragraph],
        };
      };
      for (const child of dd.children) {
        if (child.type === "listItem") {
          const firstChild = child.children?.[0];
          if (
            firstChild && firstChild.type === "paragraph"
            && firstChild.children?.[0]?.type === "text"
          ) {
            const textNode = firstChild.children[0];
            const lines = textNode.value.split("\n");
            if (lines.length > 1) {
              const listItems = [];
              textNode.value = lines.shift();
              for (const line of lines) {
                if (/^\d+\.\s/.test(line)) {
                  listItems.push(patchListItem({ type: "text", value: line }));
                } else {
                  textNode.value += " " + line;
                }
              }
              ulItems.push(child, ...listItems);
              continue;
            }
          }
          ulItems.push(child);
        } else if (
          child.type === "text"
          && child.value.startsWith("* ")
        ) {
          ulItems.push(patchListItem(child));
        } else {
          newChildren.push(child);
        }
      }
      if (ulItems.length) {
        newChildren.push(createListNode(ulItems));
      }
      dd.children = newChildren;
    });
    visit(tree, "descriptionlist", (dl, index, parent) => {
      const nextNode = parent.children[index + 1];
      if (nextNode && nextNode.type === "list") {
        const lastDd = dl.children.at(-1);
        if (lastDd && lastDd.type === "descriptiondetails") {
          const ddList = lastDd.children.find(c => c.type === "list");
          if (ddList) {
            ddList.children.push(...nextNode.children);
          } else {
            lastDd.children.push(nextNode);
          }
          parent.children.splice(index + 1, 1);
        }
      }
    });
    visit(tree, "list", (list, index, parent) => {
      if (parent?.type !== "descriptiondetails") {
        return;
      }
      const getFirstTextNode = (item) => {
        const para = item.children[0];
        if (para?.type === "paragraph") {
          const text = para.children[0];
          if (text?.type === "text") {
            return text;
          }
        }
        return null;
      };
      list.ordered = list.children
        .map(getFirstTextNode)
        .filter((n) => n !== null)
        .some(node => /^\d+\.\s/.test(node.value));
      for (const item of list.children) {
        const textNode = getFirstTextNode(item);
        if (textNode) {
          textNode.value = textNode.value.replace(/^\s*\d+\.\s/, "");
        }
      }
    });
    visit(tree, "root", (root) => {
      const newChildren = [];
      let allDlChildren = [];
      const createList = (children) => ({
        type: "descriptionlist",
        data: { hName: "dl" },
        children: children,
      });
      for (const child of root.children) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...child.children);
        } else {
          if (allDlChildren.length) {
            newChildren.push(createList(allDlChildren));
            allDlChildren = [];
          }
          newChildren.push(child);
        }
      }
      if (allDlChildren.length) {
        newChildren.push(createList(allDlChildren));
      }
      root.children = newChildren;
    });
  };
};
export default deflistWithLists;
