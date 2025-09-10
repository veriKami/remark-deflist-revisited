#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/build.npm.js
//: --------------------------------------------------------
import { readFileSync, writeFileSync } from "node:fs";

let file;

//: MODULE
//: --------------------------------------------------------
const docModule = `
/**
 * @module deflistWithLists
 * @description
 * Remark plugin that extends \`remark-deflist\` to handle nested lists inside
 * descriptiondetails. It first runs the original \`remark-deflist\` plugin and
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
 * \`\`\`ts
 * import { remark } from "remark";
 * import html from "remark-html";
 * import deflistWithLists from "./index.ts";
 *
 * const markdown = \`
 * Term
 * : - item A
 *   - item B
 * \`;
 *
 * const output = await remark().use(deflistWithLists).use(html).process(markdown);
 * console.log(String(output));
 * \`\`\`
 */
`.trim();

//: FUNCTION
//: --------------------------------------------------------
const docFunction = `
/**
 * Remark plugin that extends \`remark-deflist\` to handle nested lists
 * inside description details (\`dd\` nodes).
 *
 * Features:
 * - merges paragraph children containing list items into proper lists
 * - merges descriptionlist nodes with following lists
 * - groups multiple descriptionlist nodes into a single node
 *
 * Nodes handled:
 * - \`descriptionlist\` (\`<dl>\`)
 * - \`descriptionterm\` (\`<dt>\`)
 * - \`descriptiondetails\` (\`<dd>\`)
 *
 * @returns A remark plugin transformer that post-processes \`remark-deflist\`.
 *
 * @example
 * \`\`\`ts
 * import { remark } from "remark";
 * import html from "remark-html";
 * import deflistWithLists from "./index.ts";
 *
 * const markdown = \`
 * Term
 * : - item A
 *   - item B
 * \`;
 *
 * const output = await remark()
 *   .use(deflistWithLists)
 *   .use(html)
 *   .process(markdown);
 *
 * console.log(String(output));
 *
 * \`\`\`
 */
`.trim();

file = readFileSync("dist/index.js", "utf8");

file = `${docModule}\n\n${file}`;
file = file.replace(
  "const deflistWithLists",
  `\n${docFunction}\nconst deflistWithLists`
);

writeFileSync("dist/index.js", file);

//: TYPES
//: --------------------------------------------------------
// const multiLineComment = new RegExp("\\/\\*[\\s\\S]*?\\*\\/", "g");
//: single Lines without //:
// const singleLineComment = new RegExp("\\/\\/(?!:).*?(?=$|\\n)", "gm");
//: --------------------------------------------------------
const singleLineComment = new RegExp("\\/\\/.*$", "gm");
const multiSpace = new RegExp("^\\s*$\\r?\\n", "gm");

file = readFileSync("dist/index.d.ts", "utf8");

file = file
  // .replace(multiLineComment, "")
  .replace(singleLineComment, "")
  .replace(multiSpace, "\n");

writeFileSync("dist/index.d.ts", file);

//: --------------------------------------------------------
//: DONE

console.log("⛺️ Build complete:", 2, "files processed.");

//: --------------------------------------------------------
//: TYPES (deprecated) -> using the original file
//: --------------------------------------------------------
//: @ TS version
// const docTypes = `
// /**
//  * Type definitions for deflistWithLists
//  *
//  * Provides full TypeScript support for AST nodes:
//  * - descriptionlist
//  * - descriptionterm
//  * - descriptiondetails
//  *
//  * Usage:
//  * import deflistWithLists from './deflistWithLists';
//  * import type { DescriptionList } from './deflistWithLists';
//  */
// `.trim();
//: -------------------------------
// const docTypes = `
// /**
//  * Type definitions for deflistWithLists
//  */
// `.trim();

// file = readFileSync("dist/index.d.ts", "utf8");
// file = `${docTypes}\n\n${file}`;
// writeFileSync("dist/index.d.ts", file);
