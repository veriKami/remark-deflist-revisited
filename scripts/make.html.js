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
    <title>TEST @ ${$?.file} (${$?.mode})</title>
    <style>
    body { font-family: sans-serif; font-size: 1rem; padding: 2rem; background: #fff; }
    hr { margin: 0 0 1rem; height: 1px; border-width: 0; background-color: #ccc; }
    pre, dl { border: 1px solid #ccc; margin: 1rem 0; padding: 1rem; background: #fff; }
    pre { background: #f8f8f8; font-size: .85rem; }
    dt { font-weight: bold; margin-bottom: .5rem; }
    dd { margin: 0 1rem .5rem; color: gray; }
    dd ul, dd ol { margin-left: 0; color: darkblue; }
    ul, ol { margin-left: 2rem; color: red; }
    ul li ul, ol li ol { margin-left: 0; }
    table { border-collapse: collapse; background: #fff; }
    tr:nth-child(2) td:first-child { color: #aaa; font-weight: normal; }
    tr:nth-child(2) a { color: darkTurquoise; }
    td { padding: .3rem .5rem; border: 1px solid #ddd; }
    td:first-child { text-align: right; font-weight: bold; }
    a, a:visited { color: blue; text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1 a, h1 a:hover { text-decoration: none; }
    </style>
    </head>
    <body>
    <h1><a href="../index.html">🔘</a> ${$?.file} (${$?.mode})</h1>
    <hr>
    <table>
    <tr><td>revisited</td><td>${$?.menuRevisited}</td></tr>
    <tr><td>original module</td><td>${$?.menuOriginal}</td></tr>
    </table>
    ${$?.html}
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
        .use(remarkHtml)
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
      console.error(`Error processing: ${$}`, err.message);
    }
};

//: --------------------------------------------------------
//: ACTION

makeFiles("original");
makeFiles("revisited");

makeIndex();
