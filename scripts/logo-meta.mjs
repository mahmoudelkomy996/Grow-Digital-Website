// Measures every logo in public/logos (size + opaque coverage) into src/content/logo-meta.json.
// LogoTile uses it to balance optical size and to keep solid "badge" logos legible.
// Run: node scripts/logo-meta.mjs
import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "public/logos";
const meta = {};
for (const group of readdirSync(root)) {
  for (const file of readdirSync(join(root, group))) {
    if (!file.endsWith(".png")) continue;
    const img = sharp(join(root, group, file));
    const { width, height } = await img.metadata();
    const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let opaque = 0;
    for (let i = 3; i < data.length; i += info.channels) if (data[i] > 128) opaque++;
    meta[`/logos/${group}/${file}`] = { w: width, h: height, coverage: +(opaque / (info.width * info.height)).toFixed(3) };
  }
}
writeFileSync("src/content/logo-meta.json", JSON.stringify(meta, null, 2) + "\n");
console.log(Object.keys(meta).length, "logos measured");
console.log(Object.entries(meta).filter(([, m]) => m.coverage > 0.4).map(([k, m]) => `${k} ${m.coverage}`).join("\n"));
