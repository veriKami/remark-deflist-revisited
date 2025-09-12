//: esbuild.config.js
import { build } from "esbuild";

build({
  entryPoints: ["src/index.js"],
  bundle: true, //: BUNDLE dependencies
  outfile: "dist/index.js",
  platform: "node",
  format: "esm"
});
