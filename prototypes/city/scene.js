// "A city in the making" — a Gulf smart city from blueprint to skyline.
// Scene contract (see shared/story.js): createScene(opts) -> { resize(w, h, dpr), render(time, p) }.
// Everything is a pure function of story progress p; time only drives subtle idle motion.
import * as THREE from "three";
import { createPost, createProfiler } from "./post.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { segment, clamp, smoothstep } from "../shared/story.js";
import { generateCity, mulberry32, LANDMARKS, B, RING } from "./gen.js";
import * as S from "./glsl.js";

const PAL = {
  bg: "#052626", t950: "#041F1F", t900: "#083B3B", t800: "#0D4B4A", t700: "#145E5C", t600: "#1E7773",
  t500: "#2E948E", t400: "#58B0A9", t300: "#8FCDC6", t200: "#C2E5E0", mint: "#7FE0C8", lime: "#C8F169", paper: "#F6F5F0",
};
const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);
const DEG = Math.PI / 180;
const SWEEP0 = 0.55; // sweep-hand angle at the middle of OPERATE (points into the right half of the frame)

// Chapter values (index = chapter 0..8). Transitions happen around chapter boundaries.
// Lime discipline: one lime element per chapter — 1 reserved landmark sites, 2 data districts, 4 sweep hand,
// 5 scan-ring core, 6 product hub caps, 7 leading growth ring. Construction tips use lime only mid-transition.
const TR = {
  seed: [1, 0.55, 0.15, 0, 0, 0, 0, 0, 0],
  ground: [0.25, 0.8, 0.85, 1, 1, 1, 1, 1, 1],
  grid: [0, 1, 0.35, 0.3, 0.25, 0.2, 0.2, 0.3, 0.2],
  road: [0, 1, 0.3, 0.4, 0.34, 0.28, 0.28, 0.34, 0.3],
  plot: [0, 1, 0.25, 0.22, 0.08, 0.06, 0.06, 0.14, 0.06],
  site: [0, 1, 0.12, 0, 0, 0, 0, 0, 0],
  expLine: [0, 0, 0, 0, 0, 0, 0, 0.55, 0.28],
  trafDen: [0, 0, 0.6, 0.2, 1, 0.45, 0.45, 0.75, 0.6],
  trafMode: [0, 0, 0, 0.6, 1, 1, 1, 1, 1],
  trafA: [0, 0, 0.6, 0.45, 1, 0.6, 0.6, 0.85, 0.75],
  pulse: [0, 0, 1, 0, 0, 0, 0, 0, 0],
  dataArc: [0, 0, 1, 0, 0, 0, 0, 0, 0.1],
  nodes: [0, 0, 1, 0, 0, 0, 0, 0, 0],
  wire: [0, 0, 0, 1, 1, 1, 1, 1, 1],
  edge: [0.5, 0.5, 0.5, 1.0, 0.5, 0.45, 0.45, 0.45, 0.4],
  fresh: [0, 0, 0, 0, 0, 0, 0, 1, 0.25],  // GROW: new districts carry a brighter mint edge
  lit: [0, 0, 0, 0.05, 1.2, 0.75, 0.65, 0.6, 0.5],
  clock: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  beacon: [0, 0, 0, 0, 0, 0, 1, 0, 0.16],
  solveArc: [0, 0, 0, 0, 0, 0, 1, 0, 0.1],
  solveHit: [0, 0, 0, 0, 0, 0, 1, 0, 0.18],
  grow: [0, 0, 0, 0, 0, 0, 0, 1, 0],
  haze: [0.25, 0.2, 0.35, 0.6, 0.5, 0.6, 0.5, 0.85, 1.1],
  dust: [0.3, 0.2, 0.5, 0.6, 0.6, 0.6, 0.7, 0.5, 0.7],
};
function track(v, s) {
  let out = v[0];
  for (let k = 1; k < 9; k++) if (v[k] !== v[k - 1]) out += (v[k] - v[k - 1]) * smoothstep(k - 0.3, k + 0.2, s);
  return out;
}
const ramp = (s, a, b) => clamp((s - a) / (b - a));
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeInOut = (x) => x * x * (3 - 2 * x);

// Camera keys per chapter: azimuth°, elevation°, distance, target x/y/z
const KEYS = [
  [-28, 50, 120, 0, 0, 0],
  [-12, 64, 114, 0, 0, 2],
  [14, 40, 80, 0, 3, 0],
  [40, 13, 98, 0, 18, 0],
  [66, 44, 122, 0, 9, 0],
  [104, 19, 145, 0, 15, 0],
  [126, 19, 110, 0, 19, 0],
  [150, 29, 182, -7, 0, -2],
  [196, 6.5, 156, -5, 12, 3],
];
function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function camParam(s) {
  const x = s - 0.5;
  if (x <= 0) return 0;
  const k = Math.floor(x), f = x - k;
  return Math.min(8, k + 0.1 * f + 0.9 * smoothstep(0.2, 0.8, f));
}

// ---------- landmark geometry (abstract, Gulf-inspired; no real buildings) ----------
// Spire: chamfered-triangle plan, three setbacks stepping back on two faces (one sheer face) and a slanted, lit crown.
function chamferTri(R, c, oy) {
  const P = [0, 1, 2].map((k) => { const a = Math.PI / 2 + (k * 2 * Math.PI) / 3; return [Math.cos(a) * R, Math.sin(a) * R + oy]; });
  const s = new THREE.Shape();
  for (let k = 0; k < 3; k++) {
    const p = P[k], prev = P[(k + 2) % 3], next = P[(k + 1) % 3];
    const a = [p[0] + (prev[0] - p[0]) * c, p[1] + (prev[1] - p[1]) * c];
    const b = [p[0] + (next[0] - p[0]) * c, p[1] + (next[1] - p[1]) * c];
    if (k === 0) s.moveTo(a[0], a[1]); else s.lineTo(a[0], a[1]);
    s.lineTo(b[0], b[1]);
  }
  s.closePath();
  return s;
}
function prism(shape, y0, h, taper = 1, slant = 0) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, steps: 1 });
  g.rotateX(-Math.PI / 2); // extrusion axis -> +y
  g.computeBoundingBox();
  const z0 = g.boundingBox.min.z, z1 = g.boundingBox.max.z;
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / h, k = 1 + (taper - 1) * t;
    // slant: the top face drops toward +z (a cut crown), the bottom stays flat
    const cut = slant * t * ((pos.getZ(i) - z0) / (z1 - z0));
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) + y0 - cut, pos.getZ(i) * k);
  }
  return g;
}
function spireGeometry() {
  const parts = [
    prism(chamferTri(3.0, 0.2, 0), 0, 20.4, 0.95),
    prism(chamferTri(2.4, 0.2, 0.42), 20.4, 9.0, 0.95),
    prism(chamferTri(1.85, 0.2, 0.78), 29.4, 6.7, 0.93),
    prism(chamferTri(1.62, 0.2, 0.85), 36.1, 7.9, 0.78, 4.6),
  ];
  return mergeGeometries(parts).translate(0, 0, 0.9); // centre the crown over the site so the beacon rises from it
}
// Arch: twin blades joined low, opening into a U near the top — the logo's "smile".
function archGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-2.0, 0); s.lineTo(2.0, 0); s.lineTo(2.0, 18);
  s.quadraticCurveTo(2.0, 25.5, 1.45, 30); s.lineTo(1.05, 30);
  s.quadraticCurveTo(1.0, 23.0, 0, 23.0); s.quadraticCurveTo(-1.0, 23.0, -1.05, 30);
  s.lineTo(-1.45, 30); s.quadraticCurveTo(-2.0, 25.5, -2.0, 18); s.lineTo(-2.0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 2.6, bevelEnabled: false, curveSegments: 20 });
  g.translate(0, 0, -1.3);
  return g;
}
// Twist: chamfered-square (8-gon) plan, twisted 150° in the vertex shader.
function twistGeometry() {
  const g = new THREE.CylinderGeometry(1, 1, 26, 8, 40, false, Math.PI / 8);
  const pos = g.getAttribute("position");
  const S = 1.4, A = 0.5;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    if (Math.hypot(x, z) < 1e-4) continue;
    const sx = Math.sign(x), sz = Math.sign(z);
    if (Math.abs(z) > Math.abs(x)) pos.setX(i, sx * A * S), pos.setZ(i, sz * S);
    else pos.setX(i, sx * S), pos.setZ(i, sz * A * S);
  }
  g.translate(0, 13, 0);
  return g;
}

export async function createScene({ canvas, reducedMotion, isMobile }) {
  const debug = new URLSearchParams(location.search);
  const motion = reducedMotion ? 0 : 1;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(new THREE.Color(PAL.bg), 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PAL.bg);
  const camera = new THREE.PerspectiveCamera(isMobile ? 52 : 38, 1, 1, 6000);

  const city = generateCity({ isMobile });
  const RMAX = city.RMAX;
  const rand = mulberry32(777);

  // ---------- shared uniforms ----------
  const U = {
    uBg: { value: col(PAL.bg) }, uFogD: { value: 0.005 }, uFogNear: { value: 20 }, uTime: { value: 0 }, uMotion: { value: motion },
    uCMint: { value: col(PAL.mint) }, uCPaper: { value: col(PAL.paper) }, uCLime: { value: col(PAL.lime) },
    uCGlass0: { value: col(PAL.t950, 0.9) }, uCGlass1: { value: col(PAL.t900, 0.85) }, uCKey: { value: col(PAL.t700, 0.32) },
    uCRim: { value: col(PAL.t400, 0.3) }, uCEdge: { value: col(PAL.t300, 0.6) }, uCSlab: { value: col(PAL.t600, 0.3) },
    uKeyDir: { value: new THREE.Vector3(-0.55, 0.45, -0.7).normalize() },
    uCGround: { value: col(PAL.t900, 0.75) }, uCGrid: { value: col(PAL.t400) },
    uCRoad: { value: col(PAL.mint, 0.62) }, uCPlot: { value: col(PAL.t300, 0.5) },
    uLit: { value: 0 }, uWaveR: { value: 0 }, uSweepA: { value: 0 }, uSweepAng: { value: 0 }, uSolveHit: { value: 0 },
    uRiseC: { value: 0 }, uRiseE: { value: 0 }, uSolidC: { value: 0 }, uSolidE: { value: 0 }, uWireA: { value: 1 }, uLimeHead: { value: 1 },
    uEdgeA: { value: 0.5 }, uFresh: { value: 0 }, uDetail: { value: new THREE.Vector2(isMobile ? 0.4 : 0.25, isMobile ? 0.9 : 0.6) },
    uB: { value: B }, uRing: { value: RING }, uGroundA: { value: 0 }, uGridA: { value: 0 }, uGridR: { value: 0 }, uSeedA: { value: 1 },
    uPulseA: { value: 0 }, uPulsePhase: { value: 0 }, uClockA: { value: 0 }, uGrowA: { value: 0 }, uGrowPhase: { value: 0 },
    uGrowSpan: { value: RMAX - RING }, uScanA: { value: 0 }, uDomeR: { value: RING + 3 },
    uDrawRC: { value: 0 }, uDrawPC: { value: 0 }, uDrawRE: { value: 0 }, uDrawPE: { value: 0 },
    uRoadA: { value: 0 }, uPlotA: { value: 0 }, uExpRoadA: { value: 0 }, uExpPlotA: { value: 0 }, uSiteA: { value: 0 },
    uFlow: { value: 0 }, uTrafDen: { value: 0 }, uCityR: { value: RING + 1 }, uTrafMode: { value: 0 }, uTrafA: { value: 0 },
    uPx: { value: 500 }, uCHaze: { value: col(PAL.t700, 0.4) }, uHaze: { value: 0 },
    uNodes: { value: city.nodes.map((n) => new THREE.Vector2(n.x, n.z)) }, uNodeSeed: { value: new Array(9).fill(0) },
  };
  const shader = (vertexShader, fragmentShader, extra = {}, opts = {}) =>
    new THREE.ShaderMaterial({ uniforms: { ...U, ...extra }, vertexShader, fragmentShader, ...opts });
  const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

  // ---------- ground ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), shader(S.GROUND_VERT, S.GROUND_FRAG));
  ground.rotation.x = -Math.PI / 2;
  ground.renderOrder = -2;
  scene.add(ground);

  // ---------- blueprint lines ----------
  const lines = (() => {
    const nLines = city.lines.length;
    const nPlotSegs = city.plots.length * 4 + 3 * 64 + 3 * 4;
    const total = nLines + nPlotSegs;
    const pos = new Float32Array(total * 6), at = new Float32Array(total * 2), al = new Float32Array(total * 8);
    let n = 0;
    const push = (ax, az, bx, bz, ta, tb, delay, dur, kind, len, y) => {
      pos.set([ax, y, az, bx, y, bz], n * 6);
      at.set([ta, tb], n * 2);
      al.set([delay, dur, kind, len, delay, dur, kind, len], n * 8);
      n++;
    };
    for (const l of city.lines) push(l.a[0], l.a[1], l.b[0], l.b[1], l.ta, l.tb, l.delay, l.dur, l.kind, l.len, 0.03);
    for (const p of city.plots) {
      const hw = p.w / 2, hd = p.d / 2;
      const c = [[p.x - hw, p.z - hd], [p.x + hw, p.z - hd], [p.x + hw, p.z + hd], [p.x - hw, p.z + hd]];
      const per = 2 * (p.w + p.d);
      let acc = 0;
      for (let k = 0; k < 4; k++) {
        const a = c[k], b = c[(k + 1) % 4];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        push(a[0], a[1], b[0], b[1], acc / per, (acc + L) / per, p.delay, p.dur, p.kind, per, 0.05);
        acc += L;
      }
    }
    // reserved landmark sites (kind 4, lime in CONSULT): circles + crosshairs
    for (const [key, R] of [["spire", 4.3], ["arch", 3.1], ["twist", 2.9]]) {
      const lm = LANDMARKS[key];
      const d0 = key === "spire" ? 0.08 : 0.3;
      for (let k = 0; k < 64; k++) {
        const a0 = (k / 64) * Math.PI * 2, a1 = ((k + 1) / 64) * Math.PI * 2;
        push(lm.x + Math.cos(a0) * R, lm.z + Math.sin(a0) * R, lm.x + Math.cos(a1) * R, lm.z + Math.sin(a1) * R, k / 64, (k + 1) / 64, d0, 0.35, 4, 2 * Math.PI * R, 0.05);
      }
      const e = R + 1.2;
      push(lm.x - e, lm.z, lm.x - R * 0.35, lm.z, 0, 1, d0 + 0.2, 0.2, 4, e, 0.05);
      push(lm.x + R * 0.35, lm.z, lm.x + e, lm.z, 0, 1, d0 + 0.2, 0.2, 4, e, 0.05);
      push(lm.x, lm.z - e, lm.x, lm.z - R * 0.35, 0, 1, d0 + 0.25, 0.2, 4, e, 0.05);
      push(lm.x, lm.z + R * 0.35, lm.x, lm.z + e, 0, 1, d0 + 0.25, 0.2, 4, e, 0.05);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos.subarray(0, n * 6), 3));
    g.setAttribute("aT", new THREE.BufferAttribute(at.subarray(0, n * 2), 1));
    g.setAttribute("aL", new THREE.BufferAttribute(al.subarray(0, n * 8), 4));
    const m = new THREE.LineSegments(g, shader(S.LINE_VERT, S.LINE_FRAG, {}, additive));
    m.frustumCulled = false;
    scene.add(m);
    return m;
  })();

  // ---------- instanced buildings ----------
  const inst = [];
  for (const b of city.buildings) {
    for (const sg of b.segs) inst.push([b.x, b.z, sg[2], sg[3], sg[0], sg[1], b.h, b.seed, b.riseDelay, b.solidDelay, b.kind, b.target]);
  }
  const NI = inst.length;
  const iBox = new Float32Array(NI * 4), iSeg = new Float32Array(NI * 4), iAnim = new Float32Array(NI * 4);
  inst.forEach((v, k) => {
    iBox.set([v[0], v[1], v[2], v[3]], k * 4);
    iSeg.set([v[4], v[5], v[6], v[7]], k * 4);
    iAnim.set([v[8], v[9], v[10], v[11]], k * 4);
  });
  const aBox = new THREE.InstancedBufferAttribute(iBox, 4), aSeg = new THREE.InstancedBufferAttribute(iSeg, 4), aAnim = new THREE.InstancedBufferAttribute(iAnim, 4);
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  unitBox.translate(0, 0.5, 0);
  const solidGeo = new THREE.InstancedBufferGeometry();
  solidGeo.index = unitBox.index;
  solidGeo.setAttribute("position", unitBox.getAttribute("position"));
  solidGeo.setAttribute("normal", unitBox.getAttribute("normal"));
  solidGeo.setAttribute("iBox", aBox); solidGeo.setAttribute("iSeg", aSeg); solidGeo.setAttribute("iAnim", aAnim);
  solidGeo.instanceCount = NI;
  const buildings = new THREE.Mesh(solidGeo, shader(S.BLD_VERT, S.BLD_FRAG));
  buildings.frustumCulled = false;
  scene.add(buildings);

  const edgeGeo = new THREE.EdgesGeometry(unitBox);
  const wireGeo = new THREE.InstancedBufferGeometry();
  wireGeo.setAttribute("position", edgeGeo.getAttribute("position"));
  wireGeo.setAttribute("iBox", aBox); wireGeo.setAttribute("iSeg", aSeg); wireGeo.setAttribute("iAnim", aAnim);
  wireGeo.instanceCount = NI;
  const wire = new THREE.LineSegments(wireGeo, shader(S.WIRE_VERT, S.WIRE_FRAG, {}, additive));
  wire.frustumCulled = false;
  scene.add(wire);

  // ---------- landmarks ----------
  // Everything is settled by t ~ 0.25 of BUILD; the rise itself plays across the TRANSFORM -> BUILD boundary.
  const lmDefs = [
    { key: "spire", geo: spireGeometry(), twist: 0, seed: 0.37, rise: [2.8, 3.12], solid: [2.95, 3.25], kind: 0, hubN: 1 },
    { key: "arch", geo: archGeometry(), twist: 0, seed: 0.61, rise: [2.76, 3.06], solid: [2.9, 3.2], kind: 1, hubN: 2 },
    { key: "twist", geo: twistGeometry(), twist: 150 * DEG, seed: 0.83, rise: [2.78, 3.1], solid: [2.92, 3.22], kind: 2, hubN: 3 },
  ];
  const landmarks = lmDefs.map((d) => {
    const lm = LANDMARKS[d.key];
    const own = {
      uG: { value: 0 }, uSd: { value: 0 }, uH: { value: lm.h }, uTwist: { value: d.twist }, uSite: { value: new THREE.Vector2(lm.x, lm.z) },
      uSeed: { value: d.seed }, uHub: { value: 0 }, uHubY: { value: lm.hubY }, uHubN: { value: d.hubN }, uKind: { value: d.kind },
    };
    const solid = new THREE.Mesh(d.geo, shader(S.LM_VERT, S.LM_FRAG, { ...own, uWireMode: { value: 0 } }, { side: THREE.DoubleSide }));
    const wireL = new THREE.LineSegments(new THREE.EdgesGeometry(d.geo, 25), shader(S.LM_VERT, S.LMW_FRAG, { ...own, uWireMode: { value: 1 } }, additive));
    for (const o of [solid, wireL]) {
      o.position.set(lm.x, 0, lm.z);
      if (lm.rot) o.rotation.y = lm.rot;
      o.frustumCulled = false;
      scene.add(o);
    }
    return { d, lm, own, solid, wire: wireL };
  });

  // ---------- traffic ----------
  const NT = isMobile ? 1100 : 3400;
  const traffic = (() => {
    const roads = city.roads.map((r) => ({ ...r, len: r.type === 0 ? Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]) : Math.PI * 2 * r.R }));
    const weights = roads.map((r) => r.len * (r.kind === 2 ? 0.55 : 1) * (r.type === 1 ? 1.6 : 1));
    const wsum = weights.reduce((a, b) => a + b, 0);
    const cum = [];
    let acc = 0;
    for (const w of weights) { acc += w / wsum; cum.push(acc); }
    const aRoad = new Float32Array(NT * 4), aP = new Float32Array(NT * 4), aSeed = new Float32Array(NT);
    for (let k = 0; k < NT; k++) {
      const u = rand();
      let ri = cum.findIndex((c) => c >= u);
      if (ri < 0) ri = roads.length - 1;
      const r = roads[ri];
      if (r.type === 0) aRoad.set([r.a[0], r.a[1], r.b[0], r.b[1]], k * 4);
      else aRoad.set([r.R, 0, 0, 0], k * 4);
      aP.set([r.type, rand() < 0.5 ? 1 : -1, 0.7 + rand() * 0.6, rand()], k * 4);
      aSeed[k] = rand();
    }
    const quad = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = quad.index;
    g.setAttribute("position", quad.getAttribute("position"));
    g.setAttribute("aRoad", new THREE.InstancedBufferAttribute(aRoad, 4));
    g.setAttribute("aP", new THREE.InstancedBufferAttribute(aP, 4));
    g.setAttribute("aSeed", new THREE.InstancedBufferAttribute(aSeed, 1));
    g.instanceCount = NT;
    const m = new THREE.Mesh(g, shader(S.TRAF_VERT, S.TRAF_FRAG, {}, { ...additive, side: THREE.DoubleSide }));
    m.frustumCulled = false;
    scene.add(m);
    return m;
  })();

  // ---------- arcs ----------
  function arcMesh(defs, radius, extra) {
    const geos = defs.map((d) => {
      const a = new THREE.Vector3(...d.a), b = new THREE.Vector3(...d.b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y = Math.max(a.y, b.y) + d.lift;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const tg = new THREE.TubeGeometry(curve, 48, radius, 5, false);
      const cnt = tg.getAttribute("position").count;
      const arr = new Float32Array(cnt * 2);
      for (let k = 0; k < cnt; k++) { arr[k * 2] = d.delay; arr[k * 2 + 1] = d.seed; }
      tg.setAttribute("aArc", new THREE.BufferAttribute(arr, 2));
      return tg;
    });
    const m = new THREE.Mesh(mergeGeometries(geos), shader(S.ARC_VERT, S.ARC_FRAG, extra, additive));
    m.frustumCulled = false;
    scene.add(m);
    return m;
  }
  // core -> district links carry seeds < 0.5 (packets travel outward) so the ground pulse can fire on arrival
  const dataDefs = city.dataLinks.map(([i, j]) => {
    const A = city.nodes[i], Bn = city.nodes[j];
    const dist = Math.hypot(A.x - Bn.x, A.z - Bn.z);
    const delay = rand() * 0.5;
    const seed = i === 0 ? rand() * 0.49 : rand();
    if (i === 0) U.uNodeSeed.value[j] = seed;
    return { a: [A.x, 0.3, A.z], b: [Bn.x, 0.3, Bn.z], lift: 3 + dist * 0.42, delay, seed };
  });
  const dataArcs = arcMesh(dataDefs, isMobile ? 0.07 : 0.055, {
    uDraw: { value: 0 }, uArcA: { value: 0 }, uArcBase: { value: 0.7 }, uDir: { value: 1 },
    uCArc: { value: col(PAL.mint, 0.8) }, uCPacket: { value: col(PAL.paper) }, uCHead: { value: col(PAL.paper, 0.8) },
  });
  const hubPts = ["spire", "arch", "twist"].map((k) => LANDMARKS[k]);
  const solveArcs = arcMesh(
    city.solveLinks.map((l) => {
      const hb = hubPts[l.hub];
      const dist = Math.hypot(hb.x - l.b.x, hb.z - l.b.z);
      return { a: [hb.x, hb.hubY, hb.z], b: [l.b.x, l.b.h, l.b.z], lift: 3 + dist * 0.28, delay: l.delay, seed: rand() * 0.49 };
    }),
    isMobile ? 0.1 : 0.08,
    {
      uDraw: { value: 0 }, uArcA: { value: 0 }, uArcBase: { value: 0.45 }, uDir: { value: 0 },
      uCArc: { value: col(PAL.mint, 0.9) }, uCPacket: { value: col(PAL.paper, 0.8) }, uCHead: { value: col(PAL.paper, 0.9) },
    },
  );

  // ---------- glow sprites: seed, data nodes, hub caps, target caps ----------
  const glow = (() => {
    const pts = [];
    pts.push([0, 0.4, 0, 2.6, 0, PAL.paper, 1.4]);
    city.nodes.forEach((nd, k) => pts.push([nd.x, 0.35, nd.z, k === 0 ? 2.0 : 1.5, 1, PAL.lime, 1.2]));
    hubPts.forEach((hb) => pts.push([hb.x, hb.beaconY + 0.2, hb.z, 3.0, 2, PAL.lime, 1.3]));
    city.solveLinks.forEach((l) => pts.push([l.b.x, l.b.h + 0.25, l.b.z, 1.6, 3, PAL.mint, 0.9]));
    const n = pts.length;
    const pos = new Float32Array(n * 3), size = new Float32Array(n), grp = new Float32Array(n), cc = new Float32Array(n * 3);
    pts.forEach((p, k) => {
      pos.set([p[0], p[1], p[2]], k * 3); size[k] = p[3]; grp[k] = p[4];
      const c = col(p[5], p[6]); cc.set([c.r, c.g, c.b], k * 3);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aGroup", new THREE.BufferAttribute(grp, 1));
    g.setAttribute("aCol", new THREE.BufferAttribute(cc, 3));
    const m = new THREE.Points(g, shader(S.GLOW_VERT, S.GLOW_FRAG, { uG0: { value: 1 }, uG1: { value: 0 }, uG2: { value: 0 }, uG3: { value: 0 } }, additive));
    m.frustumCulled = false;
    m.renderOrder = 5;
    scene.add(m);
    return m;
  })();

  // ---------- shield dome ----------
  const DOME_R = RING + 4.5, DOME_K = 1.36;
  // deflection point: upper right of the dome as seen from the SECURE camera
  const camAz5 = (KEYS[5][0] + 5.5 * 1.8) * DEG;
  const impAz = camAz5 + 40 * DEG, impEl = 38 * DEG;
  const impDir = new THREE.Vector3(Math.cos(impEl) * Math.sin(impAz), Math.sin(impEl), Math.cos(impEl) * Math.cos(impAz));
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1, isMobile ? 48 : 80, isMobile ? 16 : 28, 0, Math.PI * 2, 0, Math.PI / 2),
    shader(S.DOME_VERT, S.DOME_FRAG, {
      uDomeK: { value: DOME_K }, uDomeA: { value: 0 }, uDomeRise: { value: 0 }, uScanY: { value: 0 }, uCell: { value: (2 * Math.PI * DOME_R) / 46 },
      uImpact: { value: impDir.clone() }, uRipple: { value: 0 },
    }, { ...additive, side: THREE.DoubleSide }),
  );
  dome.scale.set(DOME_R, DOME_R * DOME_K, DOME_R);
  dome.frustumCulled = false;
  scene.add(dome);
  U.uDomeR.value = DOME_R;

  // threat streak: comes in from the upper right, glances off the shield at the impact point
  const TH = (() => {
    const imp = new THREE.Vector3(impDir.x * DOME_R, impDir.y * DOME_R * DOME_K, impDir.z * DOME_R);
    const n = new THREE.Vector3(impDir.x, impDir.y / DOME_K, impDir.z).normalize();
    const right = new THREE.Vector3(Math.cos(camAz5), 0, -Math.sin(camAz5)); // screen-right for the SECURE camera
    const start = imp.clone().addScaledVector(n, 46).addScaledVector(right, 26).add(new THREE.Vector3(0, 22, 0));
    const inD = imp.clone().sub(start).normalize();
    const out = inD.clone().addScaledVector(n, -2 * inD.dot(n)).normalize();
    return { imp, inD, out, len: imp.distanceTo(start) };
  })();
  const NSTREAK = 16;
  const streak = (() => {
    const pos = new Float32Array(NSTREAK * 2 * 3), t = new Float32Array(NSTREAK * 2);
    for (let k = 0; k < NSTREAK; k++) { t[k * 2] = k / NSTREAK; t[k * 2 + 1] = (k + 1) / NSTREAK; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    const m = new THREE.LineSegments(g, shader(S.STREAK_VERT, S.STREAK_FRAG, { uHead: { value: new THREE.Vector3() }, uTailV: { value: new THREE.Vector3() }, uStreakA: { value: 0 } }, additive));
    m.frustumCulled = false;
    scene.add(m);
    return m;
  })();

  // ---------- beacons: one per product, each with its own width and cadence ----------
  const beamA = { value: 0 }, beamRise = { value: 0 };
  const beams = hubPts.map((hb, k) => {
    const H = 90;
    const g = new THREE.CylinderGeometry([0.8, 0.55, 0.4][k], 0.3, H, 20, 1, true);
    g.translate(0, H / 2, 0);
    const m = new THREE.Mesh(g, shader(S.BEAM_VERT, S.BEAM_FRAG, { uBeamA: beamA, uBeamRise: beamRise, uBeamK: { value: [0.06, 0.09, 0.12][k] } }, { ...additive, side: THREE.DoubleSide }));
    m.position.set(hb.x, hb.beaconY, hb.z);
    m.frustumCulled = false;
    scene.add(m);
    return m;
  });

  // ---------- horizon haze ----------
  const haze = new THREE.Mesh(
    new THREE.SphereGeometry(3000, 48, 24),
    shader(S.HAZE_VERT, S.HAZE_FRAG, {}, { ...additive, side: THREE.BackSide }),
  );
  haze.renderOrder = -10;
  haze.frustumCulled = false;
  scene.add(haze);

  // ---------- sweep blade (operate) ----------
  const bladeGeo = new THREE.PlaneGeometry(1, 1);
  bladeGeo.translate(0.5, 0.5, 0);
  const blade = new THREE.Mesh(bladeGeo, shader(S.BLADE_VERT, S.BLADE_FRAG, {}, { ...additive, side: THREE.DoubleSide }));
  blade.scale.set(RING + 2.4, 16, 1);
  blade.frustumCulled = false;
  scene.add(blade);

  // ---------- dust ----------
  const dust = (() => {
    const n = isMobile ? 260 : 700;
    const pos = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 90;
      pos.set([Math.cos(a) * r, 1 + rand() * 40, Math.sin(a) * r], k * 3);
      sd[k] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = new THREE.Points(g, shader(S.DUST_VERT, S.DUST_FRAG, { uDustA: { value: 0 }, uCDust: { value: col(PAL.t300, 0.5) } }, additive));
    m.frustumCulled = false;
    scene.add(m);
    return m;
  })();

  // ---------- post ----------
  const hasFloat = renderer.extensions.has("EXT_color_buffer_float") || renderer.extensions.has("EXT_color_buffer_half_float");
  const post = createPost(renderer, { samples: 0, fxaa: true, useFloat: hasFloat, strength: 0.32, threshold: 0.62, knee: 0.3, levels: isMobile ? 4 : 5 });
  const prof = debug.has("debug") && debug.has("gpu") ? createProfiler(renderer) : null;

  // Pre-link every program with the render-target state used at draw time (HDR scene target: linear output),
  // then run the post chain once so its programs link too. Nothing compiles later, mid-scroll.
  async function precompile() {
    renderer.setRenderTarget(post.sceneRT);
    if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
    else renderer.compile(scene, camera);
    renderer.setRenderTarget(null);
    post.render(scene, camera);
  }
  await precompile();

  // WebGL context loss: three.js keeps the scene; skip frames while lost and re-link programs on restore.
  let contextLost = false;
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); contextLost = true; }, false);
  canvas.addEventListener("webglcontextrestored", () => { contextLost = false; gov.n = 0; applyScale(gov.scale); precompile(); }, false);

  // ---------- framing + internal render scale ----------
  let W = 1, H = 1;
  const view = { shiftX: isMobile ? 0 : 0.15, shiftY: isMobile ? 0.16 : 0, distK: 1 };
  // Render-scale governor: start from a pixel budget, step down when frames run long, step back up with back-off.
  const gov = { max: 0, scale: 1, steps: [1], ema: 16.7, last: -1, n: 0, hold: 0, good: 0, upAfter: 240 };
  function applyScale(sc) {
    gov.scale = sc;
    const sw = Math.max(1, Math.round(W * sc)), sh = Math.max(1, Math.round(H * sc));
    post.setSize(sw, sh, Math.round(W / 2), Math.round(H / 2));
    U.uPx.value = sh / (2 * Math.tan((camera.fov * DEG) / 2));
  }
  function govern() {
    const now = performance.now();
    const dt = now - gov.last;
    gov.last = now;
    if (dt <= 0 || dt > 250) { gov.n = 0; return; } // hidden tab or a one-off hitch: restart warm-up
    if (++gov.n < 40) return;
    gov.ema += (dt - gov.ema) * 0.06;
    if (gov.hold > 0) { gov.hold--; return; }
    const i = gov.steps.indexOf(gov.scale);
    if (gov.ema > 18.2 && i < gov.steps.length - 1) {
      applyScale(gov.steps[i + 1]);
      gov.hold = 60; gov.ema = 16.7; gov.good = 0; gov.upAfter = Math.min(gov.upAfter * 2, 3600);
    } else if (gov.ema < 17.4 && i > 0) {
      if (++gov.good > gov.upAfter) { applyScale(gov.steps[i - 1]); gov.hold = 60; gov.good = 0; }
    } else gov.good = 0;
  }

  const v = [0, 0, 0, 0, 0, 0];
  function placeCamera(s, time) {
    const c = camParam(s);
    const i = Math.min(7, Math.floor(c)), t = c - i;
    for (let q = 0; q < 6; q++) {
      const p0 = KEYS[Math.max(0, i - 1)][q], p1 = KEYS[i][q], p2 = KEYS[Math.min(8, i + 1)][q], p3 = KEYS[Math.min(8, i + 2)][q];
      v[q] = catmull(p0, p1, p2, p3, t);
    }
    const sway = motion * Math.sin(time * 0.07) * 1.4;
    const az = (v[0] + s * 1.8 + sway) * DEG;
    const el = (v[1] + motion * Math.sin(time * 0.05 + 1.3) * 0.35) * DEG;
    // mobile: pull back further where the subject is widest (the TRANSFORM data plane, the grown city)
    const mobK = 1.62 + 0.22 * smoothstep(1.7, 2.3, s) * (1 - smoothstep(2.7, 3.3, s)) + 0.12 * smoothstep(6.5, 7.6, s);
    const d = v[2] * (isMobile ? mobK : view.distK);
    camera.position.set(v[3] + d * Math.cos(el) * Math.sin(az), v[4] + d * Math.sin(el), v[5] + d * Math.cos(el) * Math.cos(az));
    camera.lookAt(v[3], v[4] * (isMobile ? 1.1 : 1), v[5]);
    U.uFogNear.value = 0.3 * d;
    U.uFogD.value = 0.42 / d;
    const sx = view.shiftX - (isMobile ? 0 : 0.02 * smoothstep(7.6, 8.3, s));
    camera.setViewOffset(W, H, -sx * W, view.shiftY * H, W, H);
  }

  function update(time, p) {
    const s = clamp(p) * 9;
    const tm = time * motion;
    const { i: chapter } = segment(p);
    U.uTime.value = time;

    U.uSeedA.value = track(TR.seed, s) * (1 + motion * 0.12 * Math.sin(time * 1.3));
    U.uGroundA.value = track(TR.ground, s);
    U.uGridA.value = track(TR.grid, s);
    U.uGridR.value = (RING + 6) * easeOut(ramp(s, 0.66, 1.2)) + (RMAX - RING) * ramp(s, 6.62, 7.3);
    U.uRoadA.value = track(TR.road, s);
    U.uPlotA.value = track(TR.plot, s);
    U.uSiteA.value = track(TR.site, s);
    const expA = track(TR.expLine, s);
    U.uExpRoadA.value = expA;
    U.uExpPlotA.value = expA * 0.8;
    // CONSULT: the masterplan finishes drawing by t ~ 0.2, then holds
    U.uDrawRC.value = ramp(s, 0.72, 1.2);
    U.uDrawPC.value = ramp(s, 0.8, 1.28);
    U.uDrawRE.value = ramp(s, 6.58, 7.1);
    U.uDrawPE.value = ramp(s, 6.64, 7.2);

    U.uFlow.value = s * 14 + tm * 1.7;
    U.uTrafDen.value = track(TR.trafDen, s);
    U.uTrafMode.value = track(TR.trafMode, s);
    U.uTrafA.value = track(TR.trafA, s);
    U.uCityR.value = RING + 1.5 + (RMAX - RING + 1) * easeInOut(ramp(s, 6.66, 7.3));

    U.uPulseA.value = track(TR.pulse, s);
    U.uPulsePhase.value = s * 2.2 + tm * 0.45;
    const dA = track(TR.dataArc, s);
    dataArcs.material.uniforms.uArcA.value = dA;
    dataArcs.material.uniforms.uDraw.value = ramp(s, 1.68, 2.22);
    dataArcs.visible = dA > 0.002;

    // BUILD: towers rise across the 2 -> 3 boundary and are solid glass by t ~ 0.25
    U.uRiseC.value = ramp(s, 2.76, 3.18);
    U.uSolidC.value = ramp(s, 2.9, 3.3);
    // GROW: satellite districts rise across the 6 -> 7 boundary, settled by t ~ 0.4
    U.uRiseE.value = ramp(s, 6.7, 7.32);
    U.uSolidE.value = ramp(s, 6.8, 7.36);
    U.uWireA.value = track(TR.wire, s);
    U.uEdgeA.value = track(TR.edge, s);
    U.uFresh.value = track(TR.fresh, s);
    U.uLimeHead.value = chapter < 5 ? 0.35 : 0.25;
    buildings.visible = U.uRiseC.value > 0;
    wire.visible = (U.uRiseC.value > 0 && U.uSolidC.value < 1) || (U.uRiseE.value > 0 && U.uSolidE.value < 1);

    for (const L of landmarks) {
      const g = easeOut(ramp(s, L.d.rise[0], L.d.rise[1]));
      const sd = easeInOut(ramp(s, L.d.solid[0], L.d.solid[1]));
      L.own.uG.value = g;
      L.own.uSd.value = sd;
      L.solid.visible = g > 0 && sd > 0;
      L.wire.visible = g > 0 && sd < 1;
    }

    U.uLit.value = track(TR.lit, s);
    U.uWaveR.value = -10 + (RMAX + 50) * ramp(s, 3.66, 4.3);
    const clockA = track(TR.clock, s);
    U.uClockA.value = clockA;
    U.uSweepA.value = clockA;
    U.uSweepAng.value = SWEEP0 - (s - 4.5) * 2.4 - tm * 0.32;

    // SECURE: the shield is fully gone before the SOLVE beacons rise (no "breach")
    const domeA = smoothstep(4.7, 5.2, s) * (1 - smoothstep(5.72, 5.95, s));
    dome.visible = domeA > 0.002;
    const du = dome.material.uniforms;
    du.uDomeA.value = domeA;
    const domeRise = easeInOut(ramp(s, 4.66, 5.24));
    du.uDomeRise.value = domeRise;
    dome.scale.y = DOME_R * DOME_K * (0.04 + 0.96 * easeOut(Math.min(1, domeRise * 1.15)));
    du.uDomeK.value = Math.max(0.05, dome.scale.y / DOME_R);
    du.uScanY.value = DOME_R * DOME_K * (0.48 + 0.4 * Math.sin(s * 5.5 + tm * 0.7));
    U.uScanA.value = domeA;
    // threat cycle: phi in [0, 0.2) incoming, 0.2 impact, then ripple + deflected streak
    const phi = ((((s - 5.5) * 1.1 + 0.28 + tm * 0.05) % 1) + 1) % 1;
    du.uRipple.value = phi < 0.2 ? 0 : (phi - 0.2) / 0.8;
    const su = streak.material.uniforms;
    if (phi < 0.2) {
      const u = phi / 0.2;
      su.uHead.value.copy(TH.imp).addScaledVector(TH.inD, -(1 - u) * TH.len);
      su.uTailV.value.copy(TH.inD).multiplyScalar(-Math.min(12, u * TH.len + 2));
      su.uStreakA.value = smoothstep(0, 0.3, u);
    } else {
      const u = (phi - 0.2) / 0.3;
      su.uHead.value.copy(TH.imp).addScaledVector(TH.out, u * 34);
      su.uTailV.value.copy(TH.out).multiplyScalar(-Math.min(10, u * 34));
      su.uStreakA.value = clamp(1 - u) * 0.8;
    }
    su.uStreakA.value *= domeA * smoothstep(5.0, 5.25, s);
    streak.visible = su.uStreakA.value > 0.002;

    // SOLVE: beacons + arcs start once the shield has faded
    const beaconA = track(TR.beacon, s);
    beamA.value = beaconA;
    beamRise.value = easeOut(ramp(s, 5.92, 6.24));
    for (const b of beams) b.visible = beaconA > 0.002;
    const sA = track(TR.solveArc, s);
    solveArcs.material.uniforms.uArcA.value = sA;
    solveArcs.material.uniforms.uDraw.value = ramp(s, 5.96, 6.3);
    solveArcs.visible = sA > 0.002;
    U.uSolveHit.value = track(TR.solveHit, s) * (s > 6.5 ? 1 : ramp(s, 6.0, 6.3));
    for (const L of landmarks) L.own.uHub.value = beaconA;

    U.uGrowA.value = track(TR.grow, s);
    U.uGrowPhase.value = s * 1.3 + tm * 0.09;

    const gm = glow.material.uniforms;
    gm.uG0.value = U.uSeedA.value;
    gm.uG1.value = track(TR.nodes, s);
    gm.uG2.value = beaconA;
    gm.uG3.value = U.uSolveHit.value;

    U.uHaze.value = track(TR.haze, s);
    dust.material.uniforms.uDustA.value = track(TR.dust, s);

    traffic.visible = U.uTrafA.value * U.uTrafDen.value > 0.002;
    lines.visible = U.uDrawRC.value > 0;

    blade.visible = clockA > 0.002;
    blade.rotation.y = -U.uSweepAng.value;
    placeCamera(s, time);
    haze.position.copy(camera.position);
    return chapter;
  }

  return {
    resize(w, h, dpr) {
      W = Math.max(1, w); H = Math.max(1, h);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      // frame the hero to the right of the text panel (panel = min(580px, 88vw) from a clamp(16px, 6vw, 96px) margin)
      const narrow = isMobile || W < 768;
      if (narrow) { view.shiftX = 0; view.shiftY = 0.16; view.distK = 1; }
      else {
        const panelR = Math.min(520, 0.88 * W) + Math.max(16, Math.min(0.06 * W, 96));
        view.shiftX = clamp(0.5 * (panelR / W) - 0.06, 0.1, 0.24);
        view.shiftY = 0;
        view.distK = 1 + 0.35 * clamp((1.45 - W / H) / 0.5);
      }
      // internal render scale: full dpr within a ~2.6 MP budget, else 1.25x; the governor may step it down
      const max = Math.min(dpr, W * H * dpr * dpr > 2.6e6 ? 1.25 : dpr);
      const keep = max === gov.max && gov.scale <= max;
      gov.max = max;
      gov.steps = [...new Set([max, 1.25, 1, 0.85].filter((x) => x <= max))].sort((a, b) => b - a);
      applyScale(keep && gov.steps.includes(gov.scale) ? gov.scale : max);
    },
    render(time, p) {
      if (contextLost) return;
      govern();
      update(time, p);
      post.render(scene, camera, prof);
      if (prof) prof.poll();
    },
  };
}
