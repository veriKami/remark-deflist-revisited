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
import { remark } from "remark";
import { remove } from "unist-util-remove";
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
  //: Inject the original plugin ///////////////////////////

  const base = deflist();

  //: ------------------------------------------------------
  return (tree: Root, file: VFile) => {
    //: ----------------------------------------------------
    //: PREPROCESSING //////////////////////////////////////

    prepareMarkdown(tree, file);
    base(tree, file, () => {});
    prerenderMarkdown(tree);

    //: ----------------------------------------------------
    //: (1) Merge orphaned <li> items inside <dd>
    //: paragraphs that contain listItems
    //: ----------------------------------------------------
    visit(tree, "descriptiondetails", (dd: DescriptionDetails) => {
      const ulItems: Node[] = [];
      const newChildren: Node[] = [];

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
              for (const value of lines) {
                if (/^\s*[-*+]\s/.test(value) || /^\d+\.\s/.test(value)) {
                  listItems.push($.patchListItem({ type: "text", value }));
                //: not used anymore ?
                //: } else {
                //:   textNode.value += " " + value;
                }
              }
              ulItems.push(child, ...listItems);
              continue;
            }
          }
          ulItems.push(child);
        } else if (child.type === "text"
          && (child as Text).value.startsWith("* ")) {
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
    //: if it is unordered: <ul> or ordered: <ol> one
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

      //: 1'st element (ol/ul) patch
      //: -----------------------------------
      list.ordered = list.ordered || list.children
        .map(getFirstTextNode)
        .filter((n): n is Text => n !== null)
        .some(node => /^\d+\.\s/.test(node.value));

      //: 1'st element (ol) cleanup
      //: +++++++++++++++++++++++++++++++++++
      for (const item of list.children) {
        const textNode = getFirstTextNode(item);
        if (textNode) {
          textNode.value = textNode.value
            .replace(/^(\s*[-*+]\s|\s*\d+\.\s)/, "") //: digit
            //.replace(/(: [-*+][^:\n]*)$/gm, ""); //: end of line
        }
      }
    });

    //: ----------------------------------------------------
    //: POSTPROCESSING /////////////////////////////////////

    cleanMarkdown(tree);

    //: ----------------------------------------------------
    //: (4) move orphaned elements into parent <dl>
    //: see step (2)
    //: ----------------------------------------------------
    visit(tree, "descriptionlist", (dl: DescriptionList, index: number, parent: Parent | undefined) => {
      const siblings = parent.children;
      const elements: Node[] = [];
      let currentIndex = index + 1;

      // Collect subsequent orphan elements
      while (
        currentIndex < siblings.length &&
        (siblings[currentIndex].type === "list" ||
          siblings[currentIndex].type === "paragraph")
      ) {
        elements.push(siblings[currentIndex]);
        currentIndex++;
      }

      if (elements.length) {
        // Remove collected elements from their original position
        parent.children.splice(index + 1, elements.length);

        /* c8 ignore next */
        if (!dl.children) dl.children = [];

        // Wrap orphans in a new <dd> and append to the <dl>
        dl.children.push($.createListDetails(elements));
      }
    });

    //: ----------------------------------------------------
    //: (5) Merge <dl> nodes into one if they are separated
    //: grouping multiple descriptionlists into one
    //: ----------------------------------------------------
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

//////////////////////////////////////////////////////////////////////
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
      children: children as ListItem[]
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
      children: [{ type: "text", value }]
    };
    return {
      type: "listItem",
      spread: false,
      checked: null,
      children: [paragraph]
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
      children: children as (DescriptionTerm | DescriptionDetails)[]
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
      children: children as (List | Paragraph | Text | Node)[]
    };
  }
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

      //: Main Line -> Replicate without : marker
      //: --------------------------------------------------
      if (/^[ \t]*:[ \t]*(?:[-+*]|\d+\.)[ \t]+/.test(line)) {
        const content = line.replace(/^[ \t]*:[ \t]?/, "");
        result.push(line);
        if (/^[ \t]*:\s+\d+\.\s/.test(line)) {
          /// console.log(line); ////> : 1. Definition 1 with: 1.
          // console.log(content); //> 1. Definition 1 with: 1.
          result.push(`    ${content}`); //: ol
        } else {
          /// console.log(line); ////> : * This is X separate item.
          // console.log(content); //> * This is X separate item.
          result.push(`  ${content}`); //: ul
        }
      } else if (/^: .*/.test(line)) {
        result.push("\n" + line);
      } else {
        result.push(line);
      }
    }

    return result.join("\n");
  }

  //: STEP 1: Get and modify existing markdown
  //: ------------------------------------------------------
  const originalMarkdown = file.value.toString();
  const modifiedMarkdown = processMarkdown(originalMarkdown);

  //: STEP 2: Parse the markdown
  //: ------------------------------------------------------
  const newTree = remark().parse(modifiedMarkdown);

  //: STEP 3: Replace the old tree with new one
  //: ------------------------------------------------------
  tree.children = newTree.children;
  tree.position = newTree.position;
}

/**
 * Pre-renders the Markdown tree after the base `remark-deflist` has run.
 * It cleans up some of the generated nodes.
 *
 * @param {Root} tree - The MDAST tree.
 */
const prerenderMarkdown = (tree: Root) => {
  visit(tree, "paragraph", (p: Paragraph, index: number, parent: Parent | undefined) => {

    //: list item @ : * Item
    //: ----------------------------------------------------
    if (p.children[0].type === "text"
      && /^: [-*+].*/g.test(p.children[0].value)) {
      parent.children.splice(index, 1);
      // remove(tree, p);
      // console.log(p)
    }

    //: dd items outside dl
    //: ----------------------------------------------------
    if (p.children[0].type === "text"
      && /^: [^-*+].*/g.test(p.children[0].value)) {
      // remove(tree, p) // console.log(p)
      p.children[0].value = p.children[0].value
        .replace(/^: /, "\n ");
    }
  });
}

/**
 * Post-processes the Markdown tree to clean up any remaining artifacts.
 *
 * @param {Root} tree - The MDAST tree.
 */
const cleanMarkdown = (tree: Root) => {
  //: ------------------------------------------------------
  //: (1) Remove duplicated p (: *) 1'st element
  //: ------------------------------------------------------
  // visit(tree, "paragraph", (p: Paragraph) => {
  //   if (p.children[0].type === "text"
  //     && /^: [-*+].*/g.test(p.children[0].value)) {
  //     remove(tree, p);
  //   }
  // });

  //: ------------------------------------------------------
  //: (2) Remove duplicated p (: *) inside list
  //: ------------------------------------------------------
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

    //: 1'st element (: *) cleanup
    //: +++++++++++++++++++++++++++++++++++++
    for (const item of list.children) {
      const textNode = getFirstTextNode(item);
      if (textNode) {
        textNode.value = textNode.value
          // .replace(/^(\s*[-*+]\s|\s*\d+\.\s)/, "") //: digit
          .replace(/(: [-*+][^:\n]*)$/gm, "");
          //: + definition TODO
          // .replace(/(: [^:\n]*)|(: [-*+][^:\n]*)$/gm, "");
      }
    }

    //: Final Cleanup – remove 1'st element
    //: +++++++++++++++++++++++++++++++++++++
    if (parent.children[0].type === "list") {
      remove(tree, list.children[0]);
    }
  });

  //: ------------------------------------------------------
  //: misc: Remove empty <li> inside list
  //: ------------------------------------------------------
  visit(tree, "listItem", (listItem: ListItem) => {
    if (!listItem.children.length) {
      remove(tree, listItem);
    }
  });
}

export default deflistWithLists;

//: --------------------------------------------------------
//: NOTES
//: --------------------------------------------------------
////////////////////////////////////////////////////////////
//: --------------------------------------------------------
//: PRECONDITIONS:
//:
//: 1'st paragraph case (no leading spaces):
// ---------------------------------------------------------
// Term 2 (nested) with: -
// : - Definition 1 with: -
//     - Sub 1 with: -
//       - Pub 1 with: -
//   - Definition 2 with: -
//     - Sub 1 with: -
//       - Pub 1 with: -
//   - Definition 3 with: -
//     - Sub 1 with: -
//       - Pub 1 with: -
// ------------------------------------------
// {
//   type: 'paragraph',
//   children: [
//     {
//       type: 'text',
//       value: 'Term 2 (nested) with: -\n' +
//         ': - Definition 1 with: -\n' +
//         '- Sub 1 with: -\n' +
//         '- Pub 1 with: -',
//       position: [Object]
//     }
//   ],
//   position: {
//     start: { line: 38, column: 1, offset: 721 },
//     end: { line: 41, column: 22, offset: 811 }
//   }
// }
// {
//   type: 'paragraph',
//   children: [
//     { type: 'text', value: 'Definition 2 with: -', position: [Object] }
//   ],
//   position: {
//     start: { line: 42, column: 5, offset: 816 },
//     end: { line: 42, column: 25, offset: 836 }
//   }
// }
// {
//   type: 'paragraph',
//   children: [ { type: 'text', value: 'Sub 1 with: -', position: [Object] } ],
//   position: {
//     start: { line: 43, column: 7, offset: 843 },
//     end: { line: 43, column: 20, offset: 856 }
//   }
// }
// {
//   type: 'paragraph',
//   children: [ { type: 'text', value: 'Pub 1 with: -', position: [Object] } ],
//   position: {
//     start: { line: 44, column: 9, offset: 865 },
//     end: { line: 44, column: 22, offset: 878 }
//   }
// }
//: --------------------------------------------------------
//: CONCLUSIONS:
//:
//: 1'st paragraph case cannot be resolved using tree
//:
//: --------------------------------------------------------
//: TASK: Implement strategy of copying the definition
//: line to preserve nesting context.
//: --------------------------------------------------------
// console.log(originalMarkdown)
// Term 4 (basic) with: 1.
// : 1. Definition 1 with: 1.
//   2. Definition 2 with: 2.
//   3. Definition 3 with: 3.
// console.log(modifiedMarkdown)
// Term 4 (basic) with: 1.
// : 1. Definition 1 with: 1.
//   1. Definition 1 with: 1.
//   2. Definition 2 with: 2.
//   3. Definition 3 with: 3.
//: --------------------------------------------------------
// const originalMarkdown = file.value.toString();
// const modifiedMarkdown = originalMarkdown.replace(
//   /^([ \t]*:[^\r\n]+)/gm, // Find every definition line
//   (match) => {
//     const content = match.replace(/^[ \t]*:[ \t]?/, "");
//     const newLine = `  ${content}`;
//     return `${match}\n${newLine}`;
//   }
// );
//: --------------------------------------------------------
////////////////////////////////////////////////////////////
//: --------------------------------------------------------
//: EOF
