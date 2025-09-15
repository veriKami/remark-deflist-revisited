import type { List, Paragraph, Root, Text } from "mdast";
import type { Plugin } from "unified";
import type { Node, Parent } from "unist";
export interface DescriptionList extends Parent {
  type: "descriptionlist";
  data?: {
    hName?: string;
  };
  children: (DescriptionTerm | DescriptionDetails)[];
}
export interface DescriptionTerm extends Parent {
  type: "descriptionterm";
  children: Node[];
}
export interface DescriptionDetails extends Parent {
  type: "descriptiondetails";
  children: (List | Paragraph | Text | Node)[];
}
declare module "mdast" {
  interface RootContentMap {
    descriptionList: DescriptionList;
  }
  interface ListItemContentMap {
    descriptionList: DescriptionList;
  }
}
declare const deflistWithLists: Plugin<[], Root>;
export default deflistWithLists;
