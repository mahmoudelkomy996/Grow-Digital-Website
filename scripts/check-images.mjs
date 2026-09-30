#!/usr/bin/env node
// Asserts that every IMAGES[*].src in src/content/images.ts exists under public/
// and is at least MIN_WIDTH pixels wide. Exits 1 on any failure.
// Usage: node scripts/check-images.mjs
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MIN_WIDTH = 1600;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await readFile(join(root, "src/content/images.ts"), "utf8");

// Every spec("<src>", ...) call; src paths are absolute and start with /images/.
const srcs = [...new Set([...manifest.matchAll(/spec\(\s*"(\/images\/[^"]+)"/g)].map((m) => m[1]))];

if (srcs.length === 0) {
  console.error("check-images: no image paths found in src/content/images.ts");
  process.exit(1);
}

const failures = [];
for (const src of srcs) {
  const file = join(root, "public", src);
  try {
    await stat(file);
  } catch {
    failures.push(`${src}: missing`);
    continue;
  }
  try {
    const { width, height } = await sharp(file).metadata();
    if (!width || width < MIN_WIDTH) failures.push(`${src}: ${width}px wide (< ${MIN_WIDTH}px)`);
    else console.log(`ok   ${src} ${width}x${height}`);
  } catch (err) {
    failures.push(`${src}: unreadable (${err.message})`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} of ${srcs.length} images failed:`);
  for (const f of failures) console.error(`FAIL ${f}`);
  process.exit(1);
}
console.log(`\nAll ${srcs.length} images present and >= ${MIN_WIDTH}px wide.`);
