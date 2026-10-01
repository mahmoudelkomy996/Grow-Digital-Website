#!/usr/bin/env node
/**
 * Builds the app icons from the wordmark mask (public/brand/logo-mask.png):
 * the first "g" of "grow digital", with its smile-arc descender, in paper #F6F5F0
 * centred on teal #083B3B.
 *
 *   src/app/icon.png        512x512, rounded square (radius 22%), transparent corners
 *   src/app/apple-icon.png  180x180, full-bleed square (iOS applies its own mask;
 *                           transparent corners would turn black on the home screen)
 *
 *   node scripts/make-icons.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MASK = path.join(ROOT, "public", "brand", "logo-mask.png");

const TEAL = "#083B3B";
const PAPER = { r: 0xf6, g: 0xf5, b: 0xf0 };

/**
 * Bounds of the first "g" in the 1625x318 mask (measured with connected components):
 * the letter body is x 6–217, y 77–231 (including its ear) and the smile arc is x 17–157,
 * y 240–312. The "r" starts at x 220, so the crop stops at x 219. 2px margin for anti-aliasing.
 */
const G_BOX = { left: 4, top: 75, width: 216, height: 240 };

/** Glyph height as a share of the icon size. */
const GLYPH_H = 0.64;

/**
 * Optical centring: the ear pulls the bounding box right of the letter mass (ink centroid
 * x 90.4 vs box centre 107.5 in G_BOX pixels), so the glyph is nudged right by half of that gap.
 */
const OPTICAL_DX = (107.5 - 90.4) / 2 / G_BOX.height;

async function glyphAlpha(targetH) {
  const scale = targetH / G_BOX.height;
  const alpha = await sharp(MASK).extract(G_BOX).extractChannel("alpha").raw().toBuffer();
  const { data, info } = await sharp(alpha, { raw: { width: G_BOX.width, height: G_BOX.height, channels: 1 } })
    .resize({ height: targetH, kernel: "lanczos3" })
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Upscaling widens the anti-aliased edge; restore a ~1px edge with a contrast curve around 50% coverage.
  if (scale > 1) for (let i = 0; i < data.length; i++) data[i] = Math.max(0, Math.min(255, Math.round((data[i] - 128) * scale + 128)));
  return { data, width: info.width, height: info.height };
}

async function makeIcon({ size, radius, file }) {
  const g = await glyphAlpha(Math.round(size * GLYPH_H));
  const rgba = Buffer.alloc(g.width * g.height * 4);
  for (let i = 0; i < g.width * g.height; i++) {
    rgba[i * 4] = PAPER.r;
    rgba[i * 4 + 1] = PAPER.g;
    rgba[i * 4 + 2] = PAPER.b;
    rgba[i * 4 + 3] = g.data[i];
  }
  const glyph = await sharp(rgba, { raw: { width: g.width, height: g.height, channels: 4 } }).png().toBuffer();
  const r = Math.round(size * radius);
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${TEAL}"/></svg>`,
  );
  await sharp(plate)
    .composite([{ input: glyph, left: Math.round((size - g.width) / 2 + OPTICAL_DX * g.height), top: Math.round((size - g.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log(`${path.relative(ROOT, file).replaceAll("\\", "/")}  ${size}x${size}, glyph ${g.width}x${g.height}`);
}

await makeIcon({ size: 512, radius: 0.22, file: path.join(ROOT, "src", "app", "icon.png") });
await makeIcon({ size: 180, radius: 0, file: path.join(ROOT, "src", "app", "apple-icon.png") });
