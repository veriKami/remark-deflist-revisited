import deflist from "remark-deflist";
import { visit } from "unist-util-visit";
/**
 * Remark plugin that extends `remark-deflist` to handle nested lists
 * inside description details (`dd` nodes).
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
 *
 * ```
 */
const deflistWithLists = () => {
  const base = deflist();
  return (tree, file) => {
    base(tree, file, () => {});
    visit(tree, "descriptiondetails", (dd) => {
      const child = dd.children?.[0];
      if (!child || child.children?.[0]?.type !== "listItem") {
        return;
      }
    });
    visit(tree, "descriptiondetails", (dd) => {
      const ulItems = [];
      const newChildren = [];
      const createNode = (children) => ({
        type: "list",
        ordered: false,
        spread: false,
        children,
      });
      for (const child of dd.children) {
        const c = child;
        if (c.type === "paragraph" && c.children?.[0]?.type === "listItem") {
          ulItems.push(c.children[0]);
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
    visit(tree, "descriptionlist", (dl, index, parent) => {
      if (index === undefined || !parent || dl.children.length === 0) {
        return;
      }
      const nextNode = parent.children[index + 1];
      if (nextNode && nextNode.type === "list") {
        const lastDd = dl.children.at(-1);
        if (lastDd.type === "descriptiondetails" && lastDd.children[0].type === "list") {
          lastDd.children[0].children.push(...nextNode.children);
        }
        parent.children.splice(index + 1, 1);
      }
    });
    visit(tree, "root", (root) => {
      const newChildren = [];
      let allDlChildren = [];
      const createList = (children) => ({
        type: "descriptionlist",
        data: { hName: "dl" },
        children,
      });
      for (const child of root.children) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...child.children);
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
