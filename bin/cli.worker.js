#!/usr/bin/env node
//: --------------------------------------------------------
// bin/cli.js
//: --------------------------------------------------------
import fs from "node:fs";
import path from "node:path";

//: HELP
//: --------------------------------------------------------
function showHelp() {
  console.log(dedent`
    Usage: npx @verikami/remark-deflist-revisited [options]

    Options:
      --help, -h     Show this help message
      --version, -v  Show version
      --dir <path>   Specify custom directory (default: remark-deflist-worker-example)

    Examples:
      npx @verikami/remark-deflist-revisited
      npx @verikami/remark-deflist-revisited --dir my-worker
      npx remark-deflist-revisited-worker --help
    `);
}

//: DEDENT
//: --------------------------------------------------------
//: simplest version (without interpolation)
//: --------------------------------------------------------
// function dedent(str) {
//   if (str == null) return "";
//   if (typeof str !== "string") str = String(str);
//   if (str.trim() === "") return str;
//
//   const lines = str.split("\n");
//   let minIndent = Infinity;
//
//   for (const line of lines) {
//     if (line.trim().length === 0) continue;
//     const indent = line.match(/^\s*/)[0].length;
//     if (indent < minIndent) {
//       minIndent = indent;
//     }
//   }
//
//   if (minIndent === Infinity) return str;
//
//   return lines
//     .map(line => line.slice(minIndent))
//     .join("\n")
//     .trim();
// }
//: --------------------------------------------------------
//: with interpolation @ package.json + wrangler.toml
//: --------------------------------------------------------
function dedent(str) {
  if (typeof str !== "string") {
    if (Array.isArray(str)) {
      let result = "";
      for (let i = 0; i < str.length; i++) {
        result += str[i];
        if (i < arguments.length - 1) {
          result += arguments[i + 1];
        }
      }
      str = result;
    } else {
      str = String(str);
    }
  }

  if (str.trim() === "") return str;

  const lines = str.split("\n");
  let minIndent = Infinity;

  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const indent = line.match(/^\s*/)[0].length;
    if (indent < minIndent) {
      minIndent = indent;
    }
  }

  if (minIndent === Infinity) return str;

  return lines
    .map(line => line.slice(minIndent))
    .join("\n")
    .trim();
}

//: MAIN
//: --------------------------------------------------------
function createWorkerExample(targetDir) {
  if (!targetDir) targetDir = "remark-deflist-worker-example"
  const projectDir = path.join(process.cwd(), targetDir);
  
  if (fs.existsSync(projectDir)) {
    console.error("❌ Directory already exists:", targetDir);
    process.exit(1);
  }

  fs.mkdirSync(projectDir, { recursive: true });
  fs.mkdirSync(path.join(projectDir, "src"));

  //: package.json
  //: ------------------------------------------------------
  function getPackageVersion() {
    const packageJson = path.join(process.cwd(), "package.json");
    try {
      return JSON.parse(fs.readFileSync(packageJson, "utf8")).version;
    } catch {
      console.warn("Could not read version, using fallback");
      return "0.5.0"; // fallback
    }
  }
  //: ------------------------------------------------------
  const packageVersion = getPackageVersion();
  //: ------------------------------------------------------
  const packageJson = {
    name: "remark-deflist-worker-example",
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "wrangler dev",
      deploy: "wrangler deploy"
    },
    dependencies: {
      "@verikami/remark-deflist-revisited": `^${packageVersion}`,
      "remark": "^15.0.1",
      "remark-html": "^16.0.1",
      "dedent": "^1.7.0"
    },
    devDependencies: {
      "wrangler": "^4.37.0"
    }
  };

  //: .npmrc
  //: ------------------------------------------------------
  const npmrc = dedent`
    #: npm
    package-lock=true

    #: pnpm
    lockfile-dir=.
    lockfile=true
  ` + "\n";

  //: Worker code
  //: ------------------------------------------------------
  const workerCode = dedent`
    import { remark } from "remark";
    import html from "remark-html";
    import dedent from "dedent";
    import deflist from "@verikami/remark-deflist-revisited";

    export default {
      async fetch(request, env, ctx) {
        const markdown = dedent\`
          # Remark Deflist Revisited Example

          Cloudflare Worker
          : Serverless platform on the edge
          : Runs code close to users worldwide

          Remark Deflist Revisited
          : Enhanced definition lists support
          : Supports nested lists
          : Compatible with Bun, Deno and Cloudflare Workers

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
            - Bun
            - Deno
            - Node.js
        \`;

        try {
          const output = await remark()
            .use(deflist)
            .use(html)
            .process(markdown);

          const htmlResponse = dedent\`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Remark Deflist Revisited Demo</title>
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
                  \${String(output)}
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
          \`;

          return new Response(htmlResponse, {
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "X-Powered-By": "Cloudflare Workers + Remark Deflist Revisited"
            }
          });
        } catch (error) {
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
  ` + "\n";

  //: wrangler.toml
  //: ------------------------------------------------------
  const dateToday = new Date().toISOString().split("T")[0];
  //: ------------------------------------------------------
  const wranglerConfig = dedent`
    name = "remark-deflist-worker-example"
    compatibility_date = "${dateToday}"
    compatibility_flags = ["nodejs_compat"]
    main = "src/index.js"
  ` + "\n";

  //: README.md
  //: ------------------------------------------------------
  const readme = dedent`
    # Remark Deflist Revisited Worker Example

    Cloudflare Worker demonstrating [@verikami/remark-deflist-revisited][gh] plugin.

    ## Quick Start

    \`\`\`bash
    ツ npm install
    ツ npm run dev
    \`\`\`

    ## Deployment

    \`\`\`bash
    ツ npm run deploy
    \`\`\`

    ## Features

    - Definition lists with nested content
    - Cloudflare Workers compatibility
    - Built with Remark ecosystem

    ## Usage

    Visit the worker URL to see the demo in action.

    The worker processes Markdown with definition lists and converts it to HTML.

    ## Markdown Syntax Example

    \`\`\`markdown
    Term
    : Definition
    : - Nested item A
      - Nested item B
    \`\`\`

    2025 © [veriKami] °// [Weronika Kami]

    [gh]: https://github.com/veriKami/remark-deflist-revisited
    [Weronika Kami]: https://linkedin.com/in/verikami
    [veriKami]: https://verikami.com
  ` + "\n";

  //: ------------------------------------------------------
  //: FILES

  fs.writeFileSync(
    path.join(projectDir, "package.json"),
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  fs.writeFileSync(path.join(projectDir, ".npmrc"), npmrc);
  fs.writeFileSync(path.join(projectDir, "src", "index.js"), workerCode );
  fs.writeFileSync(path.join(projectDir, "wrangler.toml"), wranglerConfig);
  fs.writeFileSync(path.join(projectDir, "README.md"), readme);

  //: ------------------------------------------------------
  //: INFO

  console.log("✅ Remark Deflist Worker example created!");
  console.log("📁 Location:", targetDir);
  console.log("");
  console.log("📦 Next steps:");
  console.log("   cd", targetDir);
  console.log("   npm install");
  console.log("   npm run dev");
  console.log("");
  console.log("🌐 Learn more: https://github.com/veriKami/remark-deflist-revisited");
}

//: Parse command line arguments
//: --------------------------------------------------------
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  showHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  console.log("remark-deflist-worker v1.0.0");
  process.exit(0);
}

const dirIndex = args.indexOf("--dir");
const targetDir = (dirIndex !== -1) ? args[dirIndex + 1] : null;

//: --------------------------------------------------------
//: ACTION

createWorkerExample(targetDir);
