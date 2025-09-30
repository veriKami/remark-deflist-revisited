//: --------------------------------------------------------
//: scripts/sample.server.js
//: --------------------------------------------------------
import { createServer } from "http";
import { remark } from "remark";
import html from "remark-html";
import deflist from "../dist/index.js";

const PORT = 3000;

const markdown = `
Term
: Definition
  - item A
  - item B

Term
: * item A
  * item B
  * item C
`;

const output = await remark()
  .use(deflist)
  .use(html)
  .process(markdown);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(String(output));
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
