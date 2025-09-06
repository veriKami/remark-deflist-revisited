import fs from "node:fs";
import path from "node:path";
import dedent from "dedent";
import { remark } from "remark";
import remarkHtml from "remark-html";
import patchedDeflist from "../dist/index.js";

const fixturesDir = path.resolve("tests/fixtures");
const outputDir = path.resolve("demo");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".md"));

files.forEach(file => {
  const input = fs.readFileSync(path.join(fixturesDir, file), "utf8");
  const html = remark()
    .use(patchedDeflist)
    .use(remarkHtml)
    .processSync(input)
    .toString();

  const htmlPage = dedent`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>TEST @ ${file}</title>
    <style>
    body { font-family: sans-serif; padding: 2rem; }
    dl { border: 1px solid #ccc; padding: 1rem; margin-bottom: 2rem; }
    dt { font-weight: bold; margin-top: 1rem; }
    dd { margin-left: 2rem; }
    dd ul, dd ol { margin-left: 1.5rem; }
    dd ul.nested-list, dd ol.nested-list { color: darkblue; }
    </style>
    </head>
    <body>
    ${html}
    </body>
    </html>`;

  fs.writeFileSync(path.join(outputDir, file.replace(".md", ".html")), htmlPage, "utf8");
  console.log(`Generated: ${file.replace(".md", ".html")}`);
});
