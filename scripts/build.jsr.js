#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/build.jsr.js
//: --------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";

//: katalogi
//: --------------------------------------------------------
const srcDir = path.resolve("src");
const libDir = path.resolve("lib");

//: tablica wzorców do kopiowania
//: --------------------------------------------------------
const patterns = ["index.*ts", "mdast*.*ts"];

//: funkcja kopiująca plik i tworząca foldery docelowe
//: --------------------------------------------------------
function copyFileToLib(srcFile) {
  const relative = path.relative(srcDir, srcFile);
  const destFile = path.join(libDir, relative);
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  return destFile;
}

//: --------------------------------------------------------
//: 1. znajdź wszystkie pliki wg wzorców
//: --------------------------------------------------------
const files = await fg(patterns, { cwd: srcDir, absolute: true });

//: --------------------------------------------------------
//: 2. kopiuj do lib
//: --------------------------------------------------------
const libFiles = files.map(copyFileToLib);

//: --------------------------------------------------------
//: 3. usuń zwykłe komentarze, zostaw JSDoc
//: --------------------------------------------------------
// const multiLineComment = new RegExp("\\/\\*[\\s\\S]*?\\*\\/", "g");
//: single Lines without //:
// const singleLineComment = new RegExp("\\/\\/(?!:).*?(?=$|\\n)", "gm");
//: --------------------------------------------------------
const singleLineComment = new RegExp("\\/\\/.*$", "gm");
const multiSpace = new RegExp("^\\s*$\\r?\\n", "gm");

for (const file of libFiles) {
  const code = fs.readFileSync(file, "utf8");
  const cleaned = code
    // .replace(multiLineComment, "")
    .replace(singleLineComment, "")
    .replace(multiSpace, "\n");

  fs.writeFileSync(file, cleaned, "utf8");
}

//: --------------------------------------------------------
//: 4. Transform imports for JSR
//: --------------------------------------------------------
const pkgJsonPath = path.resolve("package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
const deps = {
  ...pkgJson.dependencies,
  ...pkgJson.peerDependencies,
  ...pkgJson.devDependencies
};

const replacements = {
  //: main ------------------------
  "remark-deflist": `npm:remark-deflist@${deps["remark-deflist"]}`,
  "unified": `npm:unified@${deps["unified"]}`,
  "unist": `npm:@types/unist@${deps["@types/unist"]}`,
  "mdast": `npm:@types/mdast@${deps["@types/mdast"]}`,
  "unist-util-visit": `npm:unist-util-visit@${deps["unist-util-visit"]}`,
  "vfile": `npm:vfile@${deps["vfile"]}`,
  //: doc -------------------------
  "remark": `npm:remark@${deps["remark"]}`,
  "remark-html": `npm:remark-html@${deps["remark-html"]}`,
};

const importKeys = Object.keys(replacements).join("|");
const importRegex = new RegExp(`from "(${importKeys})";`, "g");

for (const file of libFiles) {
  let content = fs.readFileSync(file, "utf8");
  content = content.replace(
    importRegex, (match, pkgName) => `from "${replacements[pkgName]}";`
  );
  fs.writeFileSync(file, content, "utf8");
}

//: --------------------------------------------------------
//: DONE

console.log("⛺️ Build complete:", libFiles.length, "files processed.");
