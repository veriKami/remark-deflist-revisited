# @verikami/remark-deflist-revisited

[![GH Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/veriKami/remark-deflist-revisited)
[![JSR Repo](https://jsr.io/badges/@<scope>/<package>)](https://jsr.io/@<scope>/<package>)
[![CI](https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml/badge.svg)](https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml)

A wrapper around **remark-deflist** with improved support for nested definition lists.
It preserves all the original functionality by installing **remark-deflist** as a dependency.

## Installation

```bash
ツ npm i @verikami/remark-deflist-revisited
ツ pnpm add @verikami/remark-deflist-revisited
```

## Usage

### The problem with `remark-deflist`

The plugin renders nested list items inside `<dd>` incorrectly.

**Markdown**

```markdown
Term
: - item A
  - item B
  - item C
```

**With `remark-deflist`**

```html
<dl>
<dt> Term </dt>
<dd>
  <ul>
    <li> item A </li>
  </ul>
</dl>
<ul>
  <li> item B </li>
  <li> item C </li>
</ul>
```

**With `@verikami/remark-deflist-revisited`**

```html
<dl>
<dt>Term</dt>
<dd>
  <ul>
    <li> item A </li>
    <li> item B </li>
    <li> item C </li>
  </ul>
</dl>
```

### Notes

1. Using `: *` as a list marker (especially for the first item) is still causing errors.
2. Using `: - *x*` or `: - **x**` is not problematic.

### Usage in Node.js

```js
import { remark } from "remark";
import html from "remark-html";
import deflist from "@verikami/remark-deflist-revisited";

let markdown;
let output;

markdown = `
Term
: - item A
  - item B
  - item C
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
<dl><dt>Term</dt><dd><ul>
<li>item A</li>
<li>item B</li>
<li>item C</li>
</ul></dd></dl>
------------------------------------------ */

markdown = `
Term
: - **item** A
  - **item** B
  - **item** C
`;

output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

/* ------------------------------------------
<dl><dt>Term</dt><dd><ul>
<li><strong>item</strong> A</li>
<li><strong>item</strong> B</li>
<li><strong>item</strong> C</li>
</ul></dd></dl>
------------------------------------------ */


```

### Usage in Astro

```js
import remarkDeflist from "@verikami/remark-deflist-revisited";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkDeflist
    ]
  }
});
```

## Processing Flow

```
Markdown
   │
Plugin (patched deflist)
   │
HTML // AST
   │
Snapshots (Vitest)
   │
Build (dist)
   │
CI/CD (GitHub Actions)
   │
┌───────────┬──────────────┬───────────────┐
│   npm     │ GitHub       │  JSR          │
│           │ Packages     │ (optional)    │
└───────────┴──────────────┴───────────────┘
```

## License

Original work — MIT © Alex Shaw

* [gh: Symbitic/remark-plugins](https://github.com/Symbitic/remark-plugins)
* [npm: remark-deflist](https://www.npmjs.com/package/remark-deflist)

[MIT](LICENSE) © veriKami
