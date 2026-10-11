// Procedural generation for "The digital tree" (seeded, built once at load).
// Everything here is CPU-side and runs a single time; the render loop only updates uniforms.
import * as THREE from "three";

const V3 = THREE.Vector3;
type Vec3 = THREE.Vector3;
const UP = new V3(0, 1, 0);
const XA = new V3(1, 0, 0);
export const DEG = Math.PI / 180;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const sstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export type Win = readonly [number, number];
export const sstepW = (w: Win, v: number) => sstep(w[0], w[1], v);
export type Rng = () => number;

export function mulberry32(a: number): Rng {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// inverse of smoothstep's cubic (3x^2 - 2x^3)
function invSmooth(y: number) {
  y = clamp01(y);
  return 0.5 - Math.sin(Math.asin(1 - 2 * y) / 3);
}

// ---------------------------------------------------------------------------------------------
// Story timeline in "story units" s = p * 9 (chapter k spans [k, k+1]; hero hold = [k+.25, k+.75]).
// All growth windows sit on chapter boundaries so every hero state is complete by k + 0.25.
// ---------------------------------------------------------------------------------------------
const W = (a: number, b: number): Win => [a, b];
export const TL = {
  // the seed opens only once the camera has pulled back from the intro close-up (camera settles by s ~ 1.02)
  seedOpen: W(0.88, 1.06),
  roots: W(0.92, 1.24),
  // index 0 is unused (chapter k = 1..7)
  trunk: [W(0, 0), W(0.93, 1.06), W(1.7, 1.92), W(2.7, 2.92), W(3.7, 3.92), W(4.7, 4.92), W(5.7, 5.92), W(6.7, 6.92)],
  branch: [W(0, 0), W(1.04, 1.24), W(1.8, 2.12), W(2.8, 3.12), W(3.8, 4.12), W(4.8, 5.12), W(5.8, 6.12), W(6.8, 7.12)],
  leaves: W(6.72, 7.24),
};
const winRev = (w: Win, l: number) => w[0] + (w[1] - w[0]) * invSmooth(l);

export const TREE = {
  trunkH: 4.8,
  H: [0.36, 1.75, 2.3, 2.8, 3.3, 3.8, 4.3], // attach heights of the 7 pillar branches
  TOP: [0, 0.5, 2.7, 3.05, 3.5, 3.95, 4.45, 4.8], // trunk height reached at the end of chapter k (ch1: a short sprout)
  L: [1.6, 3.4, 3.6, 3.5, 3.2, 2.8, 2.2],
  E: [40, 22, 17, 30, 37, 46, 64],
};

export interface Curve {
  pts: Vec3[];
  rad: number[];
  /** 0 roots, 1 trunk, 2..8 pillar branches 1..7 */
  group: number;
  level: number;
  parent: Curve | null;
  attach: number;
  children: Curve[];
  n: number;
  arc: Float32Array;
  /** group distance (growth order) */
  gd: Float32Array;
  /** path distance (pulse coordinate) */
  pd: Float32Array;
  /** growth order normalised per group, 0..1 */
  local: Float32Array;
}

export interface Fruit {
  pos: Vec3;
  r: number;
  rev: number;
}

export interface Tree {
  curves: Curve[];
  trunk: Curve;
  mains: Curve[];
  rootMains: Curve[];
  branchCurves: Curve[];
  rootCurves: Curve[];
  TOPL: number[];
  trunkRev: (l: number) => number;
  crownC: Vec3;
  crownR: number;
  rootExtent: number;
  fruits: Fruit[];
}

export interface FruitView {
  az: number;
  el: number;
  d?: number;
  dCrown?: number;
}

function randUnit(rng: Rng, out: Vec3) {
  const u = rng() * 2 - 1,
    th = rng() * Math.PI * 2,
    s = Math.sqrt(1 - u * u);
  return out.set(s * Math.cos(th), u, s * Math.sin(th));
}
function perp(t: Vec3, n: Vec3, b: Vec3) {
  n.crossVectors(t, Math.abs(t.y) > 0.9 ? XA : UP).normalize();
  b.crossVectors(t, n).normalize();
}
function hash3(x: number, y: number, z: number) {
  const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return h - Math.floor(h);
}

function newCurve(group: number, level: number, parent: Curve | null, attach: number): Curve {
  const e = new Float32Array(0);
  return { pts: [], rad: [], group, level, parent, attach, children: [], n: 0, arc: e, gd: e, pd: e, local: e };
}

interface BranchCfg {
  step: number[];
  up: number[];
  wander: number[];
  rEnd: number[];
  children: number[];
  maxLevel: number;
}
interface BranchOpts {
  start: Vec3;
  dir: Vec3;
  len: number;
  r0: number;
  level: number;
  group: number;
  parent: Curve;
  attach: number;
}

function growBranch(o: BranchOpts, rng: Rng, curves: Curve[], cfg: BranchCfg): Curve {
  const c = newCurve(o.group, o.level, o.parent, o.attach);
  curves.push(c);
  if (o.parent && o.parent.group !== 1) o.parent.children.push(c);
  c.pts.push(o.start.clone());
  c.rad.push(o.r0);
  const n = Math.max(5, Math.round(o.len / cfg.step[o.level]));
  const ds = o.len / n;
  const d = o.dir.clone().normalize(),
    p = o.start.clone(),
    j = new V3();
  const up = cfg.up[o.level],
    wander = cfg.wander[o.level],
    rEnd = o.r0 * cfg.rEnd[o.level];
  for (let i = 1; i <= n; i++) {
    randUnit(rng, j);
    d.addScaledVector(j, wander * ds).addScaledVector(UP, up * ds).normalize();
    p.addScaledVector(d, ds);
    c.pts.push(p.clone());
    c.rad.push(lerp(o.r0, rEnd, Math.pow(i / n, 0.85)));
  }
  if (o.level < cfg.maxLevel) {
    const nc = cfg.children[o.level];
    let rot = rng() * Math.PI * 2;
    const t0 = new V3(),
      nn = new V3(),
      bb = new V3(),
      side = new V3();
    for (let m = 0; m < nc; m++) {
      const t = lerp(0.26, 0.9, (m + 0.25 + 0.5 * rng()) / nc);
      const idx = Math.max(1, Math.min(n - 1, Math.round(t * n)));
      t0.subVectors(c.pts[idx + 1], c.pts[idx - 1]).normalize();
      perp(t0, nn, bb);
      rot += 2.39996 + (rng() - 0.5) * 0.5; // golden-angle phyllotaxis
      side.copy(nn).multiplyScalar(Math.cos(rot)).addScaledVector(bb, Math.sin(rot));
      const ang = (38 + rng() * 26) * DEG;
      const cd = t0.clone().multiplyScalar(Math.cos(ang)).addScaledVector(side, Math.sin(ang)).addScaledVector(UP, 0.22).normalize();
      // level-3 twigs are kept short so the crown reads as grown wood, not needles
      const clen = o.len * lerp(0.42, 0.6, rng()) * (1 - 0.3 * t) * (o.level + 1 === 3 ? 0.7 : 1);
      growBranch(
        { start: c.pts[idx], dir: cd, len: clen, r0: c.rad[idx] * 0.72, level: o.level + 1, group: o.group, parent: c, attach: idx },
        rng,
        curves,
        cfg,
      );
    }
  }
  return c;
}

interface RootOpts {
  start: Vec3;
  dir: Vec3;
  len: number;
  r0: number;
  level: number;
  parent: Curve | null;
  attach: number;
}

function growRoot(o: RootOpts, rng: Rng, curves: Curve[]): Curve {
  const c = newCurve(0, o.level, o.parent, o.attach);
  curves.push(c);
  if (o.parent) o.parent.children.push(c);
  const n = Math.max(6, Math.round(o.len / 0.1));
  const ds = o.len / n;
  const d = new V3(o.dir.x, 0, o.dir.z).normalize();
  const p = o.start.clone();
  let turn = (rng() - 0.5) * 0.4;
  for (let i = 0; i <= n; i++) {
    if (i > 0) {
      turn = turn * 0.9 + (rng() - 0.5) * 0.35;
      d.applyAxisAngle(UP, turn * ds * 1.2);
      p.addScaledVector(d, ds);
    }
    const r = lerp(o.r0, o.r0 * 0.12, Math.pow(i / n, 0.7));
    c.pts.push(new V3(p.x, r * 0.3 + 0.004, p.z));
    c.rad.push(r);
  }
  if (o.level < 2) {
    const nc = o.level === 0 ? 3 : 2;
    const tan = new V3();
    for (let m = 0; m < nc; m++) {
      const t = lerp(0.18, 0.8, (m + 0.3 + 0.4 * rng()) / nc);
      const idx = Math.max(1, Math.min(n - 1, Math.round(t * n)));
      tan.subVectors(c.pts[idx + 1], c.pts[idx - 1]).setY(0).normalize();
      const sign = (m % 2 ? 1 : -1) * (rng() < 0.75 ? 1 : -1);
      const cd = tan.clone().applyAxisAngle(UP, sign * (28 + rng() * 30) * DEG);
      growRoot(
        { start: c.pts[idx].clone(), dir: cd, len: o.len * lerp(0.3, 0.5, rng()) * (1 - 0.3 * t), r0: c.rad[idx] * 0.75, level: o.level + 1, parent: c, attach: idx },
        rng,
        curves,
      );
    }
  }
  return c;
}

// ---------------------------------------------------------------------------------------------
export function generateTree({
  thetas,
  mobile,
  fruitViews = [],
  textAz = null,
  seed = 90417,
}: {
  thetas: number[];
  mobile: boolean;
  fruitViews?: FruitView[];
  textAz?: number | null;
  seed?: number;
}): Tree {
  const rng = mulberry32(seed);
  const curves: Curve[] = [];
  const T = TREE;
  const nT = 96;

  // trunk
  const trunk = newCurve(1, 0, null, 0);
  for (let i = 0; i <= nT; i++) {
    const y = (i / nT) * T.trunkH,
      f = y / T.trunkH;
    // a gentle S-curve and a flared root collar: grown, not extruded
    trunk.pts.push(new V3(0.2 * Math.sin(y * 0.7 + 0.3) * f, y, 0.11 * Math.sin(y * 0.65 + 2.0) * f));
    trunk.rad.push(lerp(0.22, 0.05, Math.pow(f, 0.75)) + 0.18 * Math.exp(-y * 3));
  }
  curves.push(trunk);

  // the 7 pillar branches (branch k faces the camera's right-front during chapter k)
  const cfg: BranchCfg = {
    step: [0.085, 0.07, 0.06, 0.05],
    up: [0.14, 0.26, 0.34, 0.15],
    wander: [0.35, 0.55, 0.91, 1.04],
    rEnd: [0.3, 0.32, 0.36, 0.5],
    children: mobile ? [5, 3, 0] : [6, 3, 2],
    maxLevel: mobile ? 2 : 3,
  };
  // CONSULT (branch 1) is the seedling's first shoot: small, low, two bud-tipped twigs.
  const cfg1: BranchCfg = { ...cfg, children: [2, 0, 0], maxLevel: 1 };
  const mains: Curve[] = [];
  for (let k = 0; k < 7; k++) {
    const idx = Math.round((T.H[k] / T.trunkH) * nT);
    const phi = (thetas[k] + 70) * DEG,
      e = T.E[k] * DEG;
    const dir = new V3(Math.sin(phi) * Math.cos(e), Math.sin(e), Math.cos(phi) * Math.cos(e));
    const r0 = trunk.rad[idx] * (k === 0 ? 0.5 : 0.72);
    mains.push(
      growBranch({ start: trunk.pts[idx], dir, len: T.L[k], r0, level: 0, group: k + 2, parent: trunk, attach: idx }, rng, curves, k === 0 ? cfg1 : cfg),
    );
  }

  // roots
  const rootMains: Curve[] = [];
  const nR = mobile ? 10 : 12;
  for (let i = 0; i < nR; i++) {
    const a = ((i + 0.35 * rng()) / nR) * Math.PI * 2;
    const dir = new V3(Math.cos(a), 0, Math.sin(a));
    let len = 2.4 + rng() * 2.6;
    // roots that would run behind the text column in the CONSULT shot are kept at ~70%
    if (textAz !== null) len *= 1 - 0.3 * sstep(0.1, 0.7, -Math.cos(a + textAz * DEG));
    rootMains.push(growRoot({ start: dir.clone().multiplyScalar(0.1), dir, len, r0: 0.042, level: 0, parent: null, attach: 0 }, rng, curves));
  }

  // arc length, group distance (growth order), path distance (pulse coordinate)
  const maxG = new Float32Array(9);
  for (const c of curves) {
    const n = (c.n = c.pts.length);
    c.arc = new Float32Array(n);
    for (let i = 1; i < n; i++) c.arc[i] = c.arc[i - 1] + c.pts[i].distanceTo(c.pts[i - 1]);
    c.gd = new Float32Array(n);
    c.pd = new Float32Array(n);
    const par = c.parent;
    let g0 = 0,
      p0 = 0;
    if (c.group === 0) g0 = par ? par.gd[c.attach] : 0.1;
    else if (c.group === 1) g0 = 0;
    else if (par === trunk) p0 = trunk.pd[c.attach];
    else if (par) {
      g0 = par.gd[c.attach];
      p0 = par.pd[c.attach];
    }
    for (let i = 0; i < n; i++) {
      c.gd[i] = g0 + c.arc[i];
      c.pd[i] = c.group === 0 ? -c.gd[i] : p0 + c.arc[i];
      maxG[c.group] = Math.max(maxG[c.group], c.gd[i]);
    }
  }
  for (const c of curves) {
    c.local = new Float32Array(c.n);
    for (let i = 0; i < c.n; i++) c.local[i] = c.gd[i] / maxG[c.group];
  }

  // trunk tops -> local growth values
  const TOPL = T.TOP.map((h, k) => (k === 0 ? 0 : k === 7 ? 1 : trunk.local[Math.round((h / T.trunkH) * nT)]));
  const trunkRev = (l: number) => {
    for (let k = 1; k <= 7; k++) {
      if (l <= TOPL[k] + 1e-6) return winRev(TL.trunk[k], (l - TOPL[k - 1]) / Math.max(1e-6, TOPL[k] - TOPL[k - 1]));
    }
    return TL.trunk[7][1];
  };

  const branchCurves = curves.filter((c) => c.group >= 2);
  const rootCurves = curves.filter((c) => c.group === 0);

  // crown bounds
  const box = new THREE.Box3();
  for (const c of branchCurves) for (const p of c.pts) box.expandByPoint(p);
  const crownC = box.getCenter(new V3());
  let crownR = 0;
  for (const c of branchCurves) for (const p of c.pts) crownR = Math.max(crownR, p.distanceTo(crownC));
  let rootExtent = 0;
  for (const c of rootCurves) for (const p of c.pts) rootExtent = Math.max(rootExtent, Math.abs(p.x), Math.abs(p.z));
  rootExtent += 0.8;

  // fruits: three tips of branch 6 (SOLVE), picked so they stay well apart ON SCREEN from each of the
  // ch6 / ch7 / finale cameras (worst of the three views), not merely in 3D.
  const kids = [mains[5], ...mains[5].children];
  const views = fruitViews.map((v) => {
    const az = v.az * DEG,
      el = v.el * DEG;
    const back = new V3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
    const right = new V3().crossVectors(UP, back).normalize();
    const up = new V3().crossVectors(back, right).normalize();
    return { right, up, d: v.d ?? (v.dCrown ?? 4.5) * crownR };
  });
  const tipOf = (c: Curve) => c.pts[c.n - 1];
  // per view: smallest on-screen gap (angular) scaled by how triangular the layout is, so three fruits
  // never line up into a column ("traffic light") from any of the three cameras
  const proj = (p: Vec3, v: (typeof views)[number]) => [p.dot(v.right) / v.d, p.dot(v.up) / v.d];
  const score = (pa: Vec3, pb: Vec3, pc: Vec3) => {
    if (!views.length) return Math.min(pa.distanceTo(pb), pb.distanceTo(pc), pa.distanceTo(pc));
    let worst = Infinity;
    for (const v of views) {
      const A = proj(pa, v),
        B = proj(pb, v),
        C = proj(pc, v);
      const ab = Math.hypot(A[0] - B[0], A[1] - B[1]),
        bc = Math.hypot(B[0] - C[0], B[1] - C[1]),
        ca = Math.hypot(C[0] - A[0], C[1] - A[1]);
      const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) * 0.5;
      const shape = (4 * Math.sqrt(3) * area) / Math.max(1e-9, ab * ab + bc * bc + ca * ca);
      worst = Math.min(worst, Math.min(ab, bc, ca) * (0.35 + 0.65 * shape));
    }
    return worst;
  };
  let best: Curve[] = [kids[0], kids[1 % kids.length], kids[2 % kids.length]],
    bestD = -1;
  for (let a = 0; a < kids.length; a++)
    for (let b = a + 1; b < kids.length; b++)
      for (let c = b + 1; c < kids.length; c++) {
        const d = score(tipOf(kids[a]), tipOf(kids[b]), tipOf(kids[c]));
        if (d > bestD) {
          bestD = d;
          best = [kids[a], kids[b], kids[c]];
        }
      }
  const fruitR = [0.24, 0.2, 0.22];
  const fruits: Fruit[] = best.map((c, j) => {
    const tip = c.pts[c.n - 1],
      prev = c.pts[c.n - 2];
    const dir = tip.clone().sub(prev).normalize();
    const pos = tip.clone().addScaledVector(dir, fruitR[j] * 0.7);
    return { pos, r: fruitR[j], rev: winRev(TL.branch[6], c.local[c.n - 1]) };
  });
  fruits.sort((a, b) => a.rev - b.rev);

  return { curves, trunk, mains, rootMains, branchCurves, rootCurves, TOPL, trunkRev, crownC, crownR, rootExtent, fruits };
}

// ---------------------------------------------------------------------------------------------
// Tube geometry: centre line in `position`, radial offset in `aOffset` (so the shader can taper
// the growing tip), plus aData = (growth local 0..1, path distance, group, radius) and aAng.
export function buildTubeGeometry(curves: Curve[], radialFor: (c: Curve) => number): THREE.BufferGeometry {
  let nv = 0,
    ni = 0;
  for (const c of curves) {
    const R = radialFor(c);
    nv += c.n * (R + 1);
    ni += (c.n - 1) * R * 6;
  }
  const pos = new Float32Array(nv * 3),
    off = new Float32Array(nv * 3),
    dat = new Float32Array(nv * 4),
    ang = new Float32Array(nv);
  const idx = new Uint32Array(ni);
  const Tn = new V3(),
    Nn = new V3(),
    Bn = new V3(),
    prevT = new V3(),
    axis = new V3(),
    tmp = new V3();
  let v = 0,
    q = 0;
  for (const c of curves) {
    const R = radialFor(c),
      n = c.n,
      base = v;
    for (let i = 0; i < n; i++) {
      Tn.subVectors(c.pts[Math.min(n - 1, i + 1)], c.pts[Math.max(0, i - 1)]).normalize();
      if (i === 0) perp(Tn, Nn, Bn);
      else {
        axis.crossVectors(prevT, Tn);
        const l = axis.length();
        if (l > 1e-6) Nn.applyAxisAngle(axis.multiplyScalar(1 / l), Math.acos(Math.min(1, Math.max(-1, prevT.dot(Tn)))));
        Bn.crossVectors(Tn, Nn).normalize();
        Nn.crossVectors(Bn, Tn).normalize();
      }
      prevT.copy(Tn);
      const p = c.pts[i],
        r = c.rad[i];
      for (let j = 0; j <= R; j++) {
        const th = (j / R) * Math.PI * 2;
        tmp.copy(Nn).multiplyScalar(Math.cos(th)).addScaledVector(Bn, Math.sin(th)).multiplyScalar(r);
        pos[v * 3] = p.x;
        pos[v * 3 + 1] = p.y;
        pos[v * 3 + 2] = p.z;
        off[v * 3] = tmp.x;
        off[v * 3 + 1] = tmp.y;
        off[v * 3 + 2] = tmp.z;
        dat[v * 4] = c.local[i];
        dat[v * 4 + 1] = c.pd[i];
        dat[v * 4 + 2] = c.group;
        dat[v * 4 + 3] = r;
        ang[v] = j / R;
        v++;
      }
    }
    for (let i = 0; i < n - 1; i++)
      for (let j = 0; j < R; j++) {
        const a = base + i * (R + 1) + j,
          b = a + R + 1;
        idx[q++] = a;
        idx[q++] = a + 1;
        idx[q++] = b;
        idx[q++] = a + 1;
        idx[q++] = b + 1;
        idx[q++] = b;
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aOffset", new THREE.BufferAttribute(off, 3));
  g.setAttribute("aData", new THREE.BufferAttribute(dat, 4));
  g.setAttribute("aAng", new THREE.BufferAttribute(ang, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

// ---------------------------------------------------------------------------------------------
// Ground map: R = growth order of the nearest root (so the grid lights up along root paths as
// they grow), G = soft glow falloff around root paths.
export function buildRootMap(tree: Tree, size: number): THREE.DataTexture {
  const ext = tree.rootExtent;
  const toPx = (x: number) => (x / (2 * ext) + 0.5) * size;
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return c;
  };
  const cG = mk(),
    cR = mk();
  const g = cG.getContext("2d", { willReadFrequently: true });
  const r = cR.getContext("2d", { willReadFrequently: true });
  if (!g || !r) throw new Error("2D canvas unavailable");
  const k = size / 1024;
  g.fillStyle = "#000";
  g.fillRect(0, 0, size, size);
  g.globalCompositeOperation = "lighter";
  g.lineCap = "round";
  g.lineJoin = "round";
  const passes: [number, number][] = [
    [34, 0.045],
    [20, 0.07],
    [11, 0.12],
    [5, 0.25],
    [2, 0.6],
  ];
  for (const [w, a] of passes) {
    g.strokeStyle = `rgba(255,255,255,${a})`;
    for (const c of tree.rootCurves) {
      g.lineWidth = w * k * (c.level === 0 ? 1 : c.level === 1 ? 0.75 : 0.55);
      g.beginPath();
      for (let i = 0; i < c.n; i++) {
        const p = c.pts[i];
        if (i) g.lineTo(toPx(p.x), toPx(p.z));
        else g.moveTo(toPx(p.x), toPx(p.z));
      }
      g.stroke();
    }
  }
  // order channel: background = 1 (never lit); lower orders drawn last so they win overlaps
  r.fillStyle = "rgb(255,0,0)";
  r.fillRect(0, 0, size, size);
  r.lineCap = "round";
  const segs: [Vec3, Vec3, number][] = [];
  for (const c of tree.rootCurves) for (let i = 0; i < c.n - 1; i++) segs.push([c.pts[i], c.pts[i + 1], c.local[i]]);
  segs.sort((a, b) => b[2] - a[2]);
  r.lineWidth = 44 * k;
  for (const [a, b, l] of segs) {
    r.strokeStyle = `rgb(${Math.round(l * 250)},0,0)`;
    r.beginPath();
    r.moveTo(toPx(a.x), toPx(a.z));
    r.lineTo(toPx(b.x), toPx(b.z));
    r.stroke();
  }
  const dg = g.getImageData(0, 0, size, size).data,
    dr = r.getImageData(0, 0, size, size).data;
  const out = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = dr[i * 4];
    out[i * 4 + 1] = dg[i * 4];
    out[i * 4 + 2] = 0;
    out[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(out, size, size, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------------------------
// Sap / data paths: inner root -> trunk -> pillar branch (-> twig). Texture rows 0..NP-1 hold
// xyz + story time at which that point exists; rows NP..2NP-1 hold (tube radius, section 0 root /
// 1 trunk / 2 branch, decision flag, warped path length).
// The first NPd paths are the TRANSFORM "decision" streams: they end at the tip of branch 2.
// Samples are spaced by a warped length (trunk counts 1.1x, roots 0.8x) so the rising column is dense
// without stacking into a solid bundle.
export function buildSapTexture(tree: Tree, NP: number, NS: number, NPd = 0): THREE.DataTexture {
  const data = new Float32Array(NS * NP * 2 * 4);
  const { trunk, mains, rootMains } = tree;
  const P: Vec3[] = [],
    R: number[] = [],
    REV: number[] = [],
    SEC: number[] = [],
    WT: number[] = [];
  const push = (p: Vec3, r: number, rev: number, sec: number, w: number) => {
    P.push(p);
    R.push(r);
    REV.push(rev);
    SEC.push(sec);
    WT.push(w);
  };
  const nR = rootMains.length;
  for (let j = 0; j < NP; j++) {
    P.length = 0;
    R.length = 0;
    REV.length = 0;
    SEC.length = 0;
    WT.length = 0;
    const isD = j < NPd;
    const jj = isD ? j : j - NPd;
    const root = rootMains[j % nR];
    const bi = isD ? 1 : (jj * 3 + Math.floor(jj / nR)) % 7;
    const main = mains[bi];
    const kid = !isD && main.children.length && jj % 3 !== 0 ? main.children[(jj * 7) % main.children.length] : null;
    // only the inner part of each root carries sap (the outer roots stay calm)
    const rootLen = 1.5 + 0.7 * hash3(j, 3, 7);
    let r0 = 0;
    while (r0 < root.n - 1 && root.arc[r0 + 1] <= rootLen) r0++;
    for (let i = r0; i >= 0; i--) push(root.pts[i], root.rad[i], winRev(TL.roots, root.local[i]), 0, 0.8);
    for (let i = 0; i <= main.attach; i++) push(trunk.pts[i], trunk.rad[i], tree.trunkRev(trunk.local[i]), 1, 1.1);
    const end = kid ? kid.attach : main.n - 1;
    for (let i = 1; i <= end; i++) push(main.pts[i], main.rad[i], winRev(TL.branch[bi + 1], main.local[i]), 2, 1);
    if (kid) for (let i = 1; i < kid.n; i++) push(kid.pts[i], kid.rad[i], winRev(TL.branch[bi + 1], kid.local[i]), 2, 1);
    const acc = [0];
    for (let i = 1; i < P.length; i++) acc.push(acc[i - 1] + P[i].distanceTo(P[i - 1]) * 0.5 * (WT[i] + WT[i - 1]));
    const total = acc[acc.length - 1];
    let seg = 0;
    for (let k = 0; k < NS; k++) {
      const target = (k / (NS - 1)) * total;
      while (seg < P.length - 2 && acc[seg + 1] < target) seg++;
      const f = clamp01((target - acc[seg]) / Math.max(1e-6, acc[seg + 1] - acc[seg]));
      const a = P[seg],
        b = P[seg + 1];
      const o = (j * NS + k) * 4;
      data[o] = lerp(a.x, b.x, f);
      data[o + 1] = lerp(a.y, b.y, f);
      data[o + 2] = lerp(a.z, b.z, f);
      data[o + 3] = Math.max(REV[seg], REV[seg + 1]);
      const o2 = ((NP + j) * NS + k) * 4;
      data[o2] = lerp(R[seg], R[seg + 1], f);
      data[o2 + 1] = lerp(SEC[seg], SEC[seg + 1], f);
      data[o2 + 2] = isD ? 1 : 0;
      data[o2 + 3] = total;
    }
  }
  const tex = new THREE.DataTexture(data, NS, NP * 2, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

export function buildSapParticles(NP: number, count: number, rng: Rng): THREE.BufferGeometry {
  const pos = new Float32Array(count * 3),
    path = new Float32Array(count),
    rnd = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    path[i] = i % NP;
    // phase, speed, radial jitter (on the camera-facing tube surface), angle across that half (-1..1)
    rnd[i * 4] = rng();
    rnd[i * 4 + 1] = rng();
    rnd[i * 4 + 2] = rng();
    rnd[i * 4 + 3] = rng() * 2 - 1;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aPath", new THREE.BufferAttribute(path, 1));
  g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  return g;
}

// ---------------------------------------------------------------------------------------------
// Particles are drawn as instanced camera-facing quads (much cheaper than GL points on ANGLE/D3D11).
// The per-particle `position` becomes the instanced attribute `aPos`; the base quad is `position`.
const QUAD_POS = [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0];
const QUAD_IDX = [0, 1, 2, 0, 2, 3];
export function toQuads(src: THREE.BufferGeometry): THREE.InstancedBufferGeometry {
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(QUAD_POS), 3));
  g.setIndex(QUAD_IDX);
  let count = 0;
  for (const [name, attr] of Object.entries(src.attributes)) {
    const a = attr as THREE.BufferAttribute;
    g.setAttribute(name === "position" ? "aPos" : name, new THREE.InstancedBufferAttribute(a.array as Float32Array, a.itemSize));
    count = a.count;
  }
  g.instanceCount = count;
  src.dispose();
  return g;
}

// ---------------------------------------------------------------------------------------------
// Canopy leaves: burst from their twig to their final place during chapter 7.
// Leaves fill a lumpy crown envelope (so the silhouette reads as one full canopy), but only where a
// real twig is close by; each leaf bursts out of that nearest twig.
export function buildLeaves(tree: Tree, count: number, rng: Rng): THREE.BufferGeometry {
  // twig points (curve, index) on a spatial grid
  const twigs: [Curve, number][] = [];
  for (const c of tree.branchCurves) {
    if (c.level === 0) continue;
    for (let i = Math.floor(c.n * 0.3); i < c.n; i += 1) twigs.push([c, i]);
  }
  const pt = (t: number) => twigs[t][0].pts[twigs[t][1]];
  const cell = 0.9,
    grid = new Map<string, number[]>();
  const key = (x: number, y: number, z: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
  const env = new V3();
  for (let t = 0; t < twigs.length; t++) {
    const p = pt(t);
    env.add(p);
    const k = key(p.x, p.y, p.z);
    let arr = grid.get(k);
    if (!arr) grid.set(k, (arr = []));
    arr.push(t);
  }
  env.multiplyScalar(1 / twigs.length);
  const hd: number[] = [],
    vd: number[] = [];
  for (let t = 0; t < twigs.length; t++) {
    const p = pt(t);
    hd.push(Math.hypot(p.x - env.x, p.z - env.z));
    vd.push(Math.abs(p.y - env.y));
  }
  hd.sort((a, b) => a - b);
  vd.sort((a, b) => a - b);
  const rx = hd[Math.floor(hd.length * 0.93)] + 0.35,
    ry = vd[Math.floor(vd.length * 0.93)] + 0.3;
  const nearest = (p: Vec3): [number, number] => {
    let best = -1,
      bd = 1e9;
    const cx = Math.floor(p.x / cell),
      cy = Math.floor(p.y / cell),
      cz = Math.floor(p.z / cell);
    for (let dx = -1; dx <= 1; dx++)
      for (let dy = -1; dy <= 1; dy++)
        for (let dz = -1; dz <= 1; dz++) {
          const arr = grid.get(`${cx + dx},${cy + dy},${cz + dz}`);
          if (!arr) continue;
          for (const t of arr) {
            const d = pt(t).distanceToSquared(p);
            if (d < bd) {
              bd = d;
              best = t;
            }
          }
        }
    return [best, Math.sqrt(bd)];
  };
  const lump = (x: number, y: number, z: number) =>
    1 + 0.12 * Math.sin(x * 1.7 + y * 0.9) * Math.sin(z * 1.9 - y * 1.3) + 0.08 * Math.sin(x * 3.1 + z * 2.3 + y * 2.9);

  const pos = new Float32Array(count * 3),
    org = new Float32Array(count * 3),
    rnd = new Float32Array(count * 4),
    tim = new Float32Array(count * 2),
    grp = new Float32Array(count);
  const j = new V3(),
    T = new V3();
  for (let m = 0; m < count; m++) {
    let t = -1;
    for (let tries = 0; tries < 24; tries++) {
      randUnit(rng, j);
      const r = Math.pow(rng(), 0.3) * lump(j.x * 3, j.y * 3, j.z * 3);
      T.set(env.x + j.x * rx * r, env.y + j.y * ry * r, env.z + j.z * rx * r);
      const [b, d] = nearest(T);
      if (b >= 0 && d < 0.75 - 0.25 * rng()) {
        t = b;
        break;
      }
      if (tries === 23 && b >= 0) {
        t = b;
        T.lerp(pt(b), 0.6);
      }
    }
    if (t < 0) {
      t = 0;
      T.copy(pt(0));
    }
    const [c, i] = twigs[t];
    const P = c.pts[i];
    const order = clamp01(Math.hypot((T.x - env.x) / rx, (T.y - env.y) / ry, (T.z - env.z) / rx));
    const dur = 0.12 + 0.07 * rng();
    const anchorRev = winRev(TL.branch[c.group - 1], c.local[i]);
    let start = Math.max(anchorRev + 0.015, TL.leaves[0] + order * 0.28 + rng() * 0.05);
    start = Math.min(start, TL.leaves[1] - dur);
    pos[m * 3] = T.x;
    pos[m * 3 + 1] = T.y;
    pos[m * 3 + 2] = T.z;
    org[m * 3] = P.x;
    org[m * 3 + 1] = P.y;
    org[m * 3 + 2] = P.z;
    rnd[m * 4] = rng();
    rnd[m * 4 + 1] = rng();
    rnd[m * 4 + 2] = rng();
    rnd[m * 4 + 3] = rng();
    tim[m * 2] = start;
    tim[m * 2 + 1] = dur;
    grp[m] = c.group;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aOrigin", new THREE.BufferAttribute(org, 3));
  g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  g.setAttribute("aTime", new THREE.BufferAttribute(tim, 2));
  g.setAttribute("aGroup", new THREE.BufferAttribute(grp, 1));
  return g;
}

// ---------------------------------------------------------------------------------------------
// Fireflies (inside the crown) + ambient motes (wide volume).
export function buildFireflies(tree: Tree, nFire: number, nMotes: number, rng: Rng): THREE.BufferGeometry {
  const n = nFire + nMotes;
  const pos = new Float32Array(n * 3),
    rnd = new Float32Array(n * 4);
  const { crownC, crownR } = tree;
  for (let i = 0; i < n; i++) {
    const fire = i < nFire;
    let x: number, y: number, z: number;
    if (fire) {
      const u = rng() * 2 - 1,
        th = rng() * Math.PI * 2,
        s = Math.sqrt(1 - u * u),
        rr = Math.cbrt(rng()) * crownR * 1.05;
      x = crownC.x + s * Math.cos(th) * rr;
      y = Math.max(0.4, crownC.y + u * rr * 0.8);
      z = crownC.z + s * Math.sin(th) * rr;
    } else {
      const th = rng() * Math.PI * 2,
        rr = 1.5 + Math.sqrt(rng()) * 16;
      x = Math.cos(th) * rr;
      y = 0.15 + rng() * 9;
      z = Math.sin(th) * rr;
    }
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    rnd[i * 4] = rng();
    rnd[i * 4 + 1] = rng();
    rnd[i * 4 + 2] = fire ? 0.25 + rng() * 0.45 : 0.2 + rng() * 0.5;
    rnd[i * 4 + 3] = fire ? 1 : 0;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  return g;
}

// ---------------------------------------------------------------------------------------------
// BUILD: modules that clad branch 3 (group 4) in 2-3 tight, brick-offset rows, snapping on in sequence
// from the trunk outward right behind the growing tip. Each block carries its order along the branch.
export interface Block {
  m: THREE.Matrix4;
  from: Vec3;
  inward: Vec3;
  rev: number;
  key: number;
  order: number;
  start: number;
  dur: number;
}
export function buildBlocks(tree: Tree, rng: Rng, maxCount: number, scale = 1): Block[] {
  const Tn = new V3(),
    Nn = new V3(),
    Bn = new V3(),
    prevT = new V3(),
    axis = new V3();
  const radial = new V3(),
    around = new V3(),
    P = new V3(),
    j = new V3();
  const q = new THREE.Quaternion(),
    basis = new THREE.Matrix4();
  const main = tree.mains[2];
  type Raw = Omit<Block, "order" | "start" | "dur">;
  const mainList: Raw[] = [],
    kidList: Raw[] = [];
  const curves = [main, ...main.children];
  let maxKey = 0;
  for (const c of curves) {
    const isMain = c === main;
    let rows = isMain ? 3 : 2;
    const out = isMain ? mainList : kidList;
    let next = isMain ? 0.12 : 0.02,
      station = 0;
    for (let i = 0; i < c.n - 1; i++) {
      Tn.subVectors(c.pts[i + 1], c.pts[Math.max(0, i - 1)]).normalize();
      if (i === 0) perp(Tn, Nn, Bn);
      else {
        axis.crossVectors(prevT, Tn);
        const l = axis.length();
        if (l > 1e-6) Nn.applyAxisAngle(axis.multiplyScalar(1 / l), Math.acos(Math.min(1, Math.max(-1, prevT.dot(Tn)))));
        Bn.crossVectors(Tn, Nn).normalize();
        Nn.crossVectors(Bn, Tn).normalize();
      }
      prevT.copy(Tn);
      if (c.arc[i] < next || (!isMain && c.local[i] > c.local[0] + (c.local[c.n - 1] - c.local[0]) * 0.6)) continue;
      const r = c.rad[i];
      const sz = Math.min(0.165, Math.max(0.05, r * 1.8)) * scale;
      next = c.arc[i] + sz * 1.08;
      rows = isMain && r > 0.045 ? 3 : 2;
      const wid = Math.min(sz * 1.35, ((Math.PI * 2 * (r * 0.8 + sz * 0.3)) / rows) * 0.88);
      for (let k = 0; k < rows; k++) {
        const ang = (k / rows) * Math.PI * 2 + (station % 2) * (Math.PI / rows) + i * 0.02;
        radial.copy(Nn).multiplyScalar(Math.cos(ang)).addScaledVector(Bn, Math.sin(ang)).normalize();
        around.crossVectors(Tn, radial).normalize();
        const lift = r * 0.7 + sz * 0.28;
        P.copy(c.pts[i]).addScaledVector(radial, lift);
        basis.makeBasis(Tn, radial, around);
        q.setFromRotationMatrix(basis);
        const len = sz * (0.9 + rng() * 0.1),
          hgt = sz * (0.7 + rng() * 0.16);
        randUnit(rng, j);
        const from = radial.clone().multiplyScalar(0.55 + rng() * 0.5).addScaledVector(UP, 0.35 + rng() * 0.4).addScaledVector(j, 0.2);
        const key = c.gd[i] + k * 0.004;
        maxKey = Math.max(maxKey, key);
        out.push({
          m: new THREE.Matrix4().compose(P.clone(), q.clone(), new V3(len, hgt, wid)),
          from,
          inward: radial.clone().multiplyScalar(-lift),
          rev: winRev(TL.branch[3], c.local[i]),
          key,
        });
      }
      station++;
    }
  }
  kidList.sort((a, b) => a.key - b.key);
  const chosen = [...mainList, ...kidList].slice(0, maxCount);
  chosen.sort((a, b) => a.key - b.key);
  const last = 3.22;
  return chosen.map((b) => {
    const dur = 0.07 + rng() * 0.035;
    return { ...b, order: b.key / maxKey, start: Math.min(b.rev + 0.012, last - dur), dur };
  });
}

// Buds: tiny mint points on twig tips (the sprout from CONSULT, the whole crown from OPERATE on), so
// the pre-bloom tree reads alive rather than as a bare winter sapling.
export function buildBuds(tree: Tree, rng: Rng, maxCount: number): THREE.BufferGeometry {
  const tips: { p: Vec3; rev: number; g: number; h: number }[] = [];
  for (const c of tree.branchCurves) {
    if (c.level === 0 && c.group !== 2) continue;
    const tip = c.pts[c.n - 1],
      prev = c.pts[c.n - 2];
    const d = tip.clone().sub(prev).normalize();
    tips.push({ p: tip.clone().addScaledVector(d, 0.012), rev: winRev(TL.branch[c.group - 1], c.local[c.n - 1]), g: c.group, h: rng() });
  }
  tips.sort((a, b) => a.h - b.h);
  const list = tips
    .filter((t) => t.g === 2)
    .concat(tips.filter((t) => t.g !== 2))
    .slice(0, maxCount);
  const n = list.length;
  const pos = new Float32Array(n * 3),
    rnd = new Float32Array(n * 4);
  list.forEach((t, i) => {
    pos.set([t.p.x, t.p.y, t.p.z], i * 3);
    rnd.set([t.rev, t.g, rng(), rng()], i * 4);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  return g;
}

// ---------------------------------------------------------------------------------------------
// SECURE: geodesic shell; hex (dual) cells drawn in the fragment shader from barycentrics.
export function buildShellGeometry(detail: number): THREE.BufferGeometry {
  const ico = new THREE.IcosahedronGeometry(1, detail);
  const src = ico.attributes.position;
  const n = src.count;
  const bary = new Float32Array(n * 3),
    ord = new Float32Array(n * 3);
  const orderOf = (x: number, y: number, z: number) => {
    const h = hash3(Math.round(x * 1000), Math.round(y * 1000), Math.round(z * 1000));
    return clamp01((y * 0.5 + 0.5) * 0.74 + h * 0.26);
  };
  for (let t = 0; t < n; t += 3) {
    const o0 = orderOf(src.getX(t), src.getY(t), src.getZ(t));
    const o1 = orderOf(src.getX(t + 1), src.getY(t + 1), src.getZ(t + 1));
    const o2 = orderOf(src.getX(t + 2), src.getY(t + 2), src.getZ(t + 2));
    for (let k = 0; k < 3; k++) {
      bary[(t + k) * 3 + k] = 1;
      ord[(t + k) * 3] = o0;
      ord[(t + k) * 3 + 1] = o1;
      ord[(t + k) * 3 + 2] = o2;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(src.array as ArrayLike<number>), 3));
  g.setAttribute("aBary", new THREE.BufferAttribute(bary, 3));
  g.setAttribute("aOrd", new THREE.BufferAttribute(ord, 3));
  ico.dispose();
  return g;
}

// ---------------------------------------------------------------------------------------------
// SOLVE: orbit rings + satellites around the three product fruits.
export function buildOrbits(fruits: Fruit[], rng: Rng): { lines: THREE.BufferGeometry; sats: THREE.BufferGeometry } {
  const segs = 96,
    perFruit = 2;
  const lines = new Float32Array(fruits.length * perFruit * segs * 2 * 3);
  const lineF = new Float32Array(fruits.length * perFruit * segs * 2);
  const nS = fruits.length * perFruit;
  const sc = new Float32Array(nS * 3),
    su = new Float32Array(nS * 3),
    sv = new Float32Array(nS * 3),
    sp = new Float32Array(nS * 3),
    sf = new Float32Array(nS);
  const ax = new V3(),
    u = new V3(),
    v = new V3(),
    a = new V3(),
    b = new V3();
  let li = 0,
    si = 0;
  fruits.forEach((f, fi) => {
    for (let k = 0; k < perFruit; k++) {
      randUnit(rng, ax);
      ax.addScaledVector(UP, 1.6).normalize();
      perp(ax, u, v);
      const rad = f.r * (k === 0 ? 1.9 : 2.55);
      for (let s = 0; s < segs; s++) {
        const t0 = (s / segs) * Math.PI * 2,
          t1 = ((s + 1) / segs) * Math.PI * 2;
        a.copy(f.pos).addScaledVector(u, Math.cos(t0) * rad).addScaledVector(v, Math.sin(t0) * rad);
        b.copy(f.pos).addScaledVector(u, Math.cos(t1) * rad).addScaledVector(v, Math.sin(t1) * rad);
        lines.set([a.x, a.y, a.z, b.x, b.y, b.z], li * 6);
        lineF[li * 2] = fi;
        lineF[li * 2 + 1] = fi;
        li++;
      }
      sc.set([f.pos.x, f.pos.y, f.pos.z], si * 3);
      su.set([u.x, u.y, u.z], si * 3);
      sv.set([v.x, v.y, v.z], si * 3);
      sp.set([rad, (k === 0 ? 0.9 : -0.6) * (0.8 + rng() * 0.4), rng() * Math.PI * 2], si * 3);
      sf[si] = fi;
      si++;
    }
  });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.BufferAttribute(lines, 3));
  lg.setAttribute("aF", new THREE.BufferAttribute(lineF, 1));
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(sc, 3));
  sg.setAttribute("aU", new THREE.BufferAttribute(su, 3));
  sg.setAttribute("aV", new THREE.BufferAttribute(sv, 3));
  sg.setAttribute("aP", new THREE.BufferAttribute(sp, 3));
  sg.setAttribute("aF", new THREE.BufferAttribute(sf, 1));
  return { lines: lg, sats: sg };
}
