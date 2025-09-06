/**
 * @module deflistWithLists
 * @description
 * Remark plugin that extends `remark-deflist` to handle nested lists inside
 * descriptiondetails. It first runs the original `remark-deflist` plugin and
 * then performs additional processing:
 *
 * - merges paragraph children containing list items into proper lists
 * - merges descriptionlist nodes with following lists
 * - groups multiple descriptionlist nodes into a single node
 *
 * Nodes handled:
 * - descriptionlist (dl)
 * - descriptionterm (dt)
 * - descriptiondetails (dd)
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
 * const output = await remark().use(deflistWithLists).use(html).process(markdown);
 * console.log(String(output));
 * ```
 */
//: --------------------------------------------------------

import type { Plugin } from "unified";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";
import deflist from "remark-deflist";

//: --------------------------------------------------------
//: MAIN
//: --------------------------------------------------------
/**
 * Remark plugin that extends `remark-deflist` to handle nested lists inside
 * `<dd>` elements.
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
 * import { remark } from "remark";
 * import html from "remark-html";
 * import deflistWithLists from "./index.ts";
 *
 * remark().use(deflistWithLists).use(html)
 */
const deflistWithLists: Plugin<[], Node> = () => {
  //: ---------------------------------------
  /** inject oryginal plugin
   */
  const base = deflist();

  return (tree: Node, file: any) => {
    //: -------------------------------------
    /** it demands 3 args
     */
    base(tree as any, file, () => {});

    //: ----------------------------------------------------
    //: (0) Check Preconditions: first <dd> element is list
    //: ----------------------------------------------------
    visit(tree, "descriptiondetails", (dd: Parent) => {
      const child = dd.children?.[0] as Parent | undefined;
      if (!child || (child.children?.[0] as Node)?.type !== "listItem") return;
    });

    //: ----------------------------------------------------
    //: (1) Scal sierotki <li> wewnątrz <dd>
    //: scalanie paragrafów zawierających listItem
    //: ----------------------------------------------------
    visit(tree, "descriptiondetails", (dd: Parent) => {
      const ulItems: Node[] = [];
      const newChildren: Node[] = [];

      for (const child of dd.children as Parent[]) {
        const c = child as Parent;
        if (c.type === "paragraph" && (c.children?.[0] as Node)?.type === "listItem") {
          ulItems.push(c.children![0]);
        } else if (c.type === "listItem") {
          ulItems.push(c);
        } else {
          if (ulItems.length) {
            newChildren.push({
              type: "list",
              ordered: false,
              spread: false,
              children: ulItems,
            } as Parent);
            ulItems.length = 0;
          }
          newChildren.push(c);
        }
      }

      if (ulItems.length) {
        newChildren.push({
          type: "list",
          ordered: false,
          spread: false,
          children: ulItems,
        } as Parent);
      }

      dd.children = newChildren;
    });

    //: ----------------------------------------------------
    //: (2) Przenieś listy występujące bezpośrednio po <dd> do środka <dd>
    //: scalanie descriptionlist + list
    //: ----------------------------------------------------
    visit(tree, "descriptionlist", (dl: Parent, index: number, parent: Parent | undefined) => {
      if (index === undefined || !parent) return;

      const nextNode = parent.children[index + 1];
      if (nextNode && nextNode.type === "list") {
        const lastDd = dl.children[dl.children.length - 1] as Parent;
        if (lastDd.type === "descriptiondetails" && (lastDd.children[0] as Parent).type === "list") {
          (lastDd.children[0] as Parent).children.push(...(nextNode as Parent).children);
        }
        parent.children.splice(index + 1, 1);
      }
    });

    //: ----------------------------------------------------
    //: (3) Scal wszystkie DL w jeden, jeśli są rozdzielone
    //: grupowanie wielu descriptionlist w jeden
    //: ----------------------------------------------------
    visit(tree, "root", (root: Parent) => {
      const newChildren: Node[] = [];
      let allDlChildren: Node[] = [];

      for (const child of root.children as Parent[]) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...(child.children as Node[]));
        } else {
          if (allDlChildren.length > 0) {
            newChildren.push({
              type: "descriptionlist",
              data: { hName: "dl" },
              children: allDlChildren,
            } as Parent);
            allDlChildren = [];
          }
          newChildren.push(child);
        }
      }

      if (allDlChildren.length > 0) {
        newChildren.push({
          type: "descriptionlist",
          data: { hName: "dl" },
          children: allDlChildren,
        } as Parent);
      }

      root.children = newChildren;
    });
  };
};

export default deflistWithLists;
