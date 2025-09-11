# @verikami/remark-deflist-revisited

[![GH Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/veriKami/remark-deflist-revisited)
[![CI](https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml/badge.svg)](https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml)
[![NPM Repo](https://img.shields.io/npm/v/@verikami/remark-deflist-revisited?logo=npm&logoColor=white&labelColor=blue&color=black)](https://www.npmjs.com/package/@verikami/remark-deflist-revisited)
[![JSR Repo](https://jsr.io/badges/@verikami/remark-deflist-revisited)](https://jsr.io/@verikami/remark-deflist-revisited)

**[Remark]** plugin. A wrapper around **[remark-deflist]** with improved support for nested definition lists.
It preserves all the original functionality by installing this module as a dependency.
**[Deno]** and **[Cloudflare Workers]** compatibility. Works in **[Astro]**.

## Installation

```bash
ツ pnpm add @verikami/remark-deflist-revisited
ツ npm i @verikami/remark-deflist-revisited
```

## Usage

**The problem** with **`remark-deflist`** is that the plugin renders nested list items inside `<dd>` incorrectly.

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

### Usage in Deno

```js
import { remark } from "npm:remark@^15";
import html from "npm:remark-html@^16";
import deflist from "npm:@verikami/remark-deflist-revisited";

// (...) same code as above

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

### Usage in html

```html
<html>
  <head>
    <script type="module">
      import { remark } from "https://esm.sh/remark@15";
      import html from "https://esm.sh/remark-html@16";
      import dedent from "https://esm.sh/dedent@1";
      import deflist from "https://esm.sh/@verikami/remark-deflist-revisited";

      const render = async (markdown) => (
        await remark().use(deflist).use(html).process(markdown)
      );

      const append = async (markdown) => {
        const output = await render(markdown);
        const el = document.getElementById("markdown");
        el.innerHTML += String(output);
      };

      let markdown = dedent`
        Term
        : - item A
          - item B
          - item C
      `;

      document.body.onload = append(markdown);

      markdown = dedent`
        Term
        : - **item** A
          - **item** B
          - **item** C
      `;

      document.body.onload = append(markdown);

    </script>
  </head>
  <body>
    <div id="markdown"></div>
  </body>
</html>

```

## API

### `deflistWithLists()`

#### Returns
- `Transformer` — a unified transformer function

#### Example
```ts
function deflistWithLists(): Transformer
remark().use(deflistWithLists)
```

## Processing Flow

```
Markdown
   │
Plugin (wrapped remark-deflist)
   │
HTML // AST
   │
Snapshots (Vitest)
   │
Build (npm) ./dist + (jsr) ./lib
   │
CI/CD (GitHub Actions)
   │
┌───────────┬─────────┬─────────┐
│ GitHub    │   NPM   │   JSR   │
│ Packages  │         │         │
└───────────┴─────────┴─────────┘
```

## License

Original work — MIT © Alex Shaw

* [gh: Symbitic/remark-plugins](https://github.com/Symbitic/remark-plugins)
* [npm: remark-deflist](https://www.npmjs.com/package/remark-deflist)

MIT © [veriKami](https://verikami.com) °// Weronika Kami

[Remark]: https://github.com/remarkjs/remark
[Deno]: https://github.com/denoland/deno
[Cloudflare Workers]: https://workers.cloudflare.com
[Astro]: https://astro.build
[remark-deflist]: https://www.npmjs.com/package/remark-deflist
