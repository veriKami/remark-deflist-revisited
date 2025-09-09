//: https://vitest.dev/config
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    //: Default: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
    include: ["tests/**/*.{test,spec}.?(c|m)[jt]s?(x)"]
  },
});
