//: vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      "tests/**/*.src.{test,spec}.?(c|m)[jt]s?(x)",
      "tests/**/*.dist.{test,spec}.?(c|m)[jt]s?(x)",
    ],
    reporters: "verbose",
    //: @ codesandbox
    environment: "node",
    globals: true,
    define: {
      "import.meta.vitest": "undefined"
    },
    transformMode: {
      web: [/\.[jt]sx?$/]
    },
    //: @ codesandbox
    coverage: {
      // enabled: true,
      include: [
        // "dist/index.js",
        "src/index.ts",
      ],
      exclude: [
        "**/*.d.ts",
      ],
    },
  },
});
