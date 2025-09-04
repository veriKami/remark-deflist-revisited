# @verikami/remark-deflist-patched

Nakładka na remark-deflist z poprawioną obsługą zagnieżdżonych list definicji. Zachowuje wszystkie funkcje oryginału instalując go jako dependency.

**@verikami/remark-deflist-revisited**  
**@verikami/remark-deflist-list**

## Instalacja

```bash
ツ npm i @verikami/remark-deflist-patched
ツ pnpm add @verikami/remark-deflist-patched
ツ pnpm add jsr:@verikami/remark-deflist-patched
```

## Użycie

### Problem with `remark-deflist` plugin

jest taki, że renderuje niepoprawnie elementy listy zagnieżdżone w `<dd>`

### Markdown

```markdown
Term
: - item A
  - item B
  - item C
```

### Using `remark-deflist`

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

### Using `@verikami/remark-deflist-patched`

```
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

### UWAGI:

1. Użycie `: *` jako znacznika listy (w szczególności) w pierwszym elemencie powoduje błąd
2. Użycie `: - *x*` lub `: - **x**` jest również problematyczne

### Usage in node.js

```
import { remark } from "remark";
import html from "remark-html";
import deflist from "@verikami/remark-deflist-patched";

let markdown, output;

markdown = `
Term
: Definition
  - item A
  - item B
`;

/*
-----------------------------------------
TODO: first item is not list item
-----------------------------------------
<dl><dt>Term</dt><dd>Definition</dd></dl>
-----------------------------------------
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

markdown = `
Term
: - item A
  - item B
  - item C
`;

/*
-----------------------------------------
<dl><dt>Term</dt><dd><ul>
<li>item A</li>
<li>item B</li>
<li>item C</li>
</ul></dd></dl>
-----------------------------------------
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));

markdown = `
Term
: - **item** A
  - **item** B
  - **item** C
`;

/*
-----------------------------------------
<dl><dt>Term</dt><dd><ul>
<li><strong>item</strong> A</li>
<li><strong>item</strong> B</li>
<li><strong>item</strong> C</li>
</ul></dd></dl>
-----------------------------------------
*/
output = await remark().use(deflist).use(html).process(markdown);
console.log(String(output));


```

### Usage in Astro

```
import remarkDeflist from "@verikami/remark-deflist-patched";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkDeflist
    ]
});

```

## Flow działania
```

Markdown
   │
Plugin (patched deflist)
   │
HTML / AST
   │
Snapshoty (Vitest)
   │
Build (dist/)
   │
CI/CD (GitHub Actions)
   │
┌───────────┬──────────────┬───────────────┐
│   npm     │ GitHub       │  JSR          │
│           │ Packages     │ (opcjonalnie) │
└───────────┴──────────────┴───────────────┘


```

## Licencja

Wszelkie prawa do oryginału — MIT © Alex Shaw

- [www.npmjs.com/package/remark-deflist](https://www.npmjs.com/package/remark-deflis)
- [github.com/Symbitic/remark-plugins](https://github.com/Symbitic/remark-plugins)

[MIT](LICENSE.md) © veriKami 
