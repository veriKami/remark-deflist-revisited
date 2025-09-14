//: --------------------------------------------------------
//: scripts/sample.node.js
//: --------------------------------------------------------
import { remark } from "remark";
import html from "remark-html";
// import deflist from "@verikami/remark-deflist-revisited";
import deflist from "../dist/index.js";

let markdown;
let output;

markdown = `
Term
: Definition
  - item A
  - item B
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
  <dl><dt>Term</dt><dd>Definition</dd></dl>
------------------------------------------ */
/* ------------------------------------------
  <dl><dt>Term</dt><dd>Definition<ul>
  <li>item A</li>
  <li>item B</li>
  </ul></dd></dl>
------------------------------------------ */

markdown = `
Term
: * item A
  * item B
  * item C
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
  <dl><dt>Term</dt><dd>* item A</dd></dl>
------------------------------------------ */
/* ------------------------------------------
  <dl><dt>Term</dt><dd><ul>
  <li>item A</li>
  <li>item B</li>
  <li>item C</li>
  </ul></dd></dl>
------------------------------------------ */

markdown = `
Term
: - item A
  - item B
  - item C
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
  <dl><dt>Term</dt><dd><ul>
  <li>item A</li>
  <li>item B</li>
  <li>item C</li>
  </ul></dd></dl>
------------------------------------------ */

markdown = `
Term
: - **item** A
  - **item** B
  - **item** C
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
  <dl><dt>Term</dt><dd><ul>
  <li><strong>item</strong> A</li>
  <li><strong>item</strong> B</li>
  <li><strong>item</strong> C</li>
  </ul></dd></dl>
------------------------------------------ */
