#!/usr/bin/env node
/**
 * Extracts partner, client, key-project and reference logos from the pitch-deck
 * media and writes clean, transparent, 160px-tall PNGs to
 * public/logos/<group>/<slug>.png (see "Logo path convention" in the plan).
 *
 *   node scripts/extract-logos.mjs                    # every logo
 *   node scripts/extract-logos.mjs --only uno,lego    # a subset (by slug)
 *   node scripts/extract-logos.mjs --sheet <dir>      # also write QA contact sheets on #888
 *   node scripts/extract-logos.mjs --media <dir>      # deck media folder (default: $DECK_MEDIA)
 *
 * The deck media folder is `ppt/media` of the unzipped Grow Digital pitch deck.
 *
 * Keying modes (per part):
 *   alpha  source is already a transparent PNG: crop only
 *   key    colour-to-alpha against a key colour (white page, navy tile, black tile…)
 *          with colour decontamination: solid ink keeps its colour, anti-aliased edge
 *          pixels take the colour of the nearest solid ink and an alpha equal to their
 *          coverage, so there is no light or dark halo on any background
 *   flood  like `key`, but only the key-coloured region connected to the crop border
 *          is removed; used for solid badges whose inner whites are part of the mark
 *   light  white mark on a textured photo tile: alpha from the darkest channel, only
 *          for connected shapes that contain real white ink (drops the photo texture)
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "logos");

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const MEDIA =
  arg("--media") ??
  process.env.DECK_MEDIA ??
  "C:/Users/mahmo/AppData/Local/Temp/claude/D--Grow-Digital-Grow-Digital-Website-V2/70414de0-173b-4fe0-bbfb-1d8a3d88f645/scratchpad/deck/x/ppt/media";
const ONLY = arg("--only")?.split(",").map((s) => s.trim());
const SHEET_DIR = arg("--sheet");

/** Output geometry: 160px tall = content 148px + 4% padding (6px) top and bottom. */
const OUT_H = 160;
const PAD_Y = Math.round((OUT_H / 1.08) * 0.04);
const CONTENT_H = OUT_H - 2 * PAD_Y;

const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];

/* ------------------------------------------------------------------------ */
/* Logo definitions. Boxes are [left, top, right, bottom) in source pixels.   */
/* ------------------------------------------------------------------------ */

/** @typedef {{ box: number[], mode?: "alpha"|"key"|"flood"|"light", key?: number[]|"auto", t0?: number, t1?: number, dist?: (r:number,g:number,b:number,k:number[])=>number, mono?: number[], erase?: number[][] }} Part */
/** @typedef {{ group: string, slug: string, src: string, parts?: Part[], minSpeck?: number } & Part} Logo */

/** Blue-ness above the key: separates blue ink from a grey plate and grey scan artefacts. */
const blueness = (r, g, b, k) => Math.max(0, b - r - (k[2] - k[0]));

/** @type {Logo[]} */
const LOGOS = [
  // Partners (slide 39) — image61.png
  { group: "partners", slug: "inveon", src: "image61.png", box: [26, 20, 514, 112] },
  { group: "partners", slug: "mobilgi", src: "image61.png", box: [893, 4, 1256, 162], mode: "key", key: "auto", t0: 16, t1: 120 },
  { group: "partners", slug: "maestrohub", src: "image61.png", box: [8, 192, 470, 344], mode: "light", maskMin: 120 },
  { group: "partners", slug: "skysens", src: "image61.png", box: [893, 189, 1256, 346], mode: "key", key: BLACK, t0: 16, t1: 150 },

  // Clients (slide 32) — image52.png, already transparent
  { group: "clients", slug: "riyadh-hospital", src: "image52.png", box: [11, 62, 221, 117] },
  { group: "clients", slug: "tmc-health", src: "image52.png", box: [277, 7, 410, 163] },
  { group: "clients", slug: "bupa-careconnect", src: "image52.png", box: [442, 30, 814, 141] },
  // The English line under the Alfagih mark is clipped in the deck and the Arabic line is
  // illegible at deck resolution; keep the framed FH mark only.
  { group: "clients", slug: "alfagih-hospital", src: "image52.png", box: [879, 4, 1056, 131] },
  { group: "clients", slug: "bin-taleb", src: "image52.png", box: [58, 218, 172, 334] },
  { group: "clients", slug: "wlmma", src: "image52.png", box: [299, 205, 428, 356] },
  { group: "clients", slug: "prime-scent", src: "image52.png", box: [540, 249, 716, 301] },
  { group: "clients", slug: "anaqeed", src: "image52.png", box: [819, 204, 950, 346] },
  { group: "clients", slug: "bazarluks", src: "image52.png", box: [1010, 256, 1151, 299] },
  { group: "clients", slug: "uno", src: "image52.png", box: [1192, 217, 1350, 341] },
  // The English line of the NCM lockup is clipped left and right in the deck; keep emblem + Arabic name.
  { group: "clients", slug: "ncm", src: "image52.png", box: [8, 385, 222, 517] },
  { group: "clients", slug: "riyadh-municipality", src: "image52.png", box: [273, 391, 512, 556] },
  { group: "clients", slug: "aqarverse", src: "image52.png", box: [41, 572, 157, 734] },
  { group: "clients", slug: "marco", src: "image52.png", box: [291, 628, 447, 701] },

  // Key projects (slide 38) — image59.png, white plates on a dark slide: crop inside each plate, key the plate.
  {
    group: "projects", slug: "ecb", src: "image59.png",
    parts: [
      { box: [144, 27, 240, 109], mode: "key", key: WHITE, t0: 44, t1: 200 },
      { box: [38, 118, 350, 139], mode: "key", key: [224, 224, 224], dist: blueness, t0: 18, t1: 70 },
    ],
  },
  {
    group: "projects", slug: "deutsche-bank", src: "image59.png",
    parts: [
      { box: [39, 208, 296, 253], mode: "key", key: "auto", t0: 24, t1: 180 },
      { box: [298, 190, 360, 251], mode: "key", key: "auto", t0: 24, t1: 180 },
    ],
  },
  { group: "projects", slug: "db-netz", src: "image59.png", box: [30, 341, 341, 463], mode: "key", key: "auto", t0: 24, t1: 150 },
  { group: "projects", slug: "saudia", src: "image59.png", box: [30, 517, 341, 621], mode: "key", key: "auto", t0: 16, t1: 150, tl: 80 },
  {
    group: "projects", slug: "european-commission", src: "image59.png",
    parts: [
      // Flag + building: keep the core high so the flag has no light rim.
      { box: [19, 678, 208, 768], mode: "key", key: WHITE, t0: 12, t1: 150, tl: 60 },
      // Grey wordmark: a lower core so the whole stroke is treated as ink.
      { box: [208, 678, 341, 768], mode: "key", key: WHITE, t0: 12, t1: 90, tl: 60 },
    ],
  },

  // IoT references (slide 21) — one file each, already transparent (IGA sits on a white frame)
  // Advantech: square off the badge (the deck file has a dark, chamfered top-left corner).
  { group: "references", slug: "advantech", src: "image31.png", box: [33, 28, 310, 82], fillHoles: WHITE, paint: [[33, 28, 42, 31, [0, 67, 128]]] },
  { group: "references", slug: "arup", src: "image32.png" },
  { group: "references", slug: "vestel", src: "image33.png" },
  { group: "references", slug: "bridgestone", src: "image34.png" },
  { group: "references", slug: "kansai-paint", src: "image35.png" },
  { group: "references", slug: "bimbo", src: "image36.png" },
  { group: "references", slug: "organik-kimya", src: "image37.png" },
  { group: "references", slug: "isg", src: "image38.png" },
  // IGA sits on a white frame: crop inside the frame and keep the badge (and its white band) opaque.
  { group: "references", slug: "iga", src: "image39.png", box: [8, 8, 100, 100], mode: "opaque" },

  // Inveon customer references (slide 40) — image63.png
  { group: "references", slug: "columbia", src: "image63.png", box: [29, 182, 226, 227] },
  { group: "references", slug: "hotic", src: "image63.png", box: [245, 182, 441, 239] },
  { group: "references", slug: "watsons", src: "image63.png", box: [461, 184, 662, 232], fillHoles: WHITE },
  { group: "references", slug: "horizon", src: "image63.png", box: [216, 263, 347, 372] },
  { group: "references", slug: "sneaks-up", src: "image63.png", box: [371, 304, 511, 333] },

  // Mobilgi customer references (slide 41) — image67.png
  { group: "references", slug: "ikea", src: "image67.png", box: [19, 91, 164, 154] },
  { group: "references", slug: "garanti", src: "image67.png", box: [195, 94, 360, 154] },
  { group: "references", slug: "lc-waikiki", src: "image67.png", box: [384, 109, 536, 140] },
  { group: "references", slug: "mudo", src: "image67.png", box: [561, 100, 708, 143] },
  { group: "references", slug: "beko", src: "image67.png", box: [14, 205, 159, 290] },
  { group: "references", slug: "bizim", src: "image67.png", box: [194, 177, 359, 278], fillHoles: WHITE },
  { group: "references", slug: "lego", src: "image67.png", box: [395, 167, 523, 291], fillHoles: WHITE },
  // The deck shows the Savola (صافولا) lockup in this slot; the plan names it "afia".
  { group: "references", slug: "afia", src: "image67.png", box: [547, 193, 693, 265] },
];

/* ------------------------------------------------------------------------ */
/* Raw RGBA helpers                                                         */
/* ------------------------------------------------------------------------ */

/** @typedef {{ w: number, h: number, d: Uint8ClampedArray }} Img */

const cache = new Map();
/** @returns {Promise<Img>} */
async function load(file) {
  if (!cache.has(file)) {
    const { data, info } = await sharp(path.join(MEDIA, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    cache.set(file, { w: info.width, h: info.height, d: new Uint8ClampedArray(data) });
  }
  return cache.get(file);
}

/** @returns {Img} */
function crop(img, [l, t, r, b]) {
  l = Math.max(0, l); t = Math.max(0, t); r = Math.min(img.w, r); b = Math.min(img.h, b);
  const w = r - l, h = b - t, d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) d.set(img.d.subarray(((t + y) * img.w + l) * 4, ((t + y) * img.w + r) * 4), y * w * 4);
  return { w, h, d };
}

/** Median colour of the crop border (the plate / tile colour). */
function borderKey({ w, h, d }) {
  const ch = [[], [], []];
  const push = (x, y) => { const i = (y * w + x) * 4; for (let c = 0; c < 3; c++) ch[c].push(d[i + c]); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  return ch.map((a) => a.sort((p, q) => p - q)[a.length >> 1]);
}

/** One-sided distance from the key: ink is darker than a light plate, lighter than a dark tile. */
const inkDistance = (r, g, b, k) =>
  k[0] + k[1] + k[2] > 384
    ? Math.max(0, k[0] - r, k[1] - g, k[2] - b)
    : Math.max(0, r - k[0], g - k[1], b - k[2]);

function neighbours4(i, w, h, fn) {
  const x = i % w, y = (i / w) | 0;
  if (x > 0) fn(i - 1); if (x < w - 1) fn(i + 1); if (y > 0) fn(i - w); if (y < h - 1) fn(i + w);
}

/**
 * Colour-to-alpha against `key` with decontamination.
 * @param {Img} img
 * @param {{ key?: number[]|"auto", t0?: number, t1?: number, dist?: Function, mono?: number[], flood?: boolean }} o
 */
function keyColour(img, { key = WHITE, t0 = 24, t1 = 140, tl = t1, dist = inkDistance, mono, flood = false }) {
  const { w, h, d } = img, n = w * h;
  const K = key === "auto" ? borderKey(img) : key;
  // Flatten any source translucency onto the key colour.
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) d[i * 4 + c] = d[i * 4 + c] * a + K[c] * (1 - a);
    d[i * 4 + 3] = 255;
  }
  const D = new Float32Array(n);
  for (let i = 0; i < n; i++) D[i] = dist(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], K);

  // In flood mode only the key-coloured region connected to the border (plus a 2px
  // edge band around it) is keyed; everything enclosed by the badge stays untouched.
  let affect = null;
  if (flood) {
    const bg = new Uint8Array(n), stack = [];
    for (let i = 0; i < n; i++) {
      const x = i % w, y = (i / w) | 0;
      if ((x === 0 || y === 0 || x === w - 1 || y === h - 1) && D[i] < t1) { bg[i] = 1; stack.push(i); }
    }
    while (stack.length) neighbours4(stack.pop(), w, h, (q) => { if (!bg[q] && D[q] < t1) { bg[q] = 1; stack.push(q); } });
    affect = bg;
    for (let r = 0; r < 2; r++) {
      const next = affect.slice();
      for (let i = 0; i < n; i++) if (affect[i]) neighbours4(i, w, h, (q) => { next[q] = 1; });
      affect = next;
    }
  }

  // Nearest solid-ink pixel for every pixel within 4px (multi-source BFS).
  const near = new Int32Array(n).fill(-1);
  let frontier = [];
  for (let i = 0; i < n; i++) if (D[i] >= t1) { near[i] = i; frontier.push(i); }
  for (let step = 0; step < 4 && frontier.length; step++) {
    const next = [];
    for (const p of frontier) neighbours4(p, w, h, (q) => { if (near[q] < 0) { near[q] = near[p]; next.push(q); } });
    frontier = next;
  }

  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    if (affect && !affect[i]) { out.set(d.subarray(o, o + 3), o); out[o + 3] = 255; continue; }
    const di = D[i];
    let a, col;
    if (di >= t1) { a = 1; col = [d[o], d[o + 1], d[o + 2]]; }
    else if (di <= t0) { a = 0; col = [0, 0, 0]; }
    else if (near[i] >= 0) {
      const s = near[i] * 4;
      let uu = 0, uv = 0;
      for (let c = 0; c < 3; c++) { const u = d[s + c] - K[c], v = d[o + c] - K[c]; uu += u * u; uv += u * v; }
      a = uu > 0 ? Math.min(1, Math.max(0, uv / uu)) : 0;
      col = [d[s], d[s + 1], d[s + 2]];
    } else {
      // Light ink with no dark core nearby: ramp to opaque at `tl` and un-blend the key.
      a = Math.min(1, (di - t0) / (tl - t0));
      col = [0, 1, 2].map((c) => K[c] + (d[o + c] - K[c]) / a);
    }
    if (mono && a > 0) col = mono;
    out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; out[o + 3] = Math.round(a * 255);
  }
  return { w, h, d: out };
}

/** Connected components (8-neighbour) of a boolean mask; returns label array and sizes. */
function components(mask, w, h) {
  const n = w * h, lab = new Int32Array(n).fill(-1), sizes = [];
  for (let s = 0; s < n; s++) {
    if (!mask[s] || lab[s] >= 0) continue;
    const id = sizes.length, stack = [s];
    lab[s] = id; sizes.push(0);
    while (stack.length) {
      const p = stack.pop(); sizes[id]++;
      const x = p % w, y = (p / w) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const q = ny * w + nx;
        if (mask[q] && lab[q] < 0) { lab[q] = id; stack.push(q); }
      }
    }
  }
  return { lab, sizes };
}

/** White mark on a textured dark photo tile. */
function keyLight(img, { lo = 24, hi = 236, core = 215, minCore = 12, maskMin = 70 } = {}) {
  const { w, h, d } = img, n = w * h;
  const m = new Float32Array(n);
  for (let i = 0; i < n; i++) m[i] = Math.min(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]);
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = m[i] >= maskMin ? 1 : 0;
  const { lab, sizes } = components(mask, w, h);
  const coreCount = new Array(sizes.length).fill(0);
  for (let i = 0; i < n; i++) if (lab[i] >= 0 && m[i] >= core) coreCount[lab[i]]++;
  let keep = new Uint8Array(n);
  for (let i = 0; i < n; i++) keep[i] = lab[i] >= 0 && coreCount[lab[i]] >= minCore ? 1 : 0;
  // Grow by 2px so the faint outer anti-aliasing is kept.
  for (let r = 0; r < 2; r++) {
    const grown = keep.slice();
    for (let i = 0; i < n; i++) if (keep[i]) neighbours4(i, w, h, (q) => { grown[q] = 1; });
    keep = grown;
  }
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    const a = keep[i] ? Math.min(1, Math.max(0, (m[i] - lo) / (hi - lo))) : 0;
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return { w, h, d: out };
}

/** Removes isolated specks whose total coverage is below `minArea` pixels. */
function despeck(img, minArea) {
  const { w, h, d } = img, n = w * h;
  const mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  const { lab, sizes } = components(mask, w, h);
  const cover = new Float64Array(sizes.length);
  for (let i = 0; i < n; i++) if (lab[i] >= 0) cover[lab[i]] += d[i * 4 + 3] / 255;
  for (let i = 0; i < n; i++) if (lab[i] >= 0 && cover[lab[i]] < minArea) d[i * 4 + 3] = 0;
}

/**
 * Badges whose inner lettering was knocked out to transparency in the deck
 * (Advantech, Watsons, Bizim, LEGO): fill enclosed transparent holes with `colour`.
 */
function fillHoles(img, colour) {
  const { w, h, d } = img, n = w * h;
  const clear = new Uint8Array(n);
  for (let i = 0; i < n; i++) clear[i] = d[i * 4 + 3] < 128 ? 1 : 0;
  const { lab, sizes } = components(clear, w, h);
  const touches = new Uint8Array(sizes.length);
  for (let i = 0; i < n; i++) {
    const x = i % w, y = (i / w) | 0;
    if (lab[i] >= 0 && (x === 0 || y === 0 || x === w - 1 || y === h - 1)) touches[lab[i]] = 1;
  }
  let hole = new Uint8Array(n);
  for (let i = 0; i < n; i++) hole[i] = lab[i] >= 0 && !touches[lab[i]] ? 1 : 0;
  // Include the 2px anti-aliased rim of each hole.
  for (let r = 0; r < 2; r++) {
    const grown = hole.slice();
    for (let i = 0; i < n; i++) if (hole[i]) neighbours4(i, w, h, (q) => { if (d[q * 4 + 3] < 255) grown[q] = 1; });
    hole = grown;
  }
  for (let i = 0; i < n; i++) {
    if (!hole[i]) continue;
    const a = d[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) d[i * 4 + c] = d[i * 4 + c] * a + colour[c] * (1 - a);
    d[i * 4 + 3] = 255;
  }
  return img;
}

/**
 * Already-transparent sources were often matted on white: their anti-aliased edge
 * pixels are lighter than the ink (a white halo on dark backgrounds). Estimate how
 * strongly each logo was matted (r = 0 clean … 1 fully matted on white) by comparing
 * edge pixels with the nearest solid ink, then un-matte:
 *   c = a·ink + r(1 − a)·255 + (1 − r)(1 − a)·ink  ⇒  ink = (c − r(1 − a)·255) / (1 − r(1 − a))
 */
function unmatte(img, label) {
  const { w, h, d } = img, n = w * h;
  const near = new Int32Array(n).fill(-1);
  let frontier = [];
  for (let i = 0; i < n; i++) if (d[i * 4 + 3] >= 230) { near[i] = i; frontier.push(i); }
  for (let step = 0; step < 2 && frontier.length; step++) {
    const next = [];
    for (const p of frontier) neighbours4(p, w, h, (q) => { if (near[q] < 0) { near[q] = near[p]; next.push(q); } });
    frontier = next;
  }
  const lum = (o) => (d[o] + d[o + 1] + d[o + 2]) / 3;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    const a = d[i * 4 + 3] / 255;
    if (a < 0.12 || a > 0.86 || near[i] < 0) continue;
    const ls = lum(near[i] * 4);
    const x = (1 - a) * (255 - ls), y = lum(i * 4) - ls;
    sxy += x * y; sxx += x * x;
  }
  const r = sxx > 0 ? Math.min(1, Math.max(0, sxy / sxx)) : 0;
  if (r > 0.05) {
    for (let i = 0; i < n; i++) {
      const a = d[i * 4 + 3] / 255;
      if (a === 0 || a === 1) continue;
      const m = r * (1 - a);
      for (let c = 0; c < 3; c++) d[i * 4 + c] = (d[i * 4 + c] - m * 255) / (1 - m);
    }
  }
  if (label) console.log(`  ${label}: white-matte estimate r=${r.toFixed(2)}`);
  return img;
}

/** Keys one part according to its mode. */
function keyPart(img, part) {
  switch (part.mode ?? "alpha") {
    case "alpha": {
      if (part.fillHoles) fillHoles(img, part.fillHoles);
      return part.unmatte === false ? img : unmatte(img, process.env.DEBUG_LOGOS ? part.slug : "");
    }
    case "opaque": {
      for (let i = 0; i < img.w * img.h; i++) {
        const a = img.d[i * 4 + 3] / 255;
        for (let c = 0; c < 3; c++) img.d[i * 4 + c] = img.d[i * 4 + c] * a + 255 * (1 - a);
        img.d[i * 4 + 3] = 255;
      }
      return img;
    }
    case "key": return keyColour(img, part);
    case "flood": return keyColour(img, { ...part, flood: true });
    case "light": return keyLight(img, part);
    default: throw new Error(`unknown mode ${part.mode}`);
  }
}

/** Builds the keyed logo (all parts placed at their source positions). */
async function buildLogo(logo) {
  const src = await load(logo.src);
  const parts = logo.parts ?? [{ ...logo, box: logo.box ?? [0, 0, src.w, src.h] }];
  const L = Math.min(...parts.map((p) => p.box[0])), T = Math.min(...parts.map((p) => p.box[1]));
  const R = Math.max(...parts.map((p) => Math.min(src.w, p.box[2]))), B = Math.max(...parts.map((p) => Math.min(src.h, p.box[3])));
  const canvas = { w: R - L, h: B - T, d: new Uint8ClampedArray((R - L) * (B - T) * 4) };
  for (const part of parts) {
    const keyed = keyPart(crop(src, part.box), part);
    for (const [pl, pt, pr, pb, rgb] of part.paint ?? []) {
      for (let y = Math.max(0, pt - part.box[1]); y < Math.min(keyed.h, pb - part.box[1]); y++)
        for (let x = Math.max(0, pl - part.box[0]); x < Math.min(keyed.w, pr - part.box[0]); x++) keyed.d.set([...rgb, 255], (y * keyed.w + x) * 4);
    }
    for (const [el, et, er, eb] of part.erase ?? []) {
      for (let y = Math.max(0, et - part.box[1]); y < Math.min(keyed.h, eb - part.box[1]); y++)
        for (let x = Math.max(0, el - part.box[0]); x < Math.min(keyed.w, er - part.box[0]); x++) keyed.d[(y * keyed.w + x) * 4 + 3] = 0;
    }
    const ox = part.box[0] - L, oy = part.box[1] - T;
    for (let y = 0; y < keyed.h; y++) canvas.d.set(keyed.d.subarray(y * keyed.w * 4, (y + 1) * keyed.w * 4), ((oy + y) * canvas.w + ox) * 4);
  }
  despeck(canvas, logo.minSpeck ?? 3);
  // Zero the colour of fully transparent pixels (smaller files, no stray colour on resize).
  for (let i = 0; i < canvas.w * canvas.h; i++) if (canvas.d[i * 4 + 3] === 0) canvas.d.fill(0, i * 4, i * 4 + 3);
  return canvas;
}

/** Trims to content, resizes to 148px content height, pads 4% and writes the PNG. */
async function writeLogo(img, file) {
  let x0 = img.w, y0 = img.h, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (img.d[(y * img.w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) throw new Error(`${file}: empty after keying`);
  const resized = await sharp(Buffer.from(img.d.buffer, img.d.byteOffset, img.d.length), { raw: { width: img.w, height: img.h, channels: 4 } })
    .extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .resize({ height: CONTENT_H, kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const padX = Math.max(2, Math.round(resized.info.width * 0.04));
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(resized.data, { raw: { width: resized.info.width, height: resized.info.height, channels: 4 } })
    .extend({ top: PAD_Y, bottom: PAD_Y, left: padX, right: padX, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(file);
  return { width: resized.info.width + 2 * padX, height: OUT_H };
}

/** QA: one contact sheet per group, every logo at full size on mid-grey #888. */
async function writeSheets(results, dir) {
  await mkdir(dir, { recursive: true });
  const groups = [...new Set(results.map((r) => r.group))];
  for (const group of groups) {
    const items = results.filter((r) => r.group === group);
    const gap = 16, labelH = 22;
    const maxW = Math.max(1500, ...items.map((it) => it.width + gap));
    let x = gap, y = gap, rowH = 0;
    const comps = [];
    for (const it of items) {
      if (x + it.width > maxW && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
      comps.push({ input: it.file, left: x, top: y + labelH });
      const label = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(it.width, 60)}" height="${labelH}"><text x="0" y="16" font-family="Arial, sans-serif" font-size="15" fill="#fff">${it.slug}</text></svg>`;
      comps.push({ input: Buffer.from(label), left: x, top: y });
      // Hairline frame so the padding box is visible.
      const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${it.width}" height="${it.height}"><rect x="0.5" y="0.5" width="${it.width - 1}" height="${it.height - 1}" fill="none" stroke="#777" stroke-width="1"/></svg>`;
      comps.push({ input: Buffer.from(frame), left: x, top: y + labelH });
      x += Math.max(it.width, 60) + gap;
      rowH = Math.max(rowH, it.height + labelH);
    }
    const H = y + rowH + gap;
    await sharp({ create: { width: maxW + gap, height: H, channels: 4, background: "#888888" } })
      .composite(comps)
      .png()
      .toFile(path.join(dir, `sheet-${group}.png`));
  }
}

async function main() {
  const todo = LOGOS.filter((l) => !ONLY || ONLY.includes(l.slug));
  const results = [];
  for (const logo of todo) {
    const file = path.join(OUT_DIR, logo.group, `${logo.slug}.png`);
    const img = await buildLogo(logo);
    const size = await writeLogo(img, file);
    results.push({ ...logo, file, ...size });
    console.log(`${path.relative(ROOT, file).replaceAll("\\", "/")}  ${size.width}x${size.height}`);
  }
  if (SHEET_DIR) await writeSheets(results, SHEET_DIR);
  console.log(`${results.length} logos written`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
