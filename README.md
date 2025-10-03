# Remark Deflist Revisited °// Express.js Example

[![GH][GH Badge]][GH]
[![NPM][NPM Badge]][NPM]
[![JSR][JSR Badge]][JSR]
[![Downloads][Downloads Badge]][Downloads]
[![Socket][Socket Badge]][Socket]

Node.js implementation of the **`@verikami/remark-deflist-revisited`** module, demonstrating enhanced definition lists processing in markdown with full HTML output.

**[Remark Deflist Revisited][module]** is a **[Remark]** plugin. A wrapper around **`remark-deflist`** with improved support for nested definition lists. It preserves all the original functionality and performs additional processing. 

## Overview

This project provides a Express.js equivalent of the **[Cloudflare Worker][+:worker]** example, showcasing how to use **`remark-deflist-revisited`** in a Node.js environment with **[Express.js]** server and modular processing capabilities. **[Astro][+:astro]** and **[Simple][+:simple]** example is also available.

## Features

- **Full Markdown Processing**: Convert markdown with definition lists to HTML
- **Enhanced Definition Lists**: Support for complex nested structures
- **Express.js Server**: RESTful API endpoints for markdown processing
- **Modular Design**: Reusable processor class for integration into other projects
- **Beautiful Styling**: Professional CSS styling with gradient background
- **Error Handling**: Comprehensive error handling and validation

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm, pnpm or yarn

### Installation

```bash
## Clone or download this project
ツ git clone git@github.com:veriKami/remark-deflist-revisited-express.git

## Install dependencies
ツ npm install
```

### Running the Server

```bash
## Start the development server
ツ npm start

## Or run with watch mode
ツ npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### GET `/`
- **Description**: Returns a demo page with pre-processed markdown
- **Response**: HTML page with styled content

### POST `/process`
- **Description**: Process custom markdown and return full HTML page
- **Body**: `{ "markdown": "Your markdown content here" }`
- **Response**: Complete HTML page with styling

### POST `/api/process`
- **Description**: Process custom markdown and return JSON response
- **Body**: `{ "markdown": "Your markdown content here" }`
- **Response**: `{ "html": "<p>Processed HTML</p>", "processed": true }`

## Usage Examples

### Using the Express Server

```bash
## Demo page
ツ curl http://localhost:3000

## Process custom markdown (returns HTML)
ツ curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Title\n\nTerm\n: Definition"}'

## Process custom markdown (returns JSON)
ツ curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Title\n\nTerm\n: Definition"}'
```

### Using the Module Directly

```javascript
import { MarkdownProcessor } from './lib/markdown.processor.js';

const processor = new MarkdownProcessor();

//: Process to plain HTML
//: -----------------------------------------
const html = await processor.process(`
# Example

Cloudflare Workers
: Serverless platform
: Runs on the edge
`);

//: Process to full HTML page
//: -----------------------------------------
const page = await processor.processToHTML(`
# Example Page

Node.js
: JavaScript runtime
: Event-driven architecture
`, {
  title: 'My Custom Title',
  includeStyles: true
});
```

## Project Structure

```
.
├── lib/markdown.processor.js  # Modular markdown processor class
├── server.js                  # Express.js server implementation
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Dependencies

### Production Dependencies

- `@verikami/remark-deflist-revisited` → Enhanced definition lists for remark
- `express` → Web server framework
- `remark` → Markdown processor
- `remark-html` → HTML serializer for remark
- `dedent` → Dedent template strings

## Comparison with Other Implementations

| Feature         | Express.js   | Astro Integration   | Cloudflare Worker |
|-----------------|--------------|---------------------|-------------------|
| **Rendering**   | Server-side  | SSG/SSR             | Edge              |
| **Build Time**  | Runtime      | Pre-built at deploy | Runtime           |
| **Performance** | Good         | Excellent (static)  | Excellent (edge)  |
| **Complexity**  | Medium       | Low                 | Low               |
| **Use Case**    | Dynamic apps | Documentation sites | API endpoints     |


## Development

### Adding New Features

1. Extend the `MarkdownProcessor` class with new methods
2. Add new routes to `server.js`
3. Update error handling as needed

### Custom Styling

Modify the `getStyles()` method in `markdown.processor.js` to customize the appearance:

```javascript
getStyles() {
  return `
    <style>
      /* Your custom CSS here */
    </style>
  `;
}
```

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

[GH]: https://github.com/veriKami/remark-deflist-revisited
[GH Badge]: https://img.shields.io/badge/GitHub-Repository-blue?logo=github

[Remark]: https://remark.js.org
[Express.js]: https://expressjs.com

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
