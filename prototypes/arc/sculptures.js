// Seven luminous station sculptures (lines + points), authored in a camera-facing local frame:
// +X = screen right, +Y = up, +Z = toward the chapter camera. Every vertex carries an "assembled" target
// and a scattered offset; uAssemble (a pure function of scroll) converges them.
import * as THREE from "three";
import { sculptVert, pointsFrag, linesFrag, fresnelVert, fresnelFrag } from "./shaders.js";

const TAU = Math.PI * 2;
const GOLDEN = 137.50776 * (Math.PI / 180);

export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lin = (hex) => { const c = new THREE.Color(hex); return [c.r, c.g, c.b]; };
export const COL = {
  mint: lin("#7FE0C8"), paper: lin("#F6F5F0"), lime: lin("#C8F169"),
  t950: lin("#041F1F"), t900: lin("#083B3B"), t800: lin("#0D4B4A"), t700: lin("#145E5C"), t600: lin("#1E7773"),
  t500: lin("#2E948E"), t400: lin("#58B0A9"), t300: lin("#8FCDC6"), t200: lin("#C2E5E0"),
};
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const SIZES = { position: 3, aPivot: 3, aOff: 3, aAxis: 4, aRnd: 4, aCol: 3, aAcc: 1, aExt: 4 };
class Buf {
  constructor() { this.a = {}; for (const k in SIZES) this.a[k] = []; this.n = 0; }
  push(p, o) {
    const A = this.a;
    const pv = o.pivot || p, of = o.off || [0, 0, 0], ax = o.axis || [0, 1, 0], c = o.col || COL.mint, e = o.ext || [0, 0, 0, 0];
    A.position.push(p[0], p[1], p[2]);
    A.aPivot.push(pv[0], pv[1], pv[2]);
    A.aOff.push(of[0], of[1], of[2]);
    A.aAxis.push(ax[0], ax[1], ax[2], o.angle || 0);
    A.aRnd.push(o.delay ?? 0, o.size ?? 0.05, o.phase ?? 0, o.bright ?? 1);
    A.aCol.push(c[0], c[1], c[2]);
    A.aAcc.push(o.acc || 0);
    A.aExt.push(e[0], e[1], e[2], e[3]);
    this.n++;
  }
  geometry(index) {
    const g = new THREE.BufferGeometry();
    for (const k in SIZES) g.setAttribute(k, new THREE.Float32BufferAttribute(this.a[k], SIZES[k]));
    if (index) g.setIndex(index);
    return g;
  }
}

function randDir(rng) {
  const u = rng() * 2 - 1, th = rng() * TAU, s = Math.sqrt(1 - u * u);
  return [s * Math.cos(th), u, s * Math.sin(th)];
}
function scatter(rng, a, b) {
  const d = randDir(rng), m = a + (b - a) * rng();
  return [d[0] * m, d[1] * m * 0.8 + 0.4, d[2] * m];
}
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scl = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Rigid shard: both endpoints share pivot/offset/rotation so segments fly in as little sticks.
function seg(buf, rng, p0, p1, o, smin = 2, smax = 6) {
  const pivot = o.pivot || lerp3(p0, p1, 0.5);
  const off = o.off || scatter(rng, smin, smax);
  const axis = o.axis || randDir(rng);
  const angle = o.angle ?? (rng() * 2 - 1) * 3;
  const delay = o.delay ?? rng();
  const phase = rng();
  buf.push(p0, { ...o, pivot, off, axis, angle, delay, phase, ext: o.ext0 || o.ext });
  buf.push(p1, { ...o, pivot, off, axis, angle, delay, phase, ext: o.ext1 || o.ext });
}
function pt(buf, rng, p, o, smin = 2, smax = 6) {
  buf.push(p, { ...o, pivot: o.pivot || p, off: o.off || scatter(rng, smin, smax), delay: o.delay ?? rng(), phase: rng() });
}
function fib(n, r, i) {
  const y = 1 - (2 * (i + 0.5)) / n, rr = Math.sqrt(1 - y * y), th = i * GOLDEN;
  return [Math.cos(th) * rr * r, y * r, Math.sin(th) * rr * r];
}

function makeMat(kind, U, defines = {}) {
  const d = { ...defines };
  if (kind === "points") d.POINTS = "";
  else d.LINES = "";
  return new THREE.ShaderMaterial({
    uniforms: U, defines: d, vertexShader: sculptVert, fragmentShader: kind === "points" ? pointsFrag : linesFrag,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
}
function P(buf, U, defines) { const o = new THREE.Points(buf.geometry(), makeMat("points", U, defines)); o.frustumCulled = false; return o; }
function L(buf, U, defines) { const o = new THREE.LineSegments(buf.geometry(), makeMat("lines", U, defines)); o.frustumCulled = false; return o; }
function M(buf, index, U, defines) { const o = new THREE.Mesh(buf.geometry(index), makeMat("lines", U, defines)); o.frustumCulled = false; return o; }

// ---------------------------------------------------------------- 1 CONSULT — armillary compass
function buildConsult({ rng, U, q }) {
  const body = new THREE.Group();
  const tilt = new THREE.Group(); tilt.rotation.set(0.3, 0, -0.1); body.add(tilt);
  const R0 = 3.0;
  const ring = (radius, segs, col, bright, dots, dotBright, delayBase = 0) => {
    const Lb = new Buf(), Pb = new Buf();
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * TAU, a1 = ((i + 1) / segs) * TAU;
      seg(Lb, rng, [radius * Math.cos(a0), 0, radius * Math.sin(a0)], [radius * Math.cos(a1), 0, radius * Math.sin(a1)], { col, bright, delay: delayBase + rng() * 0.6 });
    }
    for (let i = 0; i < dots; i++) {
      const a = rng() * TAU;
      pt(Pb, rng, [radius * Math.cos(a), 0, radius * Math.sin(a)], { col: COL.t200, size: 0.03 + rng() * 0.05, bright: dotBright * (0.4 + rng()) });
    }
    return [Lb, Pb];
  };
  // Equator bezel with compass ticks
  const [eqL, eqP] = ring(R0, 160, COL.mint, 0.75, Math.round(90 * q), 0.9);
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * TAU;
    const card = i % 18 === 0, mid = i % 9 === 0;
    const len = card ? 0.5 : mid ? 0.3 : 0.14;
    const r0 = R0 + 0.1;
    seg(eqL, rng, [r0 * Math.cos(a), 0, r0 * Math.sin(a)], [(r0 + len) * Math.cos(a), 0, (r0 + len) * Math.sin(a)], { col: card ? COL.paper : COL.t300, bright: card ? 1.1 : 0.55 });
  }
  tilt.add(L(eqL, U), P(eqP, U));
  // Meridian cage (two great circles) spinning about the vertical axis
  const cage = new THREE.Group(); tilt.add(cage);
  for (let m = 0; m < 2; m++) {
    const g = new THREE.Group(); g.rotation.set(Math.PI / 2, 0, (m * Math.PI) / 2); cage.add(g);
    const [lb, pb] = ring(R0 * (0.985 - m * 0.02), 150, m ? COL.t400 : COL.t300, m ? 0.4 : 0.6, Math.round(50 * q), 0.6);
    g.add(L(lb, U), P(pb, U));
  }
  // Ecliptic ring
  const ecl = new THREE.Group(); ecl.rotation.set(0.41, 0, 0.2); tilt.add(ecl);
  const eclSpin = new THREE.Group(); ecl.add(eclSpin);
  { const [lb, pb] = ring(2.55, 130, COL.t300, 0.5, Math.round(70 * q), 1.0); eclSpin.add(L(lb, U), P(pb, U));
    const sb = new Buf(); pt(sb, rng, [2.55, 0, 0], { col: COL.paper, size: 0.2, bright: 1.3, acc: 1 }); pt(sb, rng, [2.55, 0, 0], { col: COL.mint, size: 0.8, bright: 0.25 });
    eclSpin.add(P(sb, U)); }
  // Inner gimbal
  const gim = new THREE.Group(); gim.rotation.set(0, 0, 1.0); tilt.add(gim);
  const gimSpin = new THREE.Group(); gim.add(gimSpin);
  { const [lb, pb] = ring(1.65, 100, COL.t400, 0.55, Math.round(40 * q), 0.7); gimSpin.add(L(lb, U), P(pb, U)); }
  // Polar axis
  { const ab = new Buf(), ap = new Buf();
    const ax = norm([Math.sin(0.41), Math.cos(0.41), 0]);
    const n = 24;
    for (let i = 0; i < n; i++) seg(ab, rng, scl(ax, -3.9 + (7.8 * i) / n), scl(ax, -3.9 + (7.8 * (i + 1)) / n), { col: COL.t300, bright: 0.55 });
    pt(ap, rng, scl(ax, 3.95), { col: COL.paper, size: 0.14, bright: 1.0 });
    pt(ap, rng, scl(ax, -3.95), { col: COL.paper, size: 0.14, bright: 0.8 });
    tilt.add(L(ab, U), P(ap, U)); }
  // Compass needle (north half = lime accent)
  const needle = new THREE.Group(); tilt.add(needle);
  { const nb = new Buf(), np = new Buf();
    const tip = [2.45, 0, 0], tail = [-1.55, 0, 0], s1 = [0, 0, 0.2], s2 = [0, 0, -0.2];
    const edge = (a, b, acc, bright, col) => { const n = 10; for (let i = 0; i < n; i++) seg(nb, rng, lerp3(a, b, i / n), lerp3(a, b, (i + 1) / n), { col, bright, acc, delay: 0.55 + rng() * 0.4 }); };
    edge(tip, s1, 1, 1.2, COL.paper); edge(tip, s2, 1, 1.2, COL.paper);
    edge(tail, s1, 0, 0.7, COL.t300); edge(tail, s2, 0, 0.7, COL.t300);
    edge(tip, tail, 0, 0.35, COL.mint);
    for (let i = 0; i < 40; i++) { const u = rng(); pt(np, rng, lerp3(tip, rng() < 0.5 ? s1 : s2, u), { col: COL.paper, size: 0.04 + rng() * 0.04, bright: 0.9, acc: 1, delay: 0.6 + rng() * 0.35 }); }
    pt(np, rng, tip, { col: COL.paper, size: 0.16, bright: 1.4, acc: 1, delay: 0.8 });
    needle.add(L(nb, U), P(np, U)); }
  // Core
  { const cb = new Buf();
    pt(cb, rng, [0, 0, 0], { col: COL.mint, size: 1.3, bright: 0.28, delay: 0.3 });
    pt(cb, rng, [0, 0, 0], { col: COL.paper, size: 0.26, bright: 1.5, delay: 0.3 });
    for (let i = 0; i < 30; i++) pt(cb, rng, scl(randDir(rng), 0.12 + rng() * 0.2), { col: COL.t200, size: 0.035, bright: 0.8 });
    tilt.add(P(cb, U)); }
  return {
    body, r: 3.5, rh: 3.6, stemTop: -3.0,
    update(a, p, t) {
      const ia = 1 - a, ia2 = ia * ia;
      cage.rotation.y = 0.5 + ia2 * 2.4 + p * 5 + t * 0.07;
      ecl.rotation.x = 0.41 + ia2 * 1.6;
      eclSpin.rotation.y = p * 3 + t * 0.05 + ia2 * 2;
      gimSpin.rotation.x = 1.1 + ia2 * 2.2 + p * 7 + t * 0.1;
      needle.rotation.y = 0.42 + ia2 * 3.2 + Math.sin(t * 0.6) * 0.04;
    },
  };
}

// ---------------------------------------------------------------- 2 TRANSFORM — neural cloud + data stream
function buildTransform({ rng, U, q, h }) {
  const body = new THREE.Group();
  const layers = [5, 8, 8, 5, 1], xs = [-2.9, -1.45, 0, 1.45, 2.9];
  const nodes = layers.map((c, l) => {
    const arr = [];
    for (let i = 0; i < c; i++) {
      if (c === 1) { arr.push([xs[l], 0.15, 0]); continue; }
      const y = (i - (c - 1) / 2) * 0.58;
      const z = (i % 2 ? 0.42 : -0.42) + (rng() - 0.5) * 0.2;
      arr.push([xs[l] + (rng() - 0.5) * 0.18, y + (rng() - 0.5) * 0.1, z]);
    }
    return arr;
  });
  const eb = new Buf();
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of nodes[l]) for (const b of nodes[l + 1]) {
      const ph = -l * 0.22 + rng() * 0.45;
      seg(eb, rng, a, b, { col: l === 3 ? COL.mint : COL.t300, bright: l === 3 ? 0.55 : 0.24, ext0: [0, ph, 0, 0], ext1: [1, ph, 0, 0], acc: l === 3 ? 0.45 : 0, delay: 0.2 + l * 0.12 + rng() * 0.25 });
    }
  }
  const nb = new Buf();
  nodes.forEach((arr, l) => arr.forEach((n) => {
    const out = l === layers.length - 1;
    pt(nb, rng, n, { col: out ? COL.paper : l === 0 ? COL.mint : COL.t200, size: out ? 0.44 : 0.22, bright: out ? 1.6 : 1.05, acc: out ? 1 : 0, delay: l * 0.15 + rng() * 0.2 });
    pt(nb, rng, n, { col: COL.mint, size: out ? 1.7 : 0.7, bright: out ? 0.35 : 0.13, delay: l * 0.15 + rng() * 0.2 });
  }));
  const cb = new Buf();
  const nCloud = Math.round(420 * q);
  for (let i = 0; i < nCloud; i++) {
    const d = randDir(rng), m = 0.55 + 0.45 * Math.cbrt(rng());
    pt(cb, rng, [d[0] * 4.0 * m, d[1] * 2.7 * m, d[2] * 2.2 * m], { col: rng() < 0.3 ? COL.mint : COL.t400, size: 0.03 + rng() * 0.04, bright: 0.3 + rng() * 0.35 });
  }
  // data stream rising from the path bead into the input layer
  const sb = new Buf();
  const nStream = Math.round(560 * q);
  for (let i = 0; i < nStream; i++) {
    const end = nodes[0][Math.floor(rng() * nodes[0].length)];
    const start = [-0.2 + (rng() - 0.5) * 1.4, -h + 0.25 + (rng() - 0.5) * 0.3, (rng() - 0.5) * 0.8];
    const ctrl = [-3.9 + (rng() - 0.5) * 0.9, -2.3 + (rng() - 0.5) * 0.8, 0.3 + (rng() - 0.5) * 0.9];
    const acc = rng() < 0.06 ? 1 : 0;
    sb.push(end, { pivot: add(end, scatter(rng, 2, 6)), off: sub(start, end), axis: ctrl, angle: 0, delay: 0.5 + rng() * 0.45, size: acc ? 0.09 : 0.04 + rng() * 0.04, phase: rng(), bright: acc ? 1.3 : 0.55 + rng() * 0.5, col: acc ? COL.paper : COL.mint, acc, ext: [rng(), 0.16 + rng() * 0.1, 0, 0] });
  }
  body.add(L(eb, U, { PULSE: "" }), P(cb, U), P(nb, U), P(sb, U, { STREAM: "" }));
  return { body, r: 3.4, rh: 3.1, stemTop: -h + 0.9, update() {} };
}

// ---------------------------------------------------------------- 3 BUILD — modular cubes
function buildBuild({ rng, U }) {
  const body = new THREE.Group();
  const iso = new THREE.Group(); iso.rotation.y = Math.PI / 4; body.add(iso);
  const H = [[2, 3, 1], [3, 4, 2], [1, 2, 1]];
  const sp = 1.0, cs = 0.8, y0 = -2.05;
  const lb = new Buf(), fb = new Buf(), pb = new Buf(), fIdx = [];
  const corners = (c, s) => { const r = []; for (let i = 0; i < 8; i++) r.push([c[0] + (i & 1 ? s : -s), c[1] + (i & 2 ? s : -s), c[2] + (i & 4 ? s : -s)]); return r; };
  const EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const FACES = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
  const cube = (Lb, Fb, Pb, idx, c, s, o) => {
    const cn = corners(c, s);
    const common = { pivot: c, off: o.off, axis: o.axis, angle: o.angle, delay: o.delay };
    for (const [i, j] of EDGES) { Lb.push(cn[i], { ...common, col: o.col, bright: o.bright, acc: o.acc, phase: rng() }); Lb.push(cn[j], { ...common, col: o.col, bright: o.bright, acc: o.acc, phase: rng() }); }
    if (Fb) {
      const base = Fb.n;
      for (const f of FACES) { const b = Fb.n; for (const k of f) Fb.push(cn[k], { ...common, col: COL.t500, bright: o.faceBright, acc: o.acc * 0.5 }); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); }
      void base;
    }
    for (const k of cn) Pb.push(k, { ...common, col: COL.paper, size: 0.075, bright: 0.85, acc: o.acc, phase: rng() });
  };
  for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 3; iz++) for (let lv = 0; lv < H[ix][iz]; lv++) {
    const c = [(ix - 1) * sp, y0 + lv * sp, (iz - 1) * sp];
    const off = add(scatter(rng, 3, 6.5), [0, 1.5, 0]);
    cube(lb, fb, pb, fIdx, c, cs / 2, { off, axis: randDir(rng), angle: (rng() < 0.5 ? -1 : 1) * (1.5 + rng() * 2), delay: Math.min(0.92, lv * 0.2 + rng() * 0.18), col: lv >= 2 ? COL.mint : COL.t300, bright: lv >= 2 ? 0.95 : 0.7, acc: 0, faceBright: 0.04 });
  }
  // blueprint pad
  const gb = new Buf();
  const gy = y0 - cs / 2 - 0.12, ext = 2.2;
  for (let i = 0; i <= 8; i++) {
    const v = -ext + (2 * ext * i) / 8;
    seg(gb, rng, [v, gy, -ext], [v, gy, ext], { col: COL.t500, bright: i % 4 === 0 ? 0.3 : 0.14, delay: rng() * 0.2, off: [0, -1.5 - rng(), 0], angle: 0 });
    seg(gb, rng, [-ext, gy, v], [ext, gy, v], { col: COL.t500, bright: i % 4 === 0 ? 0.3 : 0.14, delay: rng() * 0.2, off: [0, -1.5 - rng(), 0], angle: 0 });
  }
  // the next module, hovering (lime when active)
  const next = new THREE.Group(); next.position.set(0, 2.55, 0); iso.add(next);
  const nl = new Buf(), npb = new Buf();
  cube(nl, null, npb, null, [0, 0, 0], cs / 2, { off: [0, 4, 0], axis: [0, 1, 0], angle: 2, delay: 0.95, col: COL.paper, bright: 1.2, acc: 1 });
  const RL = { RIGID_LINES: "" };
  next.add(L(nl, U, RL), P(npb, U));
  iso.add(L(gb, U, RL), M(fb, fIdx, U, RL), L(lb, U, RL), P(pb, U));
  return {
    body, r: 3.1, rh: 3.5, stemTop: -2.6,
    update(a, p, t) {
      next.rotation.set(0.1, 0.35 + p * 4 + t * 0.15, 0.06);
      next.position.y = 2.55 + Math.sin(t * 0.8) * 0.06 + (1 - a) * 0.5;
    },
  };
}

// ---------------------------------------------------------------- 4 OPERATE — infinity loop with continuous flow
function lemJS(A, t) { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [(A * c) / d, (A * s * c) / d, (A * 0.28 * s) / d]; }
function buildOperate({ rng, U, q }) {
  const body = new THREE.Group();
  const tilt = new THREE.Group(); tilt.rotation.set(-0.38, 0, 0); body.add(tilt);
  const A = 3.35;
  const UL = { ...U, uLemA: { value: A } };
  const lb = new Buf();
  const n = 320;
  for (let i = 0; i < n; i++) seg(lb, rng, lemJS(A, (i / n) * TAU), lemJS(A, ((i + 1) / n) * TAU), { col: COL.t300, bright: 0.42 });
  const gb = new Buf();
  for (let i = 0; i < 70; i++) pt(gb, rng, lemJS(A, (i / 70) * TAU), { col: COL.t500, size: 0.55, bright: 0.07 });
  pt(gb, rng, [0, 0, 0], { col: COL.paper, size: 0.24, bright: 1.2, acc: 0.6 });
  pt(gb, rng, [0, 0, 0], { col: COL.mint, size: 1.1, bright: 0.2 });
  const fb = new Buf();
  const nf = Math.round(2300 * q);
  for (let i = 0; i < nf; i++) {
    const gauss = Math.sqrt(-2 * Math.log(1 - rng() * 0.999)) * 0.07;
    fb.push([0, 0, 0], {
      delay: rng(), phase: rng(), size: 0.035 + rng() * 0.045, bright: 0.4 + rng() * 0.6,
      col: rng() < 0.5 ? COL.mint : COL.t200, ext: [rng() * TAU, 0.85 + rng() * 0.35, gauss, rng() * TAU],
    });
  }
  // a few bright data packets (lime head, mint comet trail) circulating on the centreline
  const nPk = q < 1 ? 10 : 14;
  for (let i = 0; i < nPk; i++) {
    const t0 = (i / nPk) * TAU + rng() * 0.25, sp = 0.95 + rng() * 0.12, d = rng();
    fb.push([0, 0, 0], { delay: d, phase: rng(), size: 0.16, bright: 1.5, col: COL.paper, acc: 1, ext: [t0, sp, 0, 0] });
    for (let j = 1; j <= 7; j++) fb.push([0, 0, 0], { delay: d, phase: rng(), size: 0.12 - j * 0.011, bright: 0.9 * (1 - j / 8), col: COL.mint, ext: [t0 - j * 0.045, sp, 0, 0] });
  }
  tilt.add(P(gb, U), L(lb, U), P(fb, UL, { LEMNISCATE: "" }));
  return { body, r: 3.9, rh: 2.4, stemTop: -0.05, update() {} };
}

// ---------------------------------------------------------------- 5 SECURE — geodesic hex shield around a core
function goldbergCells(radius, detail) {
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const pos = geo.attributes.position;
  const verts = [], map = new Map(), faces = [];
  const key = (x, y, z) => `${Math.round(x * 1e4)},${Math.round(y * 1e4)},${Math.round(z * 1e4)}`;
  for (let i = 0; i < pos.count; i += 3) {
    const f = [];
    for (let k = 0; k < 3; k++) {
      const x = pos.getX(i + k), y = pos.getY(i + k), z = pos.getZ(i + k), kk = key(x, y, z);
      if (!map.has(kk)) { map.set(kk, verts.length); verts.push(norm([x, y, z])); }
      f.push(map.get(kk));
    }
    faces.push(f);
  }
  geo.dispose();
  const inc = verts.map(() => []);
  faces.forEach((f, fi) => f.forEach((v) => inc[v].push(fi)));
  const cent = faces.map((f) => norm(add(add(verts[f[0]], verts[f[1]]), verts[f[2]])));
  return verts.map((v, vi) => {
    const t1 = norm(cross(Math.abs(v[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], v)), t2 = cross(v, t1);
    const poly = inc[vi].map((fi) => cent[fi]).sort((a, b) => {
      const aa = Math.atan2(a[0] * t2[0] + a[1] * t2[1] + a[2] * t2[2], a[0] * t1[0] + a[1] * t1[1] + a[2] * t1[2]);
      const bb = Math.atan2(b[0] * t2[0] + b[1] * t2[1] + b[2] * t2[2], b[0] * t1[0] + b[1] * t1[1] + b[2] * t1[2]);
      return aa - bb;
    });
    return { n: v, c: scl(v, radius), poly: poly.map((p) => scl(p, radius)) };
  });
}
function buildSecure({ rng, U, q }) {
  const body = new THREE.Group();
  const shell = new THREE.Group(); body.add(shell);
  const R0 = 3.0;
  const cells = goldbergCells(R0, 2);
  const lb = new Buf(), pb = new Buf();
  const TH = 0.611 * 2.2, cT = Math.cos(TH), sT = Math.sin(TH);
  for (const cell of cells) {
    const nz = -cell.n[0] * sT + cell.n[2] * cT, nzw = cell.n[1] * Math.sin(0.12) + nz * Math.cos(0.12);
    const inset = cell.poly.map((p) => scl(norm(lerp3(cell.c, p, 0.82)), R0));
    const off = add(scl(cell.n, 2.5 + rng() * 3.5), scl(randDir(rng), 1));
    const axis = randDir(rng), angle = (rng() * 2 - 1) * 2.2;
    const front = 0.5 + 0.5 * nzw;
    const delay = Math.min(0.95, 0.4 * front + rng() * 0.45);
    const col = rng() < 0.18 ? COL.t200 : COL.mint;
    const bright = 0.35 + 0.45 * front;
    for (let i = 0; i < inset.length; i++) {
      const a = inset[i], b = inset[(i + 1) % inset.length];
      lb.push(a, { pivot: cell.c, off, axis, angle, delay, col, bright, phase: rng() });
      lb.push(b, { pivot: cell.c, off, axis, angle, delay, col, bright, phase: rng() });
    }
    pb.push(cell.c, { pivot: cell.c, off, axis, angle, delay, col: COL.t300, size: 0.05, bright: 0.45, phase: rng() });
  }
  shell.add(L(lb, U, { RIGID_LINES: "" }), P(pb, U));
  const fres = new THREE.Mesh(new THREE.SphereGeometry(R0 * 0.97, 48, 32), new THREE.ShaderMaterial({
    uniforms: { ...U, uColor: { value: new THREE.Color("#7FE0C8") } }, vertexShader: fresnelVert, fragmentShader: fresnelFrag,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  }));
  fres.frustumCulled = false;
  body.add(fres);
  // core: inner icosahedron + hot point
  const core = new THREE.Group(); body.add(core);
  const ib = new Buf(), cp = new Buf();
  const ico = new THREE.IcosahedronGeometry(0.85, 0), ip = ico.attributes.position, seen = new Set();
  for (let i = 0; i < ip.count; i += 3) for (let k = 0; k < 3; k++) {
    const a = [ip.getX(i + k), ip.getY(i + k), ip.getZ(i + k)], b = [ip.getX(i + ((k + 1) % 3)), ip.getY(i + ((k + 1) % 3)), ip.getZ(i + ((k + 1) % 3))];
    const kk = [a, b].map((v) => v.map((x) => x.toFixed(3)).join()).sort().join("|");
    if (seen.has(kk)) continue; seen.add(kk);
    seg(ib, rng, a, b, { col: COL.paper, bright: 0.9, acc: 1, delay: 0.3 + rng() * 0.3 });
  }
  ico.dispose();
  pt(cp, rng, [0, 0, 0], { col: COL.paper, size: 0.42, bright: 1.7, acc: 0.6, delay: 0.2 });
  pt(cp, rng, [0, 0, 0], { col: COL.mint, size: 2.2, bright: 0.3, delay: 0.2 });
  for (let i = 0; i < Math.round(60 * q); i++) pt(cp, rng, scl(randDir(rng), 0.15 + rng() * 0.3), { col: COL.t200, size: 0.04, bright: 0.9, acc: 0.25 });
  core.add(L(ib, U), P(cp, U));
  return {
    body, r: 3.4, rh: 3.35, stemTop: -2.95,
    update(a, p, t) {
      shell.rotation.set(0.12, p * 2.2 + t * 0.04, 0);
      core.rotation.set(p * 5 + t * 0.2, p * 7 + t * 0.3, 0);
    },
  };
}

// ---------------------------------------------------------------- 6 SOLVE — three product orbs + partner satellites
function buildSolve({ rng, U, q }) {
  const body = new THREE.Group();
  const tilt = new THREE.Group(); tilt.rotation.set(0.45, 0, 0.12); body.add(tilt);
  const radii = [1.45, 2.2, 2.95];
  const cb = new Buf();
  const nCore = Math.round(240 * q);
  for (let i = 0; i < nCore; i++) pt(cb, rng, fib(nCore, 0.62, i), { col: rng() < 0.4 ? COL.paper : COL.t200, size: 0.045, bright: 0.85 });
  pt(cb, rng, [0, 0, 0], { col: COL.mint, size: 2.6, bright: 0.3 });
  pt(cb, rng, [0, 0, 0], { col: COL.paper, size: 0.4, bright: 1.3 });
  const ob = new Buf(), olb = new Buf();
  radii.forEach((r, k) => {
    const n = Math.round((90 + k * 40) * q);
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; pt(ob, rng, [r * Math.cos(a), 0, r * Math.sin(a)], { col: COL.t300, size: 0.034, bright: 0.5 }); }
    const ns = 120;
    for (let i = 0; i < ns; i++) { const a0 = (i / ns) * TAU, a1 = ((i + 1) / ns) * TAU; seg(olb, rng, [r * Math.cos(a0), 0, r * Math.sin(a0)], [r * Math.cos(a1), 0, r * Math.sin(a1)], { col: COL.t400, bright: 0.2 }); }
  });
  tilt.add(P(cb, U), P(ob, U), L(olb, U));
  const orbs = radii.map((r, k) => {
    const g = new THREE.Group(); tilt.add(g);
    const b = new Buf();
    const rr = [0.3, 0.42, 0.35][k], n = Math.round([150, 210, 170][k] * q);
    for (let i = 0; i < n; i++) pt(b, rng, fib(n, rr, i), { col: i % 3 ? COL.t200 : COL.paper, size: 0.05, bright: 0.95, acc: i % 5 ? 0 : 1, delay: 0.3 + rng() * 0.5 });
    pt(b, rng, [0, 0, 0], { col: COL.mint, size: rr * 4.2, bright: 0.36, delay: 0.4 });
    pt(b, rng, [0, 0, 0], { col: COL.paper, size: rr * 0.8, bright: 1.1, acc: 1, delay: 0.4 });
    g.add(P(b, U));
    // phases chosen so the three products sit spread around the core at the chapter midpoint (p = 0.722)
    const speed = [1.25, 0.85, 0.6][k], want = [200, 55, 320][k] * (Math.PI / 180);
    return { g, r, speed, base: want - 0.722 * TAU * 1.6 * speed };
  });
  // outer partner ring with small satellites
  const sat = new THREE.Group(); sat.rotation.set(-0.35, 0, 0.25); tilt.add(sat);
  const spin = new THREE.Group(); sat.add(spin);
  const sb = new Buf();
  const rs = 3.6;
  for (let i = 0; i < Math.round(160 * q); i++) { const a = (i / Math.round(160 * q)) * TAU; pt(sb, rng, [rs * Math.cos(a), 0, rs * Math.sin(a)], { col: COL.t500, size: 0.028, bright: 0.35 }); }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; pt(sb, rng, [rs * Math.cos(a), 0, rs * Math.sin(a)], { col: COL.t200, size: 0.12, bright: 1.0, delay: 0.6 + rng() * 0.3 }); pt(sb, rng, [rs * Math.cos(a), 0, rs * Math.sin(a)], { col: COL.mint, size: 0.45, bright: 0.15, delay: 0.6 }); }
  spin.add(P(sb, U));
  return {
    body, r: 3.6, rh: 3.0, stemTop: -0.62,
    update(a, p, t) {
      for (const o of orbs) {
        const an = o.base + (p * TAU * 1.6 + t * 0.05) * o.speed + (1 - a) * 1.5;
        o.g.position.set(o.r * Math.cos(an), 0, o.r * Math.sin(an));
      }
      spin.rotation.y = p * TAU * 0.5 + t * 0.03;
    },
  };
}

// ---------------------------------------------------------------- 7 GROW — phyllotaxis plant growing upward
function buildGrow({ rng, U, q, h }) {
  const body = new THREE.Group();
  const y0 = -h + 0.2, H = 7.4;
  const stem = (u) => [0.22 * Math.sin(u * 3.2), y0 + u * H * 0.86, 0.14 * Math.sin(u * 5 + 1)];
  const sl = new Buf();
  const ns = 70;
  for (let i = 0; i < ns; i++) {
    const u0 = i / ns, u1 = (i + 1) / ns, p0 = stem(u0), p1 = stem(u1);
    sl.push(p0, { pivot: p0, col: COL.t200, bright: 0.9, ext: [u0 * 0.62, 0.05, 0, 0] });
    sl.push(p1, { pivot: p0, col: COL.t200, bright: 0.9, ext: [u0 * 0.62, 0.05, 0, 0] });
  }
  const tipB = new Buf();
  const nLeaves = 17;
  for (let i = 0; i < nLeaves; i++) {
    const u = 0.08 + (0.66 * i) / nLeaves;
    const phi = i * GOLDEN;
    const Ll = 1.65 * (1 - 0.6 * u);
    const d = [Math.cos(phi), 0, Math.sin(phi)], s = [-Math.sin(phi), 0, Math.cos(phi)];
    const base = stem(u);
    const thr = u * 0.62 + 0.03;
    const at = (v, side) => {
      const w = 0.24 * Ll * Math.sin(Math.PI * v) * (1 - 0.25 * v) * side;
      return add(add(base, scl(d, Ll * v)), add(scl([0, 1, 0], Ll * 0.55 * v * v), scl(s, w)));
    };
    const nseg = 12;
    for (const side of [-1, 1, 0]) {
      for (let k = 0; k < nseg; k++) {
        const v0 = k / nseg, v1 = (k + 1) / nseg;
        const e = [thr + v0 * 0.06, 0.07, 0, 0];
        const col = side === 0 ? COL.t400 : COL.mint;
        const bright = side === 0 ? 0.35 : 0.8;
        sl.push(at(v0, side), { pivot: base, col, bright, ext: e });
        sl.push(at(v1, side), { pivot: base, col, bright, ext: e });
      }
    }
    tipB.push(at(1, 0), { pivot: base, col: COL.paper, size: 0.1, bright: 1.2, acc: 1, ext: [thr + 0.05, 0.07, 0, 0] });
  }
  // phyllotaxis head (Vogel spiral)
  const top = stem(1);
  const c = add(top, [0, 0.12, 0]);
  const nrm = norm([0.1, 0.72, 0.68]);
  const e1 = norm(cross([0, 1, 0], nrm)), e2 = cross(nrm, e1);
  const nh = Math.round(420 * q);
  const rmax = 0.07 * Math.sqrt(420);
  for (let n = 1; n <= nh; n++) {
    const r = 0.07 * Math.sqrt((n * 420) / nh), th = n * GOLDEN;
    const f = n / nh;
    const pp = add(add(c, scl(e1, Math.cos(th) * r)), add(scl(e2, Math.sin(th) * r), scl(nrm, -0.25 * (r / rmax) ** 2)));
    tipB.push(pp, { pivot: c, col: mixc(COL.paper, COL.mint, f), size: 0.045 + 0.05 * f, bright: 1.1 - 0.3 * f, acc: f > 0.85 ? 1 : 0, ext: [0.64 + 0.3 * f, 0.05, 0, 0] });
  }
  // spores drifting upward
  const sp = new Buf();
  for (let i = 0; i < Math.round(160 * q); i++) {
    const a = rng() * TAU, r0 = 0.3 + rng() * 1.2, r1 = 1.2 + rng() * 2.2;
    const start = [Math.cos(a) * r0, y0 + rng() * 2.5, Math.sin(a) * r0];
    const end = [Math.cos(a + 0.6) * r1, y0 + H + 0.5 + rng() * 1.5, Math.sin(a + 0.6) * r1];
    const ctrl = add(lerp3(start, end, 0.5), [(rng() - 0.5) * 1.5, 0, (rng() - 0.5) * 1.5]);
    sp.push(end, { pivot: add(start, scatter(rng, 1, 3)), off: sub(start, end), axis: ctrl, delay: 0.85 + rng() * 0.1, size: 0.03 + rng() * 0.04, phase: rng(), bright: 0.55, col: rng() < 0.3 ? COL.paper : COL.mint, acc: rng() < 0.05 ? 1 : 0, ext: [rng(), 0.05 + rng() * 0.05, 0, 0] });
  }
  body.add(L(sl, U, { GROW: "" }), P(tipB, U, { GROW: "" }), P(sp, U, { STREAM: "" }));
  return { body, r: 3.5, rh: 4.0, ty: 0.2, stemTop: null, update() {} };
}

const BUILDERS = [null, buildConsult, buildTransform, buildBuild, buildOperate, buildSecure, buildSolve, buildGrow];
export const HEIGHTS = [0, 4.4, 4.4, 4.1, 3.7, 4.3, 4.3, 4.3];

// Station root: marker bead on the cusp + sculpture body (scaled/lifted in the finale).
// The bead has its own uniforms so it can glint ahead of time ("the path leads somewhere").
export function buildStation(k, { G, q, seed }) {
  const rng = mulberry32(seed);
  const S = { uAssemble: { value: 0 }, uActive: { value: 0 }, uGlow: { value: 1 }, uSizeScale: { value: 1 }, uBead: { value: new THREE.Vector3() } };
  const U = { ...G, ...S };
  const h = HEIGHTS[k];
  const sc = BUILDERS[k]({ rng, U, q, h });
  const root = new THREE.Group();
  root.add(sc.body);
  sc.body.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(sc.body);
  const SB = { uActive: { value: 0 }, uGlow: { value: 0 }, uSizeScale: { value: 1 } };
  const UB = { ...U, ...SB };
  const mb = new Buf();
  pt(mb, rng, [0, -h, 0], { col: COL.paper, size: 0.2, bright: 1.4, acc: 0.7, delay: 0 });
  pt(mb, rng, [0, -h, 0], { col: COL.mint, size: 1.0, bright: 0.3, delay: 0 });
  const marker = P(mb, UB, { STATIC: "" });
  root.add(marker);
  // socket: small hot point where the energy stem meets the sculpture
  const kb = new Buf();
  pt(kb, rng, [0, 0, 0], { col: COL.paper, size: 0.12, bright: 1.1, delay: 0 });
  pt(kb, rng, [0, 0, 0], { col: COL.mint, size: 0.55, bright: 0.25, delay: 0 });
  const SK = { uActive: { value: 0 }, uGlow: { value: 0 }, uSizeScale: { value: 1 } };
  const socket = P(kb, { ...U, ...SK }, { STATIC: "" });
  root.add(socket);
  const stemTop = sc.stemTop ?? -h + 0.2;
  return { root, body: sc.body, S, SB, SK, marker, socket, h, r: sc.r, rh: sc.rh, ty: sc.ty || 0, stemTop, bot: bb.min.y, top: bb.max.y, update: sc.update };
}

// Ambient motes for depth/parallax.
export function buildDust({ G, q, bounds, seed }) {
  const rng = mulberry32(seed);
  const S = { uAssemble: { value: 1 }, uActive: { value: 0 }, uGlow: { value: 0.6 }, uSizeScale: { value: 1 } };
  const U = { ...G, ...S };
  const b = new Buf();
  const n = Math.round(1700 * q);
  for (let i = 0; i < n; i++) {
    const p = [bounds.min.x + rng() * (bounds.max.x - bounds.min.x), bounds.min.y + rng() * (bounds.max.y - bounds.min.y), bounds.min.z + rng() * (bounds.max.z - bounds.min.z)];
    const r = rng();
    b.push(p, { pivot: p, off: [0, 0, 0], delay: 0, size: 0.05 + r * r * 0.16, phase: rng(), bright: 0.18 + rng() * 0.4, col: rng() < 0.25 ? COL.mint : rng() < 0.5 ? COL.t400 : COL.t500 });
  }
  const o = P(b, U, { STATIC: "" });
  return { obj: o, S };
}

// Round, bright terminals for the two ends of the path (finale: echo the logo smile caps).
export function buildTerminal({ G, seed }) {
  const rng = mulberry32(seed);
  const S = { uAssemble: { value: 1 }, uActive: { value: 0 }, uGlow: { value: 0 }, uSizeScale: { value: 1 } };
  const b = new Buf();
  pt(b, rng, [0, 0, 0], { col: COL.paper, size: 0.55, bright: 1.2, delay: 0 });
  pt(b, rng, [0, 0, 0], { col: COL.mint, size: 2.6, bright: 0.32, delay: 0 });
  return { obj: P(b, { ...G, ...S }, { STATIC: "" }), S };
}
