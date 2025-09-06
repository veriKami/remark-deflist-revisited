//: --------------------------------------------------------
import deflist from "remark-deflist";
import { visit } from "unist-util-visit";

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
const deflistWithLists = () => {
  //: -----------------------------

  /** inject oryginal module */
  const base = deflist();

  return (tree, file) => {
    //: ---------------------------

    base(tree, file, () => {});

    //: ----------------------------------------------------
    //: (0) Check Preconditions: first <dd> element is list
    //: ----------------------------------------------------
    visit(tree, ["descriptiondetails"], (dd) => {
      const child = dd.children?.[0];
      /*// DEV ------------------------------
      if (child && child.children?.[0]) {
        //: child.children[0].type //: paragraph
        // const _ = child.children[0]?.children[0].value || "";
        const _ = child.children[0]?.children[0].value
          || child.children[0]?.children[0].type + ": " +
          child.children[0]?.children[0]?.children[0]?.value;
        // const $ = child.children[0]?.children?.[1]?.value || "";
        // const $ = child.children[0]?.children?.[0] || "";
        console.log("+", { _ });
      }
      //*/
      if (!child || child.children?.[0]?.type !== "listItem") {
        return;
      }
    });

    //: ----------------------------------------------------
    //: (1) Scal sierotki <li> wewnątrz <dd>
    //: ----------------------------------------------------
    visit(tree, ["descriptiondetails"], (dd) => {
      const ulItems = [];
      const newChildren = [];

      for (const child of dd.children) {
        if (child.type === "paragraph" && child.children?.[0]?.type === "listItem") {
          ulItems.push(child.children[0]);
        } else if (child.type === "listItem") {
          ulItems.push(child);
        } else {
          if (ulItems.length) {
            newChildren.push({
              type: "list",
              ordered: false,
              spread: false,
              children: ulItems,
            });
            ulItems.length = 0;
          }
          newChildren.push(child);
        }
      }

      if (ulItems.length) {
        newChildren.push({
          type: "list",
          ordered: false,
          spread: false,
          children: ulItems,
        });
      }

      dd.children = newChildren;
    });

    //: ----------------------------------------------------
    //: (2) Przenieś listy występujące bezpośrednio po <dd> do środka <dd>
    //: ----------------------------------------------------
    visit(tree, "descriptionlist", (dl, index, parent) => {
      if (index === undefined || !parent) return;

      const nextNode = parent.children[index + 1];
      if (nextNode && nextNode.type === "list") {
        const lastDd = dl.children[dl.children.length - 1];
        if (lastDd.type === "descriptiondetails" && lastDd.children[0]?.type === "list") {
          lastDd.children[0].children.push(...nextNode.children);
        }
        parent.children.splice(index + 1, 1);
      }
    });

    //: ----------------------------------------------------
    //: (3) Scal wszystkie DL w jeden, jeśli są rozdzielone
    //: ----------------------------------------------------
    visit(tree, "root", (root) => {
      const newChildren = [];
      let allDlChildren = [];

      for (const child of root.children) {
        if (child.type === "descriptionlist") {
          allDlChildren.push(...child.children);
        } else {
          if (allDlChildren.length > 0) {
            newChildren.push({
              type: "descriptionlist",
              data: { hName: "dl" },
              children: allDlChildren,
            });
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
        });
      }

      root.children = newChildren;
    });
  };
};

export default deflistWithLists;
