//: markdown.processor.js
//: -----------------------------------------
import { remark } from "remark";
import html from "remark-html";
import dedent from "dedent";
import deflist from "@verikami/remark-deflist-revisited";

//: Main class
//: -----------------------------------------
export class MarkdownProcessor {
  constructor() {
    this.processor = remark().use(deflist).use(html);
  }

  async process(markdown) {
    const result = await this.processor.process(markdown);
    return String(result);
  }

  async processToHTML(markdown, options = {}) {
    const { title = "Markdown Processor", includeStyles = true } = options;
    
    const content = await this.process(markdown);
    
    return dedent`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          ${includeStyles ? this.getStyles() : ""}
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
      </html>
    `;
  }

  getStyles() {
    return dedent`
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          line-height: 1.6;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #333;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 { color: #667eea; margin-top: 0; }
        dl { margin: 20px 0; }
        dt {
          font-weight: bold;
          margin: 20px 0 0;
          color: #667eea;
          font-size: 1.1em;
        }
        dd {
          margin: 5px 0 0 40px;
          color: #666;
        }
        ul { margin: 0 10px; }
        li { margin: 0; }
      </style>
    `;
  }
}

//: Sample markdown to process
//: -----------------------------------------
const markdown = dedent`
  # Example Markdown

  Node.js Module
  : Easy to use
  : Compatible with remark ecosystem
`;

//: Module Usage
//: -----------------------------------------
const processor = new MarkdownProcessor();

//: Przetwarzanie do czystego HTML
//: -----------------------------------------
processor.process(markdown).then(html => {
  console.log("HTML output:", html);
});

//: Processing to a full HTML page
//: -----------------------------------------
processor.processToHTML(markdown, { 
  title: "My Processed Markdown" 
}).then(fullHtml => {
  console.log("Full HTML page:", fullHtml);
});

//: EXPORT
//: -----------------------------------------
export default MarkdownProcessor;
