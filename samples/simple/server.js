//: server.js
//: -----------------------------------------
import { createServer } from "http";
import { remark } from "remark";
import html from "remark-html";
import deflist from "@verikami/remark-deflist-revisited";

const PORT = process.env.PORT || 3000;

//: Simple markdown to process
//: -----------------------------------------
const markdown = `
# Remark Deflist Revisited Simple Example

Node.js
: JavaScript runtime
: Built on V8 engine

Definition Lists
: Support nested content
: - Item 1
  - Item 2
  - Item 3

## Usage

Simply run this script to see markdown converted to HTML with definition lists support.
`;

//: Processing function
//: -----------------------------------------
async function processMarkdown(markdown) {
  const result = await remark()
    .use(deflist)
    .use(html)
    .process(markdown);

  return String(result);
}

//: Function that creates an HTML page
//: -----------------------------------------
function createHTMLPage(content, title = "Markdown Processor") {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        line-height: 1.6;
        background: #f5f5f5;
      }
      .container {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      dt {
        font-weight: bold;
        color: #2563eb;
        margin-top: 15px;
      }
      dd {
        margin-left: 20px;
        color: #4b5563;
      }
      h1, h2 { color: #1e40af; }
    </style>
  </head>
<body>
  <div class="container">
    ${content}
    <hr>
    <p style="text-align: center; color: #6b7280; font-size: 0.9em;">
      Powered by @verikami/remark-deflist-revisited
    </p>
  </div>
</body>
</html>`;
}

//: CONTENT
//: -----------------------------------------
console.log("\n👄 Processing Markdown");

const content = await processMarkdown(markdown);
const page = createHTMLPage(content, "Simple Markdown Processor");

//: SERVER
//: -----------------------------------------
const server = createServer((req, res) => {
  console.log("✅ Serving Content");
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(page);
});

//: MAIN
//: -----------------------------------------
server.listen(PORT, () => {
  console.log(`🌐 http://localhost:${PORT}\n`);
});
