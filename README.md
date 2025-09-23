# @verikami/remark-deflist-revisited

[![GH][GH Badge]][GH]
[![CC][CC Badge]][CC]
[![CI][CI Badge]][CI]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]

**[Remark]** plugin. A wrapper around **[remark-deflist]** with improved support for nested definition lists.
It preserves all the original functionality and performs additional processing.
**[Bun]**, **[Deno]** and **[Cloudflare Workers]** compatibility. Also works in **[Astro]** and web browser.

## Installation

```bash
ツ pnpm add @verikami/remark-deflist-revisited
ツ npm i @verikami/remark-deflist-revisited
```

Cloudflare Worker demo

```bash
ツ npx @verikami/remark-deflist-revisited@latest
ツ npx @verikami/remark-deflist-revisited --help
```

TypeScript version

```bash
ツ pnpm add jsr:@verikami/remark-deflist-revisited
ツ npx jsr add @verikami/remark-deflist-revisited
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

1. Using `: *` as a list marker (especially for the first item) is resolved in v0.4.0.
2. Using `: - *x*` or `: - **x**` is not problematic.
3. See [generated examples][generated] for real life test.

### Usage in Node.js

```js
import { remark } from "remark";
import html from "remark-html";
import deflist from "@verikami/remark-deflist-revisited";

const markdown = `
Term
: - item A
  - item B
  - item C
`;

const output = await remark()
  .use(deflist)
  .use(html)
  .process(markdown);

console.log(String(output));

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

### Usage in Cloudflare Worker

```js
import { remark } from "remark";
import html from "remark-html";
import dedent from "dedent";
import deflist from "@verikami/remark-deflist-revisited";

export default {
  async fetch(request, env, ctx) {

    const markdown = dedent`
      Term
      :  - item A
         - item B
         - item C
    `;

    const output = await remark()
      .use(deflist)
      .use(html)
      .process(markdown);

    return new Response(String(output), {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};

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
        await remark()
          .use(deflist)
          .use(html)
          .process(markdown)
      );

      const append = async (markdown) => {
        const output = await render(markdown);
        const el = document.getElementById("markdown");
        el.innerHTML += String(output);
      };

      const markdown = dedent`
        Term
        : - item A
          - item B
          - item C
      `;

      document.body.onload = append(markdown);

    </script>
  </head>
  <body>
    <div id="markdown"></div>
  </body>
</html>

```

<!-- See live example @ **[script.esm.sh.html][inline]** -->

## Development

Automatic installation of Cloudflare Worker Demo is available from version v0.5.20
    
```bash
# installer
ツ npx @verikami/remark-deflist-revisited

# latest version
ツ npx @verikami/remark-deflist-revisited@latest

# how to use 
ツ npx @verikami/remark-deflist-revisited --help
``` 

To see sample html output in terminal run

```bash
# (node): scripts/sample.node.js
ツ pnpm sample

# (bun): scripts/sample.node.js
ツ pnpm sample:bun

# (deno): scripts/sample.deno.js
ツ pnpm sample:deno
```

To regenerate `demo/generated/*` html files run 

```bash
# (node): dist/index.js
ツ pnpm demo

# (tsx): src/index.ts
ツ pnpm demo:ts
```

## Processing Flow

[![CC][CC Badge]][CC]
[![CI][CI Badge]][CI]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]
[![Socket][Socket Badge]][Socket]

```
Markdown
   │
Plugin (wrapped remark-deflist)
   │
AST // HTML
   │
Snapshots (vitest)
   │
Build (npm) ./dist + (jsr) ./lib
   │
CI/CD (GitHub Actions)
   │
┌──────────┬─────────┬─────────┐
│ GitHub   │   NPM   │   JSR   │
│ Packages │         │         │
└──────────┴─────────┴─────────┘
```

<!--
[![Downloads][Downloads Badge]][Downloads]
[![Socket][Socket Badge]][Socket]
-->

## License

Original work — MIT © Alex Shaw

* [gh: Symbitic/remark-plugins](https://github.com/Symbitic/remark-plugins)
* [npm: remark-deflist](https://www.npmjs.com/package/remark-deflist)

MIT © [veriKami](https://verikami.com) °// Weronika Kami

[GH]: https://github.com/veriKami/remark-deflist-revisited
[GH Badge]: https://img.shields.io/badge/GitHub-Repository-blue?logo=github

[CC]: https://codecov.io/github/veriKami/remark-deflist-revisited
[CC Badge]: https://codecov.io/github/veriKami/remark-deflist-revisited/graph/badge.svg?token=0EWE7CIAVI

[CI]: https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml
[CI Badge]: https://github.com/veriKami/remark-deflist-revisited/actions/workflows/publish.yml/badge.svg

[NPM]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited
[NPM Badge]: https://img.shields.io/npm/v/@verikami/remark-deflist-revisited?logo=npm&logoColor=white&labelColor=blue&color=black

[JSR]: https://jsr.io/@verikami/remark-deflist-revisited
[JSR Badge]: https://jsr.io/badges/@verikami/remark-deflist-revisited

[Downloads]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited
[Downloads Badge]: https://img.shields.io/npm/dm/@verikami/remark-deflist-revisited.svg

[Socket]: https://badge.socket.dev/npm/package/@verikami/remark-deflist-revisited/0.5.23
[Socket Badge]: https://badge.socket.dev/npm/package/@verikami/remark-deflist-revisited/0.5.23

[Remark]: https://github.com/remarkjs/remark
[remark-deflist]: https://www.npmjs.com/package/remark-deflist
[Bun]: https://bun.sh
[Deno]: https://deno.com
[Cloudflare Workers]: https://workers.cloudflare.com
[Astro]: https://astro.build

[page]: https://verikami.github.io/remark-deflist-revisited
[inline]: https://verikami.github.io/remark-deflist-revisited/script.esm.sh.html
[generated]: https://verikami.github.io/remark-deflist-revisited/generated

<!--
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https://raw.githubusercontent.com/verikami/remark-deflist-revisited/master/package.json)](https://github.com/verikami/remark-deflist-revisited)
-->
