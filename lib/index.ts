/**
 * @module deflistWithLists
 *
 * Remark plugin that extends `remark-deflist` to handle nested lists inside
 * description details. It elegantly solves issues where lists are direct
 * children of `<dd>` tags by performing post-processing transformations.
 *
 * For detailed functionality, see the {@link deflistWithLists} function documentation.
 *
 * Usage:
 * ```ts
 * import { remark } from "npm:remark@^15.0.1";
 * import html from "npm:remark-html@^16.0.1";
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
import type { List, ListItem, Paragraph, Root, RootContent, Text } from "npm:@types/mdast@^4.0.4";
import type { Node, Parent } from "npm:@types/unist@^3.0.3";
import deflist from "npm:remark-deflist@^1.0.0";
import { remark } from "npm:remark@^15.0.1";
import type { Plugin } from "npm:unified@^11.0.5";
import { remove } from "npm:unist-util-remove@^4.0.0";
import { visit } from "npm:unist-util-visit@^5.0.0";
import type { VFile } from "npm:vfile@^6.0.3";
/**
 * Description list node (the "dl" part)
 */
export interface DescriptionList extends Parent {
  type: "descriptionlist";
  data?: { hName?: string };
  children: (DescriptionTerm | DescriptionDetails)[];
}
/**
 * Description term node (the "dt" part)
 */
export interface DescriptionTerm extends Parent {
  type: "descriptionterm";
  children: Node[];
}
/**
 * Description details node (the "dd" part)
 */
export interface DescriptionDetails extends Parent {
  type: "descriptiondetails";
  children: (List | Paragraph | Text | Node)[];
}
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
 * @returns {import('unified').Transformer} A remark plugin transformer that post-processes `remark-deflist`.
 *
 * @example
 * ```ts
 * import { remark } from "npm:remark@^15.0.1";
 * import html from "npm:remark-html@^16.0.1";
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
const deflistWithLists: Plugin<[], Root> = () => {
  const base = deflist();
  return (tree: Root, file: VFile) => {
    prepareMarkdown(tree, file);
    base(tree, file, () => {});
    prerenderMarkdown(tree);
    visit(tree, "descriptiondetails", (dd: DescriptionDetails) => {
      const ulItems: Node[] = [];
      const newChildren: Node[] = [];
      for (const child of dd.children) {
        if (child.type === "listItem") {
          const firstChild = (child as Parent).children?.[0];
          if (
            firstChild && firstChild.type === "paragraph"
            && (firstChild as Parent).children?.[0]?.type === "text"
          ) {
            const textNode = (firstChild as Parent).children[0] as Text;
            const lines = textNode.value.split("\n");
            if (lines.length > 1) {
              const listItems: ListItem[] = [];
              textNode.value = lines.shift() as string;
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
          && (child as Text).value.startsWith("* ")
        ) {
          ulItems.push($.patchListItem(child as Text));
        } else {
          newChildren.push(child);
        }
      }
      if (ulItems.length) {
        newChildren.push($.createListNode(ulItems));
      }
      dd.children = newChildren;
    });
    visit(
      tree,
      "descriptionlist",
      (dl: DescriptionList, index: number, parent: Parent | undefined) => {
        const nextNode = parent.children[index + 1];
        if (nextNode && nextNode.type === "list") {
          const lastDd = dl.children.at(-1);
          if (lastDd && lastDd.type === "descriptiondetails") {
            const ddList = (lastDd as DescriptionDetails).children.find(c => c.type === "list");
            if (ddList) {
              (ddList as List).children.push(...(nextNode as List).children);
            } else {
              (lastDd as DescriptionDetails).children.push(nextNode);
            }
            parent.children.splice(index + 1, 1);
          }
        }
      },
    );
    visit(tree, "list", (list: List, index: number, parent: Parent | undefined) => {
      if (parent?.type !== "descriptiondetails") return;
      const getFirstTextNode = (item: ListItem): Text | null => {
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
        .filter((n): n is Text => n !== null)
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
    visit(
      tree,
      "descriptionlist",
      (dl: DescriptionList, index: number, parent: Parent | undefined) => {
        const siblings = parent.children;
        const elements: Node[] = [];
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
          if (!dl.children) dl.children = [];
          dl.children.push($.createListDetails(elements));
        }
      },
    );
    visit(tree, "root", (root: Root) => {
      const newChildren: RootContent[] = [];
      let allDlChildren: Node[] = [];
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
/**
 * A collection of helper functions for creating and manipulating MDAST nodes.
 * @namespace $
 */
const $ = {
  /**
   * Creates a `list` node.
   * @param {Node[]} children - The child nodes of the list.
   * @returns {List} The created list node.
   */
  createListNode: (children: Node[]): List => {
    return {
      type: "list",
      ordered: false,
      spread: false,
      children: children as ListItem[],
    };
  },
  /**
   * Patches a `listItem` node from a `text` node.
   * @param {Text} text - The text node to convert.
   * @returns {ListItem} The created listItem node.
   */
  patchListItem: (text: Text): ListItem => {
    const value = text.value.replace(/^\s*[-*+]\s/, "");
    const paragraph: Paragraph = {
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
  /**
   * Creates a `descriptionlist` node.
   * @param {Node[]} children - The child nodes of the description list.
   * @returns {DescriptionList} The created description list node.
   */
  createList: (children: Node[]): DescriptionList => {
    return {
      type: "descriptionlist",
      data: { hName: "dl" },
      children: children as (DescriptionTerm | DescriptionDetails)[],
    };
  },
  /**
   * Creates a `descriptiondetails` node.
   * @param {Node[]} children - The child nodes of the description details.
   * @returns {DescriptionDetails} The created description details node.
   */
  createListDetails: (children: Node[]): DescriptionDetails => {
    return {
      type: "descriptiondetails",
      data: { hName: "dd" },
      children: children as (List | Paragraph | Text | Node)[],
    };
  },
};
/**
 * Pre-processes the Markdown content before the main `remark-deflist` plugin runs.
 * It modifies the Markdown string to handle some edge cases and then re-parses it.
 *
 * @param {Root} tree - The MDAST tree.
 * @param {VFile} file - The VFile object.
 */
const prepareMarkdown = (tree: Root, file: VFile) => {
  const processMarkdown = (markdown: string) => {
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
/**
 * Pre-renders the Markdown tree after the base `remark-deflist` has run.
 * It cleans up some of the generated nodes.
 *
 * @param {Root} tree - The MDAST tree.
 */
const prerenderMarkdown = (tree: Root) => {
  visit(tree, "paragraph", (p: Paragraph) => {
    if (
      p.children[0].type === "text"
      && /^: [-*+].*/g.test(p.children[0].value)
    ) {
      remove(tree, p);
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
/**
 * Post-processes the Markdown tree to clean up any remaining artifacts.
 *
 * @param {Root} tree - The MDAST tree.
 */
const cleanMarkdown = (tree: Root) => {
  visit(tree, "list", (list: List, index: number, parent: Parent | undefined) => {
    if (parent?.type !== "descriptiondetails") return;
    const getFirstTextNode = (item: ListItem): Text | null => {
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
  visit(tree, "listItem", (listItem: ListItem) => {
    if (!listItem.children.length) {
      remove(tree, listItem);
    }
  });
};
export default deflistWithLists;
