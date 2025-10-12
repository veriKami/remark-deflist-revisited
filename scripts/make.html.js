#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/make.html.js
//: --------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import dedent from "dedent";
import { remark } from "remark";
import remarkHtml from "remark-html";
//: -----------------------------------------
import originalDeflist from "remark-deflist";
import revisitedDeflist from "../dist/index.js";

//: SETUP
//: -----------------------------------------
const fixturesDir = path.resolve("tests/fixtures");
const outputDir = path.resolve("demo/generated");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith(".md"));

//: HTML
//: --------------------------------------------------------
const makeHtml = ($ = {}) => {
  return dedent.withOptions({ alignValues: true })`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>Remark Deflist Revisited \\° TEST °// ${$?.file} (${$?.mode})</title>
    <meta name="description" content="Remark plugin. A wrapper around remark-deflist with improved
      support for nested definition lists. It preserves all the original functionality and performs
      additional processing. Bun, Deno and Cloudflare Workers compatibility. Also works in Astro
      and web browser.">
    <meta name="keywords" content="remark, remark-plugin, remark-deflist, markdown, markdown-plugin,
      definition-list, nested-lists, deflist, unist, astro, parser, wrapper, veriKami, Weronika Kami">
    <meta name="author" content="veriKami °// Weronika Kami">
    <meta name="pubdate" content="2025/10/08">
    <meta name="google-site-verification" content="qGe3Iz5C890mQVRy9dgEO5r5uALAa1kY_w-0GtLsAd8">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/a11y-dark.min.css">
    <link rel="stylesheet" _href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">
    <link rel="stylesheet" href="../assets/main.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-3TQT133E82"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date()); gtag("config", "G-3TQT133E82");
    </script>
    </head>
    <body>
    <header>
      <h1><a href="../index.html">Remark Deflist Revisited</a> \\° TEST °// ${$?.file} (${$?.mode})</h1>
    </header>
    <hr>
    <navigate>
      <table>
      <tr><td>revisited</td><td>${$?.menuRevisited}</td></tr>
      <tr><td>original module</td><td>${$?.menuOriginal}</td></tr>
      </table>
    </navigate>
    <hr>
    <main>
      <article>
    ${$?.html}
      </article>
    </main>
    </body>
    </html>`;
};

//: MENU
//: --------------------------------------------------------
const makeMenu = (mode = "revisited") => {
  return files.reduce((acc, file) => {
      const name = file.replace(".md", ".html");
      acc.push([name, `<a href="${mode}.${name}">${name.replace(".html", "")}</a>`]);
      return acc;
    }, [])
    .sort((a, b) => a[0].startsWith("_") - b[0].startsWith("_"))
    .map(item => item[1])
    .join("</td><td>");
};

//: FILES
//: --------------------------------------------------------
const makeFiles = (mode = "revisited") => {
  const modules = { originalDeflist, revisitedDeflist };
  const deflist = modules[`${mode}Deflist`];

  if (!deflist) {
    throw new Error(`Module not found for: ${mode}`);
  }

  files.forEach(file => {
    try {
      const input = fs.readFileSync(path.join(fixturesDir, file), "utf8");

      const html = remark()
        .use(deflist)
        .use(remarkHtml, { sanitize: false })
        .processSync(input)
        .toString();

      const menuOriginal = makeMenu("original");
      const menuRevisited = makeMenu("revisited");

      const htmlPage = makeHtml({
        file,
        mode,
        menuOriginal,
        menuRevisited,
        html
      });

      const outputFileName = `${mode}.${file.replace(".md", ".html")}`;
      const outputPath = path.join(outputDir, outputFileName);

      fs.writeFileSync(outputPath, htmlPage, "utf8");
      console.log(`Generated: ${outputFileName}`);
    } catch (err) {
      console.error(`Error processing: ${file}`, err.message);
    }
  });
};

//: INDEX
//: --------------------------------------------------------
const makeIndex = ($ = "revisited.list.basic.html") => {
  const sourcePath = path.join(outputDir, $);
  const targetPath = path.join(outputDir, "index.html");
  try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`\nIndex via: ${$}`);
    } catch (err) {
      console.error(`👄 Error processing: ${$}`, err.message);
    }
};

//: --------------------------------------------------------
//: ACTION

makeFiles("original");
makeFiles("revisited");

makeIndex();
