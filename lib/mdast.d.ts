import type { DescriptionList } from "./index";

/**
 * Type Augmentation
 */
declare module "mdast" {
  interface RootContentMap {
    descriptionList: DescriptionList;
  }
  interface ListItemContentMap {
    descriptionList: DescriptionList;
  }
}
