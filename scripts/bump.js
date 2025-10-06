#!/usr/bin/env node
//: --------------------------------------------------------
//: scripts/bump.js
//: --------------------------------------------------------
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

//: --------------------------------------------------------
//: FULL (major|minor|patch) + dry run
//: --------------------------------------------------------

const args = process.argv.slice(2);

const dryRun = args.includes("--dry-run");
const noPush = args.includes("--no-push");
const bpType = args.find(a => !a.startsWith("--")) || "patch";

console.log(`→ Bumping version (${bpType})${
    dryRun ? " --dry-run" : ""
  }${
    noPush ? " --no-push" : ""
  }`);

//: show changes
//: -----------------------------------------
if (dryRun) {
  const v = JSON.parse(readFileSync("package.json", "utf8")).version;
  const n = v.split(".");
  if (bpType === "major") { n[0]++; n[1] = 0; n[2] = 0 };
  if (bpType === "minor") { n[1]++; n[2] = 0; }
  if (bpType === "patch") { n[2]++; }
  console.log(`→ version ${v} -> ${n.join(".")}`);
  process.exit(0);
}

//: edit package.json
//: -----------------------------------------
execSync(`pnpm version ${bpType} --no-git-tag-version`, { stdio: "inherit" });

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const jsr = JSON.parse(readFileSync("jsr.json", "utf8"));

const v = jsr.version = pkg.version;

//: edit jsr.json
//: -----------------------------------------
writeFileSync("jsr.json", JSON.stringify(jsr, null, 2) + "\n");

//: commit + tag
//: -----------------------------------------
execSync("git add package.json jsr.json", { stdio: "inherit" });
execSync(`git commit -m "v${v}"`, { stdio: "inherit" });
execSync(`git tag v${v}`, { stdio: "inherit" });

//: push if not --no-push
//: -----------------------------------------
if (noPush) {
  console.log(`✓ Release v${v} prepared locally (no push)`);
} else {
  execSync("git push origin HEAD", { stdio: "inherit" });
  execSync(`git push origin v${v}`, { stdio: "inherit" });
  console.log(`✓ Release v${v} pushed`);
}

/*/// :><: toggle :>
//: --------------------------------------------------------
//: BASIC (patch)
//: --------------------------------------------------------

execSync("pnpm version patch --no-git-tag-version", { stdio: "inherit" });

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const jsr = JSON.parse(readFileSync("jsr.json", "utf8"));

const v = jsr.version = pkg.version;

writeFileSync("jsr.json", JSON.stringify(jsr, null, 2) + "\n");

execSync(`git add package.json jsr.json`, { stdio: "inherit" });
execSync(`git commit -m "chore: bump version to v${v}"`, { stdio: "inherit" });
execSync(`git tag v${v}`, { stdio: "inherit" });
execSync(`git push && git push --tags`, { stdio: "inherit" });

console.log(`✓ Release v${v} pushed`);

//*/// :><: toggle :>
//: --------------------------------------------------------
