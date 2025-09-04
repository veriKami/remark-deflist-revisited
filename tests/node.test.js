import { remark } from "remark";
import html from "remark-html";
// import deflist from "@verikami/remark-deflist-patched";
import deflist from "../dist/index.js";

let markdown, output;

markdown = `
Term
: Definition
  - item A
  - item B
`;

/*
  <dl><dt>Term</dt><dd>Definition</dd></dl>
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

markdown = `
Term
: - item A
  - item B
  - item C
`;

/*
  <dl><dt>Term</dt><dd><ul>
  <li>item A</li>
  <li>item B</li>
  <li>item C</li>
  </ul></dd></dl>
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

markdown = `
Term
: - **item** A
  - **item** B
  - **item** C
`;

/*
  <dl><dt>Term</dt><dd><ul>
  <li><strong>item</strong> A</li>
  <li><strong>item</strong> B</li>
  <li><strong>item</strong> C</li>
  </ul></dd></dl>
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));
