//: https://vitest.dev/config
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    //: Default: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
    include: [
      "tests/**/*.src.{test,spec}.?(c|m)[jt]s?(x)",
      "tests/**/*.dist.{test,spec}.?(c|m)[jt]s?(x)",
    ],
    reporters: "verbose",
  },
});
