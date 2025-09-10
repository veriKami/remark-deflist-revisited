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

import type { Node, Parent } from "npm:@types/unist@^3.0.3";
import deflist from "npm:remark-deflist@^1.0.0";
import type { Plugin } from "npm:unified@^11.0.5";
import { visit } from "npm:unist-util-visit@^5.0.0";

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
const deflistWithLists: Plugin<[], Node> = () => {
  const base = deflist();

  return (tree: Node, file: any) => {
    base(tree as any, file, () => {});

    visit(tree, "descriptiondetails", (dd: Parent) => {
      const child = dd.children?.[0] as Parent | undefined;
      if (!child || (child.children?.[0] as Node)?.type !== "listItem") return;
    });

    visit(tree, "descriptiondetails", (dd: Parent) => {
      const ulItems: Node[] = [];
      const newChildren: Node[] = [];

      const createNode = (children: Node[]): Parent => ({
        type: "list",
        ordered: false,
        spread: false,
        children,
      } as Parent);

      for (const child of dd.children as Parent[]) {
        const c = child as Parent;
        if (c.type === "paragraph" && (c.children?.[0] as Node)?.type === "listItem") {
          ulItems.push(c.children![0]);
        } else if (c.type === "listItem") {
          ulItems.push(c);
        } else {
          if (ulItems.length) {
            newChildren.push(createNode(ulItems));
          }
          newChildren.push(c);
        }
      }

      if (ulItems.length) {
        newChildren.push(createNode(ulItems));
      }

      dd.children = newChildren;
    });

    visit(tree, "descriptionlist", (dl: Parent, index: number, parent: Parent | undefined) => {
      if (index === undefined || !parent || dl.children.length === 0) return;

      const nextNode = parent.children[index + 1];
      if (nextNode && nextNode.type === "list") {
        const lastDd = dl.children.at(-1) as Parent;
        if (lastDd.type === "descriptiondetails" && (lastDd.children[0] as Parent).type === "list") {
          (lastDd.children[0] as Parent).children.push(...(nextNode as Parent).children);
        }
        parent.children.splice(index + 1, 1);
      }
    });

    visit(tree, "root", (root: Parent) => {
      const newChildren: Node[] = [];
      let allDlChildren: Node[] = [];

      const createList = (children: Node[]): Parent => ({
        type: "descriptionlist",
        data: { hName: "dl" },
        children,
      } as Parent);

      for (const child of root.children as Parent[]) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...(child.children as Node[]));
        } else {
          if (allDlChildren.length > 0) {
            newChildren.push(createList(allDlChildren));
            allDlChildren = [];
          }
          newChildren.push(child);
        }
      }

      if (allDlChildren.length > 0) {
        newChildren.push(createList(allDlChildren));
      }

      root.children = newChildren;
    });
  };
};

export default deflistWithLists;
