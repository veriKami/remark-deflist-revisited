# Remark Deflist Revisited °// Cloudflare Worker Example

[![GH][GH Badge]][GH]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]
[![Downloads][Downloads Badge]][Downloads]
[![Socket][Socket Badge]][Socket]

Cloudflare Worker implementation of the **`@verikami/remark-deflist-revisited`** module, demonstrating enhanced definition lists processing in markdown with full HTML output on the edge.

**[Remark Deflist Revisited][module]** is a **[Remark]** plugin. A wrapper around **`remark-deflist`** with improved support for nested definition lists. It preserves all the original functionality and performs additional processing. 

## Overview

This project provides a Cloudflare Worker example showcasing how to use **`remark-deflist-revisited`** in serverless edge environment. **[Express.js][+:express]**, **[Astro][+:astro]** and **[Simple][+:simple]** examples are also available.

## Features

- **Enhanced Definition Lists**: Support for complex nested structures
- **Serverless Architecture**: No server management, automatic scaling
- **Fast Cold Starts**: Optimized for edge computing
- **Beautiful Styling**: Professional CSS styling with gradient background
- **Error Handling**: Comprehensive error handling and validation

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm, pnpm or yarn
- Cloudflare account
- Wrangler CLI

### Installation

```bash
## Clone or download this project
ツ git clone git@github.com:veriKami/remark-deflist-revisited-worker.git

## Install dependencies
ツ npm install
```

### Local Development

```bash
## Start local development server
ツ npm run dev

## Deploy to Cloudflare Workers
ツ npm run deploy
```

The worker will be available at your Cloudflare Workers URL.

## API Endpoint

### GET `/`

- **Edge Location**: Processes markdown closest to the user
- **Description**: Returns a demo page with pre-processed markdown
- **Response**: HTML page with styled content

## Usage Examples

### Accessing the Worker

```bash
## Access your deployed worker
ツ curl https://your-worker.your-subdomain.workers.dev

## Test locally
ツ curl http://localhost:8787
```

### Worker Code Structure

```javascript
export default {
  async fetch(request, env, ctx) {
    const markdown = `
      # Example
      
      Cloudflare Workers
      : Serverless platform
      : Runs on the edge
    `;

    const output = await remark()
      .use(deflist)
      .use(html)
      .process(markdown);

    return new Response(htmlResponse, {
      headers: { "Content-Type": "text/html" }
    });
  }
}
```

## Project Structure

```
.
├── src/
│   └── index.js          # Cloudflare Worker handler
├── package.json          # Dependencies and scripts
├── wrangler.toml         # Worker configuration
└── README.md             # This file
```

## Dependencies

### Production Dependencies

- `@verikami/remark-deflist-revisited` → Enhanced definition lists for remark
- `remark` → Markdown processor
- `remark-html` → HTML serializer for remark
- `dedent` → Dedent template strings

### Development Dependencies

- `wrangler` → Cloudflare Workers CLI

## Comparison with Other Implementations

| Feature         | Express.js   | Astro Integration   | Cloudflare Worker |
|-----------------|--------------|---------------------|-------------------|
| **Rendering**   | Server-side  | SSG/SSR             | Edge              |
| **Build Time**  | Runtime      | Pre-built at deploy | Runtime           |
| **Performance** | Good         | Excellent (static)  | Excellent (edge)  |
| **Complexity**  | Medium       | Low                 | Low               |
| **Use Case**    | Dynamic apps | Documentation sites | API endpoints     |

## Development

### Local Testing

```bash
## Develop locally with Wrangler
ツ npx wrangler dev

## Deploy to production
ツ npx wrangler deploy
```

### Customizing Markdown Content

Edit the `markdown` variable in `src/index.js`:

```javascript
const markdown = `
  # Your Custom Title
  
  Your Term
  : Your definition here
  : - Nested item 1
    - Nested item 2
`;
```

### Custom Styling

Modify the CSS in the HTML template:

```javascript
const htmlResponse = `
  <style>
    /* Your custom CSS here */
    body { 
      background: your-gradient; 
      font-family: your-font;
    }
  </style>
  ...
`;
```

## Edge Computing Benefits

- **Reduced Latency**: Process markdown closer to users
- **High Availability**: Automatic failover between locations
- **Zero Maintenance**: No server management required
- **Cost Effective**: Pay only for what you use

## License

This project is Open Source and available under the MIT License  
2025 © MIT °// [veriKami] °// [Weronika Kami]

[veriKami]: https://verikami.com
[Weronika Kami]: https://linkedin.com/in/verikami

[module]: https://github.com/veriKami/remark-deflist-revisited
[+:simple]: https://github.com/veriKami/remark-deflist-revisited-simple
[+:express]: https://github.com/veriKami/remark-deflist-revisited-express
[+:worker]: https://github.com/veriKami/remark-deflist-revisited-worker
[+:astro]: https://github.com/veriKami/remark-deflist-revisited-astro

[Remark]: https://remark.js.org
[Astro]: https://astro.build

[GH Badge]: https://img.shields.io/badge/GitHub-Repository-blue?logo=github
[GH]: https://github.com/veriKami/remark-deflist-revisited

[NPM Badge]: https://img.shields.io/npm/v/@verikami/remark-deflist-revisited?logo=npm&logoColor=white&labelColor=red&color=black
[NPM]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited

[JSR Badge]: https://jsr.io/badges/@verikami/remark-deflist-revisited
[JSR]: https://jsr.io/@verikami/remark-deflist-revisited

[Downloads Badge]: https://img.shields.io/npm/dm/@verikami/remark-deflist-revisited.svg
[Downloads]: https://www.npmjs.com/package/@verikami/remark-deflist-revisited

[Socket Badge]: https://badge.socket.dev/npm/package/@verikami/remark-deflist-revisited
[Socket]: https://socket.dev/npm/package/@verikami/remark-deflist-revisited
