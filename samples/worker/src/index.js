import { remark } from "remark";
import html from "remark-html";
import dedent from "dedent";
import deflist from "@verikami/remark-deflist-revisited";

export default {
  async fetch(request, env, ctx) {
    const markdown = dedent`
      # Remark Deflist Revisited Worker Example

      Cloudflare Worker
      : Serverless platform on the edge
      : Runs code close to users worldwide

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
      : - Cloudflare Workers
        - Node.js
        - Deno
        - Bun
    `;

    try {
      const output = await remark()
        .use(deflist)
        .use(html)
        .process(markdown);

      const htmlResponse = dedent`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Remark Deflist Revisited Worker Example</title>
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
              h1 { color: #667eea; margin-top: 0; }
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
                <a href="https://github.com/veriKami/remark-deflist-revisited" target="_blank">
                @verikami/remark-deflist-revisited</a>
              </p>
            </div>
          </body>
        </html>
      `;

      return new Response(htmlResponse, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Powered-By": "Cloudflare Workers + Remark Deflist Revisited"
        }
      });
    }
    catch (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to process markdown",
          details: error.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  }
};
