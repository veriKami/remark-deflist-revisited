#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/add.jsdoc.js
//: --------------------------------------------------------
import { readFileSync, writeFileSync } from "node:fs";

//: FUNCTION
//: --------------------------------------------------------
const doc = `
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

let file = readFileSync("dist/index.js", "utf8");
file = file.replace(
    "const deflistWithLists",
    doc + "\n" + "const deflistWithLists"
);
writeFileSync("dist/index.js", file);

//: MODULE
//: --------------------------------------------------------
// const doc = `
// /**
//  * @module deflistWithLists
//  * @description
//  * Remark plugin that extends \`remark-deflist\` to handle nested lists inside
//  * descriptiondetails. It first runs the original \`remark-deflist\` plugin and
//  * then performs additional processing:
//  *
//  * - merges paragraph children containing list items into proper lists
//  * - merges descriptionlist nodes with following lists
//  * - groups multiple descriptionlist nodes into a single node
//  *
//  * Nodes handled:
//  * - descriptionlist (dl)
//  * - descriptionterm (dt)
//  * - descriptiondetails (dd)
//  *
//  * Usage:
//  * \`\`\`ts
//  * import { remark } from "remark";
//  * import html from "remark-html";
//  * import deflistWithLists from "./index.ts";
//  *
//  * const markdown = \`
//  * Term
//  * : - item A
//  *   - item B
//  * \`;
//  *
//  * const output = await remark().use(deflistWithLists).use(html).process(markdown);
//  * console.log(String(output));
//  * \`\`\`
//  */
// `.trim();

// const file = readFileSync("dist/index.js", "utf8");
// writeFileSync("dist/index.js", doc + "\n" + file);
