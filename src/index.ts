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
//: --------------------------------------------------------
/// <reference types="./mdast.d.ts" />

import type { List, ListItem, Paragraph, Root, RootContent, Text } from "mdast";
import type { Node, Parent } from "unist";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import { visit } from "unist-util-visit";
import deflist from "remark-deflist";

//: --------------------------------------------------------
//: Type Definitions
//: --------------------------------------------------------

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
 * Children are either paragraph or list
 */
export interface DescriptionDetails extends Parent {
  type: "descriptiondetails";
  children: (List | Paragraph | Text | Node)[];
}

//: --------------------------------------------------------
//: MAIN
//: --------------------------------------------------------
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
const deflistWithLists: Plugin<[], Root> = () => {
  //: ------------------------------------------------------
  //: Inject the original plugin

  const base = deflist();

  //: ------------------------------------------------------
  return (tree: Root, file: VFile) => {

    base(tree, file, () => {});

    //: ----------------------------------------------------
    //: (1) Merge orphaned <li> items inside <dd>
    //: paragraphs that contain listItems
    //: ----------------------------------------------------
    visit(tree, "descriptiondetails", (dd: DescriptionDetails) => {
      const ulItems: Node[] = [];
      const newChildren: Node[] = [];

      const createListNode = (children: Node[]): List => ({
        type: "list",
        ordered: false,
        spread: false,
        children: children as ListItem[],
      });

      const patchListItem = (textNode: Text): ListItem => {
        const value = textNode.value.replace(/^\*\s/, "")
        const paragraph: Paragraph = {
          type: "paragraph",
          children: [{ type: "text", value }]
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
          const firstChild = (child as Parent).children?.[0];
          if (firstChild && firstChild.type === "paragraph"
            && (firstChild as Parent).children?.[0]?.type === "text") {
            const textNode = (firstChild as Parent).children[0] as Text;
            const lines = textNode.value.split("\n");
            if (lines.length > 1) {
              const listItems: ListItem[] = [];
              textNode.value = lines.shift() as string;
              for (const line of lines) {
                if (/^\d+\.\s/.test(line)) {
                  listItems.push(patchListItem({ type: "text", value: line }));
                // } else if (/^-\s/.test(line)) {
                //   listItems.push(patchListItem({ type: "text", value: line }));
                } else {
                  textNode.value += " " + line;
                }
              }
              ulItems.push(child, ...listItems);
              continue;
            }
          }
          ulItems.push(child);
        } else if (child.type === "text"
          && (child as Text).value.startsWith("* ")) {
          ulItems.push(patchListItem(child as Text));
        } else {
          newChildren.push(child);
        }
      }

      if (ulItems.length) {
        newChildren.push(createListNode(ulItems));
      }

      dd.children = newChildren;
    });

    //: ----------------------------------------------------
    //: (2) Move lists that appear directly after a <dd>
    //: inside it - merging descriptionlist + list
    //: ----------------------------------------------------
    visit(tree, "descriptionlist", (dl: DescriptionList, index: number, parent: Parent | undefined) => {

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
    });

    //: ----------------------------------------------------
    //: (3) patch list (not using 1'st element) and decide
    //: if it is unordered: <ul> or ordered: <ol>
    //: ----------------------------------------------------
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

      list.ordered = list.children
        .map(getFirstTextNode)
        .filter((n): n is Text => n !== null)
        .some(node => /^\d+\.\s/.test(node.value));

      for (const item of list.children) {
        const textNode = getFirstTextNode(item);
        if (textNode) {
          textNode.value = textNode.value.replace(/^\s*\d+\.\s/, "");
        }
      }
    });

    //: ----------------------------------------------------
    //: (4) Merge all DL nodes into one if they are separated
    //: grouping multiple descriptionlists into one
    //: ----------------------------------------------------
    visit(tree, "root", (root: Root) => {
      const newChildren: RootContent[] = [];
      let allDlChildren: Node[] = [];

      const createList = (children: Node[]): DescriptionList => ({
        type: "descriptionlist",
        data: { hName: "dl" },
        children: children as (DescriptionTerm | DescriptionDetails)[],
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
