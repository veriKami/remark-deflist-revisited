//: example.js
//: -----------------------------------------
import { processMarkdown, createHTMLPage } from "./index.js";

const markdown = `
# Custom Example

API Endpoint
: /api/v1/users
: Methods: GET, POST, PUT

Response Format
: JSON
: Includes status and data fields
`;

//: MAIN
//: -----------------------------------------
async function runExample() {
  const content = await processMarkdown(markdown);
  const page = createHTMLPage(content, "API Documentation");

  console.log("👄 Generated HTML:\n");
  console.log("\x1b[33m%s\x1b[0m", content);
  console.log("🌐 Page length:", page.length);
}

runExample();
