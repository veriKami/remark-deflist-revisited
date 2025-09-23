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

import { remark } from "remark";
import deflist from "remark-deflist";
import { remove } from "unist-util-remove";
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
    prepareMarkdown(tree, file);
    base(tree, file, () => {});
    prerenderMarkdown(tree);
    visit(tree, "descriptiondetails", (dd) => {
      const ulItems = [];
      const newChildren = [];
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
              for (const value of lines) {
                if (/^\s*[-*+]\s/.test(value) || /^\d+\.\s/.test(value)) {
                  listItems.push($.patchListItem({ type: "text", value }));
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
          ulItems.push($.patchListItem(child));
        } else {
          newChildren.push(child);
        }
      }
      if (ulItems.length) {
        newChildren.push($.createListNode(ulItems));
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
      list.ordered = list.ordered || list.children
        .map(getFirstTextNode)
        .filter((n) => n !== null)
        .some(node => /^\d+\.\s/.test(node.value));
      for (const item of list.children) {
        const textNode = getFirstTextNode(item);
        if (textNode) {
          textNode.value = textNode.value
            .replace(/^(\s*[-*+]\s|\s*\d+\.\s)/, "");
        }
      }
    });
    cleanMarkdown(tree);
    visit(tree, "descriptionlist", (dl, index, parent) => {
      const siblings = parent.children;
      const elements = [];
      let currentIndex = index + 1;
      while (
        currentIndex < siblings.length
        && (siblings[currentIndex].type === "list"
          || siblings[currentIndex].type === "paragraph")
      ) {
        elements.push(siblings[currentIndex]);
        currentIndex++;
      }
      if (elements.length) {
        parent.children.splice(index + 1, elements.length);
        if (!dl.children) {
          dl.children = [];
        }
        dl.children.push($.createListDetails(elements));
      }
    });
    visit(tree, "root", (root) => {
      const newChildren = [];
      let allDlChildren = [];
      for (const child of root.children) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...child.children);
        } else {
          if (allDlChildren.length) {
            newChildren.push($.createList(allDlChildren));
            allDlChildren = [];
          }
          newChildren.push(child);
        }
      }
      if (allDlChildren.length) {
        newChildren.push($.createList(allDlChildren));
      }
      root.children = newChildren;
    });
  };
};
const $ = {
  createListNode: (children) => {
    return {
      type: "list",
      ordered: false,
      spread: false,
      children: children,
    };
  },
  patchListItem: (text) => {
    const value = text.value.replace(/^\s*[-*+]\s/, "");
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
  },
  createList: (children) => {
    return {
      type: "descriptionlist",
      data: { hName: "dl" },
      children: children,
    };
  },
  createListDetails: (children) => {
    return {
      type: "descriptiondetails",
      data: { hName: "dd" },
      children: children,
    };
  },
};
const prepareMarkdown = (tree, file) => {
  const processMarkdown = (markdown) => {
    markdown = markdown.replace(/^\s*[-*+]\s/g, "+");
    const lines = markdown.split("\n");
    let inCodeBlock = false;
    const result = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith("```") || line.trim().startsWith("~~~")) {
        inCodeBlock = !inCodeBlock;
        result.push(line);
        continue;
      }
      if (inCodeBlock) {
        result.push(line);
        continue;
      }
      if (/^[ \t]*:[ \t]*(?:[-+*]|\d+\.)[ \t]+/.test(line)) {
        const content = line.replace(/^[ \t]*:[ \t]?/, "");
        result.push(line);
        if (/^[ \t]*:\s+\d+\.\s/.test(line)) {
          result.push(`    ${content}`);
        } else {
          result.push(`  ${content}`);
        }
      } else if (/^: .*/.test(line)) {
        result.push("\n" + line);
      } else {
        result.push(line);
      }
    }
    return result.join("\n");
  };
  const originalMarkdown = file.value.toString();
  const modifiedMarkdown = processMarkdown(originalMarkdown);
  const newTree = remark().parse(modifiedMarkdown);
  tree.children = newTree.children;
  tree.position = newTree.position;
};
const prerenderMarkdown = (tree) => {
  visit(tree, "paragraph", (p, index, parent) => {
    if (
      p.children[0].type === "text"
      && /^: [-*+].*/g.test(p.children[0].value)
    ) {
      parent.children.splice(index, 1);
    }
    if (
      p.children[0].type === "text"
      && /^: [^-*+].*/g.test(p.children[0].value)
    ) {
      p.children[0].value = p.children[0].value
        .replace(/^: /, "\n ");
    }
  });
};
const cleanMarkdown = (tree) => {
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
    for (const item of list.children) {
      const textNode = getFirstTextNode(item);
      if (textNode) {
        textNode.value = textNode.value
          .replace(/(: [-*+][^:\n]*)$/gm, "");
      }
    }
    if (parent.children[0].type === "list") {
      remove(tree, list.children[0]);
    }
  });
  visit(tree, "listItem", (listItem) => {
    if (!listItem.children.length) {
      remove(tree, listItem);
    }
  });
};
export default deflistWithLists;
