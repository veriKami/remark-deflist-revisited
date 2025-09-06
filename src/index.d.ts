/**
 * Type definitions for deflistWithLists
 * 
 * Provides full TypeScript support for AST nodes:
 * - descriptionlist
 * - descriptionterm
 * - descriptiondetails
 * 
 * Usage:
 * import deflistWithLists from './deflistWithLists';
 * import type { DescriptionList } from './deflistWithLists';
 */
//: --------------------------------------------------------

import type { Plugin } from "unified";
import type { Node, Parent } from "unist";

//: --------------------------------------------------------
/**
 * Top-level plugin function.
 * Can be used in `remark().use(deflistWithLists)`.
 */
declare const deflistWithLists: Plugin<[], Node>;
export default deflistWithLists;

//: --- AST node types -------------------------------------

/**
 * Description list node
 */
export interface DescriptionList extends Parent {
  type: "descriptionlist";
  data?: { hName?: string };
  children: [DescriptionTerm, ...DescriptionDetails[]];
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
  children: (Parent & { type: "paragraph" | "list" })[];
}
