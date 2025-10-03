//: astro.config.mjs
//: -----------------------------------------
import { defineConfig } from "astro/config";
import remarkDeflistRevisited from "@verikami/remark-deflist-revisited";

export default defineConfig({
  compressHTML: false,
  markdown: {
    remarkPlugins: [
      remarkDeflistRevisited
    ]
  }
});
