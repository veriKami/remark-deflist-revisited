//: --------------------------------------------------------
//: Type Augmentation
//: --------------------------------------------------------
//
// Run npx jsr publish
// npm warn exec The following package was not found and will be installed: jsr@0.13.5
// Downloading JSR release binary...
// Download completed
// Checking for slow types in the public API...
// error[unsupported-ambient-module]: found an ambient module, which is a global augmentation, which are not unsupported
//   --> /home/runner/work/remark-deflist-revisited/remark-deflist-revisited/lib/index.ts:62:16
//    |
// 62 | declare module "mdast" {
//    |                ^^^^^^^
//    = hint: remove the ambient module declaration
//
//   info: ambient modules are not supported because they can modify the types of a module from outside of that module
//   docs: https://jsr.io/go/slow-type-unsupported-ambient-module
//
//: --------------------------------------------------------
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
