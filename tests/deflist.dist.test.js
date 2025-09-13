import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { describe, it, expect, beforeAll } from "vitest";
import { unified } from "unified";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkParse from "remark-parse";
//: -----------------------------------------
import deflist from "remark-deflist";
import deflistWithLists from "../dist/index.js";

//: --------------------------------------------------------
//: HELPERS

function loadFixture(name) {
  // const content = readFileSync(join(process.cwd(), "tests", "fixtures", name), "utf8");
  const content = readFileSync(join(import.meta.dirname, "fixtures", name), "utf8");
  return content.replace(/\r\n/g, "\n"); //: EOL Normalization
}

async function runAST(markdown, plugin) {
  return await unified()
    .use(remarkParse)
    .use(plugin)
    .parse(markdown);
}

async function runOutput(markdown, plugin) {
  const file = await remark()
    .use(plugin)
    .use(remarkHtml)
    .process(markdown);

  return String(file);
}

//: --------------------------------------------------------
//: TESTS

describe("remark-deflist mixed mode", () => {

  //: SETUP
  //: ---------------------------------------
  const cases = [
    "list.basic.md",
    "list.nested.md",
    "list.strange.md",
  ];

  //: CHECK
  //: ---------------------------------------
  beforeAll(() => {
    let exists = true;
    const tests = readdirSync("tests")
      .filter(f => f.endsWith("dist.test.js"));
    for (const file of tests) {
      const snapshot = join("__snapshots__", `${file}.snap`);
      exists = existsSync(join("tests", snapshot));
      if (!exists) {
        console.error("❌ Brak pliku snapshot –", file);
        expect(exists).toBe(true);
      }
    }
  });

  //: RUN
  //: ---------------------------------------
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
