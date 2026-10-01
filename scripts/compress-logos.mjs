// Re-encodes every logo in public/logos as a small palette PNG (alpha kept), sized to the largest height
// LogoTile ever renders it at (its optical-size formula × 2.25 for retina, max 1.5× scale headroom).
// Logos are also used as CSS masks, which are always fetched, so bytes matter.
// Run: node scripts/compress-logos.mjs && node scripts/logo-meta.mjs
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const meta = JSON.parse(readFileSync("src/content/logo-meta.json", "utf8"));
const root = "public/logos";
let before = 0, after = 0;
for (const group of readdirSync(root)) {
  for (const file of readdirSync(join(root, group))) {
    if (!file.endsWith(".png")) continue;
    const path = join(root, group, file);
    const input = readFileSync(path);
    before += input.length;
    const m = meta[`/logos/${group}/${file}`];
    const aspect = m ? m.w / m.h : 3;
    const thin = 1 + Math.max(0, 0.24 - (m?.coverage ?? 0.24)) * 1.8;
    const rem = Math.min(4.4, Math.max(1.7, 3.8 / Math.sqrt(aspect)) * thin);
    const height = Math.ceil(rem * 16 * 2.25 * 1.25); // retina + headroom for item.scale / larger tiles
    const out = await sharp(input)
      .resize({ height, withoutEnlargement: true })
      .png({ palette: true, colours: 64, dither: 0, effort: 10, compressionLevel: 9 })
      .toBuffer();
    writeFileSync(path, out);
    after += out.length;
  }
}
console.log(`logos: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB`);
