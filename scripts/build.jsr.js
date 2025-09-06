import fs from "node:fs";
import path from "node:path";
// import { execSync } from "child_process";
import fg from "fast-glob";

// katalogi
const srcDir = path.resolve("src");
const libDir = path.resolve("lib");

// tablica wzorców do kopiowania
// const patterns = ["modules/**/*.ts", "utils/**/*.ts"];
const patterns = ["index.*ts", "mdast*.*ts"];

// funkcja kopiująca plik i tworząca foldery docelowe
function copyFileToLib(srcFile) {
  const relative = path.relative(srcDir, srcFile);
  const destFile = path.join(libDir, relative);
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  return destFile;
}

// 1. znajdź wszystkie pliki wg wzorców
const files = await fg(patterns, { cwd: srcDir, absolute: true });

// 2. kopiuj do lib
const libFiles = files.map(copyFileToLib);

// 3. usuń zwykłe komentarze, zostaw JSDoc
for (const file of libFiles) {
  const code = fs.readFileSync(file, "utf8");
  // 1) usuwa // ... do końca linii
  // 2) usuwa /* ... */ jeśli nie zaczyna się od /**
  // 3) usuwa puste linie
  const cleaned = code
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*(?!\*).*?\*\//gs, "")
    //.replace(/^\s*$(?:\r?\n)?/gm, "");

  fs.writeFileSync(file, cleaned, "utf8");
}

// 4. dprint format
// execSync("dprint fmt lib/**/*.ts", { stdio: "inherit" });

console.log("Build complete:", libFiles.length, "files processed.");
