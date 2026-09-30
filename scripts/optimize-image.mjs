#!/usr/bin/env node
// Convert a generated image into a web-ready JPEG for public/images.
// Usage: node scripts/optimize-image.mjs <in> <out>
// JPEG quality 82 (mozjpeg), max width 2400px, never upscaled, sRGB, metadata stripped.
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error("Usage: node scripts/optimize-image.mjs <in> <out>");
  process.exit(1);
}

await mkdir(dirname(output), { recursive: true });
const info = await sharp(input)
  .rotate()
  .resize({ width: 2400, withoutEnlargement: true })
  .toColourspace("srgb")
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(output);

console.log(`${output}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB`);
