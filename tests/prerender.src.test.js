//: --------------------------------------------------------
//: tests/prerender.src.test.js
//: --------------------------------------------------------
import { remark } from "remark";
import prerenderMarkdown from "../src/index.ts";

const { test, expect } = import.meta.vitest;

//: SETUP
//: --------------------------------------------------------
// const tree = {
//   // 0: remark().parse("Definition"),
//   // 1: remark().parse(": Definition"),
//   // 2: remark().parse(": - Definition")
//   0: remark().use(prerenderMarkdown).parse("Definition"),
//   1: remark().use(prerenderMarkdown).parse(": Definition"),
//   2: remark().use(prerenderMarkdown).parse(": - Definition")
// };
//: -----------------------------------------
const leaf = {
  0: remark().use(prerenderMarkdown).processSync("Definition").toString(),
  1: remark().use(prerenderMarkdown).processSync(": Definition").toString(),
  2: remark().use(prerenderMarkdown).processSync(": - Definition").toString()
};

//: -----------------------------------------
// console.log(tree[0].children[0].children[0].value)
// prerenderMarkdown(tree[0]);
// console.log(tree[0].children[0].children[0].value)

// console.log(tree[1].children[0].children[0].value)
// prerenderMarkdown(tree[1]);
// console.log(tree[1].children[0].children[0].value)

// console.log(tree[2].children[0].children[0].value)
// prerenderMarkdown(tree[2]);
// console.log(tree[2]?.children[0]?.children[0]?.value)

//: -----------------------------------------
// console.log(tree[0].children[0].children[0].value);
// console.log(tree[1].children[0].children[0].value);
// console.log(tree[2].children[0].children[0].value);
// console.log(leaf[0]);
// console.log(leaf[1]);
// console.log(leaf[2]);

//: TESTS
//: --------------------------------------------------------
// test("Function: prerenderMarkdown()", () => {
//   prerenderMarkdown(tree[0]);
//   expect(tree[0].children[0].children[0].value).toBe("Definition");
//   prerenderMarkdown(tree[1]);
//   expect(tree[1].children[0].children[0].value).toBe("\n Definition");
//   prerenderMarkdown(tree[2]);
//   expect(tree[2].children[0]).toBe(undefined);
// });
//: -----------------------------------------

test("Function: prerenderMarkdown()", () => {
  expect(leaf[0]).toBe("Definition\n");
  expect(leaf[1]).toBe("\n&#x20;Definition\n");
  expect(leaf[2]).toBe("* Definition\n");
});
