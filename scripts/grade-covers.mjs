// Applies the brand colour grade (teal shadows, warm cream highlights, softened saturation) to every blog
// cover so the listing reads as one set. Originals live in assets-src/blog-covers/; output → public/blog/.
// Run: node scripts/grade-covers.mjs [--only=slug1,slug2]
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const SRC = "assets-src/blog-covers";
const OUT = "public/blog";
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

// Gradient map: luminance → colour between teal-950 (shadows), teal-600 (mids) and paper (highlights).
const stops = [
  [0, [4, 31, 31]],
  [0.45, [28, 114, 110]],
  [1, [246, 245, 240]],
];
const lerp = (a, b, t) => a + (b - a) * t;
function mapLum(l) {
  for (let i = 1; i < stops.length; i++) {
    const [p1, c1] = stops[i];
    const [p0, c0] = stops[i - 1];
    if (l <= p1) {
      const t = (l - p0) / (p1 - p0);
      return c0.map((c, k) => lerp(c, c1[k], t));
    }
  }
  return stops[stops.length - 1][1];
}

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".jpg"))) {
  if (only && !only.includes(file.replace(/\.jpg$/, ""))) continue;
  const img = sharp(join(SRC, file)).resize({ width: 1600, withoutEnlargement: true }).removeAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const [mr, mg, mb] = mapLum(l);
    // 70% gradient map + 30% original keeps photos legible while unifying the palette
    out[i] = lerp(r, mr, 0.7);
    out[i + 1] = lerp(g, mg, 0.7);
    out[i + 2] = lerp(b, mb, 0.7);
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(OUT, file));
}
console.log("graded covers written to", OUT);
