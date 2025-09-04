import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { unified } from "unified";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import deflist from "remark-deflist";
import myDeflist from "../src/index.js";

function loadFixture(name) {
  return readFileSync(join(__dirname, "fixtures", name), "utf8");
}

async function runAST(markdown, plugin) {
  return unified().use(remarkParse).use(plugin).parse(markdown);
}

async function runOutput(markdown, plugin) {
  const file = await remark()
    .use(plugin)
    .use(remarkHtml) // <-- konwersja AST na HTML
    .process(markdown);

  return String(file);
}

describe("remark-deflist mixed mode", () => {
  const cases = [
    // "simple.md",
    // "nested.md",
    // "complex.md",
    "list.md", //: <:--------------
  ];
  for (const file of cases) {
    it(`AST + output porównanie: ${file}`, async () => {
      const input = loadFixture(file);
      const [origAST, patchedAST] = await Promise.all([
        runAST(input, deflist),
        runAST(input, myDeflist),
      ]);
      const [origOut, patchedOut] = await Promise.all([
        runOutput(input, deflist),
        runOutput(input, myDeflist),
      ]);
      expect({
        input,
        original: { ast: origAST, output: origOut },
        patched: { ast: patchedAST, output: patchedOut },
      }).toMatchSnapshot();
    });
  }
});
