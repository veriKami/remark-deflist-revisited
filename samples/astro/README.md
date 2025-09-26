# Remark Deflist Revisited °// Astro Integration

[![GH][GH Badge]][GH]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]
[![Downloads][Downloads Badge]][Downloads]
[![Socket][Socket Badge]][Socket]

**[Astro]** integration of the **`@verikami/remark-deflist-revisited`** module, demonstrating enhanced definition lists processing in markdown within Astro projects with full SSR/SSG capabilities.

**[Remark Deflist Revisited][module]** is a **[Remark]** plugin. A wrapper around **`remark-deflist`** with improved support for nested definition lists. It preserves all the original functionality and performs additional processing. 

## 📄 Overview

This project provides an Astro integration example showcasing how to use **`remark-deflist-revisited`** in modern static site generation and server-side rendering environments. **[Express.js]**, **[Cloudflare Worker]** and **[Simple]** examples are also available.

## ✨ Features

- **Astro Integration** → Seamless integration with Astro's markdown pipeline
- **Enhanced Definition Lists** → Support for complex nested structures
- **SSG/SSR Support** → Works with both static and server rendering
- **Beautiful Styling** → Professional CSS styling with gradient background
- **Zero Config** → Easy setup with minimal configuration
- **TypeScript Ready** → Full TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm, pnpm or yarn

### Installation

```bash
## Create a new Astro project
ツ npm create astro@latest

## Install the remark-deflist-revisited plugin
ツ npm install @verikami/remark-deflist-revisited
```

### Configuration

Add the plugin to your `astro.config.mjs`

```javascript
import { defineConfig } from "astro/config";
import remarkDeflist from "@verikami/remark-deflist-revisited";

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkDeflist
    ]
  }
});
```

### Usage in Markdown Files

Create `.md` or `.mdx` files in your `src/pages` directory:

```markdown
---
title: "Sample Page with Definition Lists"
layout: "../layouts/Layout.astro"
---

# Advanced Definition Lists

Main Term
: This is the definition of the main term
: This is another definition paragraph

Nested Term
: Primary definition
  - Nested list item 1
  - Nested list item 2
: Secondary definition with **bold text**
```

## 💻 Advanced Usage

### Custom Markdown Processing

For advanced use cases, you can process markdown programmatically:

```javascript
//: src/utils/markdown.js
import { remark } from "remark";
import html from "remark-html";
import deflist from "@verikami/remark-deflist-revisited";

export async function processMarkdown(content) {
  const result = await remark()
    .use(deflist)
    .use(html)
    .process(content);
  
  return result.toString();
}
```

### Using in Astro Components

```astro
---
//: src/components/MarkdownContent.astro
import { processMarkdown } from "../utils/markdown.js";

const markdownContent = `
# Dynamic Content

Dynamic Term
: This content is processed at build time
: Supports **formatting** and nested lists
`;

const htmlContent = await processMarkdown(markdownContent);
---

<div set:html={htmlContent} />
```

## 🛠️ Development

### Local Development

```bash
## Start development server
ツ npm run dev

## Build for production
ツ npm run build

## Preview production build
ツ npm run preview
```

### Custom Styling

Add custom styles to your layout component:

```astro
---
//: src/layouts/Layout.astro
---
<html lang="en">
  <head>
    <style>
      /* Custom definition list styles */
      dl {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        margin: 2rem 0;
      }
      dt {
        font-weight: bold;
        color: white;
        margin-bottom: 0.5rem;
      }
      dd {
        margin-left: 2rem;
        color: #f0f0f0;
        margin-bottom: 0.5rem;
      }
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### TypeScript Support

For TypeScript projects, add type definitions:

```typescript
//: src/types/remark-deflist-revisited.d.ts
declare module "@verikami/remark-deflist-revisited" {
  import { Plugin } from "unified";
  const deflist: Plugin;
  export default deflist;
}
```

## 🎯 Comparison with Other Implementations

| Feature | Astro Integration | Express.js | Cloudflare Worker |
|---------|-------------------|------------|-------------------|
| **Rendering** | SSG/SSR | Server-side | Edge |
| **Build Time** | Pre-built at deploy | Runtime | Runtime |
| **Performance** | Excellent (static) | Good | Excellent (edge) |
| **Complexity** | Low | Medium | Low |
| **Use Case** | Documentation sites | Dynamic apps | API endpoints |

## 📁 Project Structure

```
.
├── src/
│   ├── components/          # Astro/React/Vue components
│   ├── layouts/             # Layout components
│   │   └── Layout.astro     # Main layout
│   └── pages/               # Markdown/MDX pages
│       ├── index.astro      # Home page
│       └── demo.md          # Demo page with definition lists
├── public/                  # Static assets
├── astro.config.mjs         # Astro configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 📦 Dependencies

### Core Dependencies

- `astro` → Modern static site generator
- `@verikami/remark-deflist-revisited` → Enhanced definition lists

### Optional Dependencies

- `@astrojs/mdx` → MDX support
- `@astrojs/react` → React component support
- `@astrojs/vue` → Vue component support

## 🌟 Benefits for Astro Projects

- **Performance**: Leverages Astro's island architecture
- **SEO Friendly**: Pre-rendered content for better search visibility
- **Developer Experience**: Hot reload and excellent tooling
- **Flexibility**: Combine with React, Vue, Svelte components
- **Zero JS**: Outputs minimal JavaScript by default

## 📄 License

This project is Open Source and available under the MIT License.  
2025 © MIT °// [veriKami] °// [Weronika Kami]

[veriKami]: https://verikami.com
[Weronika Kami]: https://linkedin.com/in/verikami

[module]: https://github.com/veriKami/remark-deflist-revisited
[Simple]: https://github.com/veriKami/remark-deflist-revisited-simple
[Express.js]: https://github.com/veriKami/remark-deflist-revisited-express
[Cloudflare Worker]: https://github.com/veriKami/remark-deflist-revisited-worker

[GH]: https://github.com/veriKami/remark-deflist-revisited
[GH Badge]: https://img.shields.io/badge/GitHub-Repository-blue?logo=github

[Remark]: https://remark.js.org
[Astro]: https://astro.build

[NPM]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited
[NPM Badge]: https://img.shields.io/npm/v/@verikami/remark-deflist-revisited?logo=npm&logoColor=white&labelColor=red&color=black

[JSR]: https://jsr.io/@verikami/remark-deflist-revisited
[JSR Badge]: https://jsr.io/badges/@verikami/remark-deflist-revisited

[Downloads]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited
[Downloads Badge]: https://img.shields.io/npm/dm/@verikami/remark-deflist-revisited.svg

[Socket]: https://socket.dev/npm/package/@verikami/remark-deflist-revisited
[Socket Badge]: https://badge.socket.dev/npm/package/@verikami/remark-deflist-revisited
