import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { unified } from "unified";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
import deflist from "remark-deflist";
// import deflistWithLists from "../src/index.ts";
import deflistWithLists from "../dist/index.js";

function loadFixture(name) {
  return readFileSync(join(__dirname, "fixtures", name), "utf8");
}

async function runAST(markdown, plugin) {
  return unified().use(remarkParse).use(plugin).parse(markdown);
}

async function runOutput(markdown, plugin) {
  const file = await remark()
    .use(plugin)
    .use(remarkHtml)
    .process(markdown);

  return String(file);
}

describe("remark-deflist mixed mode", () => {
  const cases = [
    // "simple.md",
    // "nested.md",
    // "complex.md",
    "list.basic.md",  //: <:-------
    "list.prefix.md", //: <:-------
  ];
  for (const file of cases) {
    it(`AST + output porównanie: ${file}`, async () => {
      const input = loadFixture(file);
      const [origAST, patchedAST] = await Promise.all([
        runAST(input, deflist),
        runAST(input, deflistWithLists),
      ]);
      const [origOut, patchedOut] = await Promise.all([
        runOutput(input, deflist),
        runOutput(input, deflistWithLists),
      ]);
      expect({
        input,
        original: { ast: origAST, output: origOut },
        patched: { ast: patchedAST, output: patchedOut },
      }).toMatchSnapshot();
    });
  }
});
