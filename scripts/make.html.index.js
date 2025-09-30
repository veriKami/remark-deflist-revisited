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
//: --------------------------------------------------------
import deflist from "../dist/index.js";

//: SETUP
//: -----------------------------------------
const fixturesDir = path.resolve("");
const outputDir = path.resolve("demo");

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
    <title>veriKami °// Remark Deflist Revisited</title>
    <meta name="google-site-verification" content="qGe3Iz5C890mQVRy9dgEO5r5uALAa1kY_w-0GtLsAd8">
    <style>
    body { font-family: sans-serif; font-size: 1rem; padding: 0 2rem 2rem; background: #fff; }
    hr { margin: 0 -2rem 1rem; height: 1px; border-width: 0; background-color: #ccc; }
    pre, dl { border: 1px solid #ccc; margin: 1rem 0; padding: 1rem; background: #fff; }
    pre { background: #f8f8f8; font-size: .85rem; }
    dt { font-weight: bold; margin-bottom: .5rem; }
    dd { margin: 0 1rem .5rem; color: gray; }
    dd ul, dd ol { margin-left: 0; color: darkblue; }
    ul, ol { margin-left: 2rem; __color: red; }
    ul li ul, ol li ol { margin-left: 0; }
    table { border-collapse: collapse; background: #fff; }
    tr:nth-child(2) td:first-child { color: #aaa; font-weight: normal; }
    tr:nth-child(2) a { color: darkTurquoise; }
    td { padding: .3rem .5rem; border: 1px solid #ddd; }
    td:first-child { text-align: right; font-weight: bold; }
    a, a:visited { color: blue; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1 a, h1 a:visited, h1 a:hover { text-decoration: none; color: inherit; }
    h1 { padding: 0 4.5rem; }
    navigate ul { margin: 2.5rem 5rem; color: red; }
    navigate li p,
    navigate li code { color: black; }
    navigate li code { padding: .3rem .5rem; background: #f5f5f5; border:1px solid #ddd; }
    main { padding: .5rem 4.5rem; }
    main ul, main ol { padding: 0 1rem; }
    </style>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-3TQT133E82"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag("js", new Date()); gtag("config", "G-3TQT133E82");
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

const htmlHeader = `
  <h1>
    <a href="https://github.com/veriKami/remark-deflist-revisited" target="_blank">
    veriKami °// Remark Deflist Revisited</a>
  </h1>
  <hr>
  <navigate>
  <ul>
  <li>
    <p>
      html generated from markdown @
      <a href="generated/revisited.list.basic.html">generated/index.html</a>
    </p>
  </li>
  <li>
    <p>
      test inline script from https://esm.sh @
      <a href="script.esm.sh.html">script.esm.sh.html</a>
    </p>
  </li>
  <li>
    <p>
      documentation available @
      <a href="docs/index.html">docs/index.html</a>
    </p>
  </li>
  </ul>
  </navigate>
`;

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
