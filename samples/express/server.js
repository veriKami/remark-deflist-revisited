//: server.js
//: -----------------------------------------
import express from "express";
import { remark } from "remark";
import html from "remark-html";
import dedent from "dedent";
import deflist from "@verikami/remark-deflist-revisited";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
        <title>Remark Deflist Revisited °// Express.js Example</title>
        <meta name="author" content="veriKami °// Weronika Kami">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          h1, h2 { color: #667eea; margin-top: 0; }
          dl { margin: 20px 0; }
          dt {
            font-weight: bold;
            margin: 20px 0 0;
            color: #667eea;
            font-size: 1.1em;
          }
          dd {
            margin: 5px 0 0 40px;
            color: #666;
          }
          ul { margin: 0 10px; }
          li { margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          ${String(output)}
          <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
          <p style="text-align: center; color: #888; font-size: 0.9em;">
            Created by <a href="https://verikami.com" target="_blank">veriKami</a> °//
            <a href="https://linkedin.com/in/verikami" target="_blank">Weronika Kami</a> °//
            <a href="https://www.npmjs.com/package/@verikami/remark-deflist-revisited"
              target="_blank">remark-deflist-revisited</a>
          </p>
        </div>
      </body>
    </html>
  `;
}

//: Sample markdown to process
//: -----------------------------------------
const markdown = dedent`
  # Remark Deflist Revisited °// Express.js Example

  Node.js
  : JavaScript runtime built on Chrome's V8 engine
  : Uses an event-driven, non-blocking I/O model

  Remark Deflist Revisited
  : Compatible with Bun, Deno and Cloudflare Workers
  : Enhanced definition lists support
  : Supports nested lists

  Markdown
  : Lightweight markup language
  : Easy to write and read

  ## Features

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

//: Main Route - returns processed markdown
//: -----------------------------------------
app.get("/", async (req, res) => {
  try {
    const htmlResponse = await processMarkdown(markdown);
    
    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "X-Powered-By": "Node.js + Express + Remark Deflist Revisited"
    });
    
    res.send(htmlResponse);
  }
  catch (err) {
    res.status(500).json({
      error: "Failed to process markdown",
      details: err.message
    });
  }
});

//: Route to process your own markdown
//: -----------------------------------------
app.post("/process", async (req, res) => {
  try {
    const { markdown: customMarkdown } = req.body;
    
    if (!customMarkdown) {
      return res.status(400).json({
        error: "Markdown content is required"
      });
    }

    const htmlResponse = await processMarkdown(customMarkdown);
    
    res.set({
      "Content-Type": "text/html; charset=utf-8",
      "X-Powered-By": "Node.js + Express + Remark Deflist Revisited"
    });
    
    res.send(htmlResponse);
  }
  catch (err) {
    res.status(500).json({
      error: "Failed to process markdown",
      details: err.message
    });
  }
});

//: Route to return JSON with parsed HTML
//: -----------------------------------------
app.post("/api/process", async (req, res) => {
  try {
    const { markdown: customMarkdown } = req.body;
    
    if (!customMarkdown) {
      return res.status(400).json({
        error: "Markdown content is required"
      });
    }

    const output = await remark()
      .use(deflist)
      .use(html)
      .process(customMarkdown);

    res.json({
      html: String(output),
      processed: true
    });
  }
  catch (err) {
    res.status(500).json({
      error: "Failed to process markdown",
      details: err.message
    });
  }
});

//: SERVER
//: -----------------------------------------
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log("👄 Available routes:");
  console.log("   GET / - Demo page");
  console.log("   POST /process - Process custom markdown (returns HTML)");
  console.log("   POST /api/process - Process custom markdown (returns JSON)");
});
