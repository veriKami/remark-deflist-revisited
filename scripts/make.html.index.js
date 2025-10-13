#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/make.html.index.js
//: --------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import dedent from "dedent";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { execSync } from "node:child_process";
//: -----------------------------------------
import deflist from "../dist/index.js";

//: SETUP
//: -----------------------------------------
const fixturesDir = path.resolve("");
const outputDir = path.resolve("demo");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".md"));

//: HTML
//: --------------------------------------------------------
const htmlHeader = dedent`
  <header>
    <h1>
    <a href="https://verikami.github.io">veriKami</a> °//
    <a href="https://github.com/veriKami/remark-deflist-revisited">
      Remark Deflist Revisited</a>
    </h1>
  </header>
  <hr>
  <navigate>
    <ul class="first">
    <li><p>
      Module Documentation @
      <a href="docs/index.html">docs/index.html</a>
    </p></li>
    <li><p>
      CodeSandbox Devbox @
      <a href="codesandbox/index.html">codesandbox/index.html</a>
    </p></li>
    </ul>
    <ul class="last">
    <li><p>
      HTML (real life test) generated from markdown @
      <a href="generated/index.html">generated/index.html</a>
    </p></li>
    <li><p>
      HTML with inline script via https://esm.sh @
      <a href="html/index.html">html/index.html</a>
    </p></li>
    </ul>
  </navigate>
`;

const makeHtml = ($ = {}) => {
  return dedent.withOptions({ alignValues: true })`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>veriKami °// Remark Deflist Revisited</title>
    <meta name="description" content="Remark plugin. A wrapper around remark-deflist with improved
      support for nested definition lists. It preserves all the original functionality and performs
      additional processing. Bun, Deno and Cloudflare Workers compatibility. Also works in Astro
      and web browser.">
    <meta name="keywords" content="remark, remark-plugin, remark-deflist, markdown, markdown-plugin,
      definition-list, nested-lists, deflist, unist, astro, parser, wrapper, veriKami, Weronika Kami">
    <meta name="author" content="veriKami °// Weronika Kami">
    <meta name="pubdate" content="2025/10/08">
    <meta name="google-site-verification" content="qGe3Iz5C890mQVRy9dgEO5r5uALAa1kY_w-0GtLsAd8">
    <link rel="canonical" href="https://verikami.github.io/remark-deflist-revisited/" hreflang="en">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/a11y-dark.min.css">
    <link rel="stylesheet" href="assets/main.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-3TQT133E82"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", "G-3TQT133E82");
    </script>
    </head>
    <body>
    ${$?.htmlHeader}
    <hr>
    <main>
    ${$?.html}
    </main>
    </body>
    </html>`;
};

//: FILES
//: --------------------------------------------------------
const makeFiles = (mode) => {
  mode = mode ? mode + "." : "";

  files.forEach(file => {
    try {
      const input = fs.readFileSync(path.join(fixturesDir, file), "utf8");

      const html = remark()
        .use(deflist)
        .use(remarkHtml)
        .processSync(input)
        .toString()
        .replace(/<h1>.*<\/h1>/g, "");

      const htmlPage = makeHtml({
        file,
        mode,
        html,
        htmlHeader
      });

      const outputFileName = `${mode}${file.replace(".md", ".html")}`
        .toLowerCase().replace("readme", "index");
      const outputPath = path.join(outputDir, outputFileName);

      fs.writeFileSync(outputPath, htmlPage, "utf8");
      console.log(`Generated: ${outputFileName}`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  });
};

//: FORMAT
//: --------------------------------------------------------
const makeFormat = (target = "demo/index.html") => {
  try {
    execSync(`pnpm dprint fmt ${target}`, { stdio: "inherit" });
  } catch (err) {
    console.error("👄 Error processing file", err.message);
  }
}

//: --------------------------------------------------------
//: ACTION

makeFiles();
makeFormat();
