//: --------------------------------------------------------
//: scripts/sample.server.js
//: --------------------------------------------------------
import { createServer } from "http";
import { remark } from "remark";
import html from "remark-html";
import dedent from "dedent";
//: -----------------------------------------
import deflist from "../dist/index.js";

const PORT = process.env.PORT || 3000;

//: Processing function
//: -----------------------------------------
async function processMarkdown(markdown) {
  const output = await remark()
    .use(deflist)
    .use(html)
    .process(markdown);

  return dedent`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Remark Deflist Revisited °// Server Example</title>
        <meta name="author" content="veriKami °// Weronika Kami">
        <style>
          html { min-height: 100%; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.2;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          h1, h2 { color: hotpink; margin-top: 0; }
          dl { margin: 10px 0; }
          dt {
            font-weight: bold;
            margin: 20px 0 20px;
            color: #667eea;
            font-size: 1.1em;
          }
          dd {
            margin: 5px 0 0 40px;
            padding: 0;
            color: #666;
          }
          p { margin: 5px 0 0; padding: 0;}
          ul { margin: 0 10px; }
          li { margin: 0; }
          a, a:visited { color: silver; text-decoration: none; }
          a:hover { text-decoration: underline; }
          hr { margin: 40px 0 20px; border: none; border-top: 1px solid #ddd; }
          footer { text-align: center; color: #888; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          ${String(output)}
          <hr>
          <footer>
            Created by <a href="https://verikami.com" target="_blank">veriKami</a> °//
            <a href="https://linkedin.com/in/verikami" target="_blank">Weronika Kami</a> °//
            <a href="https://www.npmjs.com/package/@verikami/remark-deflist-revisited"
              target="_blank">remark-deflist-revisited</a>
          </footer>
        </div>
      </body>
    </html>
  `;
}

//: Sample markdown to process
//: -----------------------------------------
const markdown = dedent`
  # veriKami °// Remark Deflist Revisited

  Remark Deflist Revisited Module
  : Compatible with Bun, Deno and Cloudflare Workers
  : Enhanced definition lists support
  : Supports nested lists

  Nested Lists
  : Support for complex structures
  : - Item A
    - Item B
    - Item C

  Compatibility
  : Works with modern runtimes
  : - Node.js
    - Cloudflare Workers
    - Deno
    - Bun
`;

const output = await processMarkdown(markdown);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(String(output));
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
