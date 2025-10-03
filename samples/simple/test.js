//: test.js
//: -----------------------------------------
import { processMarkdown } from "./index.js";

const markdown = `
# Test Definition Lists

Term A
: Definition A1
: Definition A2

Term B
: Single definition
`;

//: MAIN
//: -----------------------------------------
async function runTests() {
  console.log("👄 Running tests");
  
  try {
    const result = await processMarkdown(markdown);

    const tests = {
      "Contains Term A": result.includes("Term A"),
      "Contains Definition A1": result.includes("Definition A1"),
      "Contains Term B": result.includes("Term B"),
      "Is valid HTML": result.startsWith("<h1>") && result.includes("</dl>")
    };
    
    console.log("👄 Test results:\n");

    Object.entries(tests).forEach(([test, passed]) => {
      console.log(`${passed ? "✅" : "❌"} ${test}`);
    });
    
    console.log(`\n🌐 HTML output length: ${result.length} characters`);
    
  }
  catch (err) {
    console.error("💥 Test failed:", err.message);
  }
}

runTests();
