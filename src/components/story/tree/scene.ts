// "The digital tree": a seed becomes a tree of light; each pillar grows as one branch of one root system.
// Ported from prototypes/tree/scene.js. The scene state is a pure function of the story progress p;
// time only drives idle motion (and none of it under reduced motion).
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { clamp, segment } from "../progress";
import {
  TL, TREE, DEG, lerp, sstep, sstepW, mulberry32,
  generateTree, buildTubeGeometry, buildRootMap, buildSapTexture, buildSapParticles, buildLeaves,
  buildFireflies, buildBlocks, buildBuds, buildShellGeometry, buildOrbits, toQuads,
  type Curve, type FruitView,
} from "./gen";
import * as M from "./shaders";
import { DualBloomPass } from "./bloom";

export interface SceneOptions {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  isMobile: boolean;
  /** Kept for the prototype contract; the finale logo is rendered in HTML. */
  logoUrl?: string;
  /** Render at exactly the requested dpr (no 1.5 cap, no adaptive step-down). For poster capture. */
  fixedDpr?: boolean;
}

export interface StoryScene {
  resize(width: number, height: number, dpr: number): void;
  render(timeSeconds: number, p: number): void;
  dispose(): void;
}

const BG = 0x052626;
const smoother = (x: number) => {
  x = clamp(x);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const easeOutBack = (x: number) => {
  x = clamp(x);
  const m = x - 1;
  return 1 + 2.4 * m * m * m + 1.4 * m * m;
};

// Camera azimuth (deg) per chapter; branch k is grown toward the camera's right side in chapter k.
// 360/7 apart: the seven pillar branches are spread evenly around the trunk with the least camera travel.
const STEP = 360 / 7;
const THETA = [-24, ...Array.from({ length: 7 }, (_, k) => 16 + k * STEP)];
THETA.push(THETA[7] + 4); // finale: a calm pull-back that keeps the SOLVE fruits on the right of the crown
const DRIFT = 2.2; // extra deg of orbit per chapter (scroll-linked)
const EL = [8, 26, 9, 18, 24, 8, 24, 18, 6];

/**
 * Left edge + width of the story text column in CSS px, mirroring GrowthStory's layout: the panel sits
 * on the site container's left edge (`container-site`: 1280px max content, clamp(16px, 4vw, 32px) gutter)
 * and is min(520px, 88vw) wide.
 */
function textColumnRight(W: number) {
  const gutter = Math.min(32, Math.max(16, 0.04 * W));
  const left = Math.max(0, (W - (1280 + 2 * gutter)) / 2) + gutter;
  return left + Math.min(520, 0.88 * W);
}

export async function createScene({ canvas, reducedMotion, isMobile, fixedDpr = false }: SceneOptions): Promise<StoryScene> {
  const Q = isMobile
    ? { leaves: 2800, sapNP: 32, sapNPd: 12, sap: 640, fire: 60, motes: 110, shellDetail: 3, blocks: 90, blockScale: 1.2, lineK: 1.4, buds: 180, rootMap: 512, radialDrop: 2 }
    : { leaves: 7000, sapNP: 56, sapNPd: 20, sap: 1400, fire: 150, motes: 320, shellDetail: 5, blocks: 120, blockScale: 1, lineK: 1, buds: 420, rootMap: 1024, radialDrop: 0 };

  // ---------------------------------------------------------------- renderer / scene / camera
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
  renderer.setClearColor(BG, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  const camera = new THREE.PerspectiveCamera(isMobile ? 44 : 34, 1, 0.05, 150);
  const shift = isMobile ? { x: 0, y: 0.36 } : { x: 0.3, y: 0.02 };

  const col = (h: number) => new THREE.Color(h);
  const U = {
    uTime: { value: 0 }, uFlow: { value: 0 }, uS: { value: 0 }, uPx: { value: 600 },
    uMotion: { value: reducedMotion ? 0 : 1 },
    uFogColor: { value: col(BG) }, uFogDensity: { value: 0.04 },
    uRes: { value: new THREE.Vector2(1, 1) }, uMaskMode: { value: isMobile ? 1 : 0 }, uMaskFloor: { value: 0.3 },
    uMint: { value: col(0x7fe0c8) }, uLime: { value: col(0xc8f169) }, uPaper: { value: col(0xf6f5f0) },
    uBody: { value: col(0x0d4b4a) }, uT600: { value: col(0x1e7773) }, uT500: { value: col(0x2e948e) },
    uT400: { value: col(0x58b0a9) }, uT300: { value: col(0x8fcdc6) },
    uGrow: { value: new Array<number>(9).fill(0) }, uHi: { value: new Array<number>(9).fill(0) }, uAct: { value: new Array<number>(9).fill(0) },
    uTrace: { value: new Array<number>(9).fill(-1) }, uTrunkK: { value: 0.35 }, uSprout: { value: 0 },
    uPulse: { value: 0 }, uDim: { value: 0 }, uBands: { value: 0 }, uRootGlow: { value: 1 }, uSap: { value: 0 }, uRootSap: { value: 0.4 },
    uSapTrunk: { value: 1 }, uRetract: { value: 0 }, uSweep: { value: -1 }, uBudA: { value: 0 },
    uNear: { value: new THREE.Vector2(2.5, 5.0) }, uMaskX: { value: new THREE.Vector2(0.3, 0.47) },
    uSapSize: { value: isMobile ? 1.6 : 1 }, uSapMin: { value: isMobile ? 3.5 : 1.6 },
    uFire: { value: 0 }, uMotes: { value: 1 },
    uShell: { value: 0 }, uShellA: { value: 0 }, uHiShell: { value: 0 },
    uLeafHi: { value: 0 }, uLeafGlow: { value: 0.5 }, uDrift: { value: 0 },
    uBlockGlow: { value: 1 }, uLineK: { value: Q.lineK },
    uFruitS: { value: [0, 0, 0] }, uOrbitA: { value: 0 },
    uRootMap: { value: null as THREE.Texture | null }, uExtent: { value: 10 }, uRootGrow: { value: 0 }, uGridBase: { value: 0.6 }, uGridLit: { value: 1.5 },
    uBeat: { value: 1 }, uClock: { value: 0 }, uSeedGlow: { value: 1 }, uBirth: { value: 0 },
    uPaths: { value: null as THREE.Texture | null }, uNP: { value: Q.sapNP }, uNS: { value: 128 },
    uShellC: { value: new THREE.Vector3() }, uShellR: { value: 1 },
  };

  // ---------------------------------------------------------------- procedural tree
  // fruit tips are chosen for on-screen spread from the SOLVE, GROW and finale cameras
  const fruitViews: FruitView[] = [6, 7, 8].map((k) => ({
    az: THETA[k] + (k + 0.5 - 4.5) * DRIFT,
    el: EL[k],
    ...(k === 6 ? { d: 10.5 } : { dCrown: k === 7 ? 4.3 : 4.7 }),
  }));
  const tree = generateTree({ thetas: THETA.slice(1, 8), mobile: isMobile, fruitViews, textAz: isMobile ? null : THETA[1] + (1.5 - 4.5) * DRIFT });
  const rng = mulberry32(4711);

  const tubes = new THREE.Mesh(
    buildTubeGeometry(tree.curves, (c) => {
      const base = c.group === 1 ? 18 : c.group === 0 ? [6, 5, 4][c.level] : [10, 7, 5, 4][c.level];
      return Math.max(3, base - Q.radialDrop);
    }),
    M.tubeMaterial(U),
  );
  tubes.frustumCulled = false;
  scene.add(tubes);

  // ground
  const rootMap = buildRootMap(tree, Q.rootMap);
  U.uRootMap.value = rootMap;
  U.uExtent.value = tree.rootExtent;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), M.groundMaterial(U));
  ground.rotation.x = -Math.PI / 2;
  ground.renderOrder = -1;
  ground.frustumCulled = false;
  scene.add(ground);

  // seed: two husk halves + bright core + halo. The halves hinge open at the base like cotyledons
  // (split plane faces the CONSULT camera so the opening reads on screen), the sprout rises between them.
  const seedY = 0.26,
    seedR = 0.2;
  const seed = new THREE.Group();
  seed.position.set(0, seedY, 0);
  scene.add(seed);
  const huskMat = M.orbMaterial(U, { uIntensity: { value: 1 }, uHiO: { value: 0 }, uBandsO: { value: 0.35 } });
  const halfGeo = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI);
  const husks = new THREE.Group();
  husks.rotation.y = (THETA[1] + (1 - 4.5) * DRIFT + 90) * DEG;
  seed.add(husks);
  const hinges: THREE.Group[] = [];
  for (let k = 0; k < 2; k++) {
    const pivot = new THREE.Group();
    pivot.position.y = -seedR * 1.25;
    pivot.rotation.y = k * Math.PI;
    const m = new THREE.Mesh(halfGeo, huskMat);
    m.position.y = seedR * 1.25;
    m.scale.set(seedR, seedR * 1.3, seedR);
    pivot.add(m);
    husks.add(pivot);
    hinges.push(pivot);
  }
  const coreMat = M.orbMaterial(U, { uIntensity: { value: 1.2 }, uHiO: { value: 0 }, uBandsO: { value: 0 } });
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), coreMat);
  seed.add(core);
  const quad = new THREE.PlaneGeometry(1, 1);
  const seedHaloMat = M.haloMaterial(U, {
    uCenter: { value: new THREE.Vector3(0, seedY, 0) }, uSize: { value: 1.3 }, uColor: { value: col(0x7fe0c8) }, uIntensity: { value: 1 },
  });
  const seedHalo = new THREE.Mesh(quad, seedHaloMat);
  seedHalo.frustumCulled = false;
  scene.add(seedHalo);

  // sap / data streams (the first sapNPd paths end in the "decision" node at the tip of branch 2)
  const paths = buildSapTexture(tree, Q.sapNP, 128, Q.sapNPd);
  U.uPaths.value = paths;
  const sap = new THREE.Mesh(toQuads(buildSapParticles(Q.sapNP, Q.sap, rng)), M.sapMaterial(U));
  sap.frustumCulled = false;
  scene.add(sap);
  const m2 = tree.mains[1];
  const nodePos = m2.pts[m2.n - 1].clone();
  const nodeMat = M.haloMaterial(U, {
    uCenter: { value: nodePos }, uSize: { value: isMobile ? 1.0 : 0.8 }, uColor: { value: col(0x7fe0c8) },
    uCoreColor: { value: col(0xf6f5f0) }, uIntensity: { value: 0 }, uRing: { value: 0.55 },
  });
  const node = new THREE.Mesh(quad, nodeMat);
  node.frustumCulled = false;
  scene.add(node);

  // BUILD blocks on branch 3
  const blockList = buildBlocks(tree, rng, Q.blocks, Q.blockScale);
  const blockGeo = new THREE.BoxGeometry(1, 1, 1);
  const nB = blockList.length;
  const bFrom = new Float32Array(nB * 3),
    bIn = new Float32Array(nB * 3),
    bTime = new Float32Array(nB * 3);
  blockList.forEach((b, i) => {
    bFrom.set([b.from.x, b.from.y, b.from.z], i * 3);
    bIn.set([b.inward.x, b.inward.y, b.inward.z], i * 3);
    bTime.set([b.start, b.dur, b.order], i * 3);
  });
  blockGeo.setAttribute("aFrom", new THREE.InstancedBufferAttribute(bFrom, 3));
  blockGeo.setAttribute("aIn", new THREE.InstancedBufferAttribute(bIn, 3));
  blockGeo.setAttribute("aTime", new THREE.InstancedBufferAttribute(bTime, 3));
  const blocks = new THREE.InstancedMesh(blockGeo, M.blockMaterial(U), blockList.length);
  blockList.forEach((b, i) => blocks.setMatrixAt(i, b.m));
  blocks.instanceMatrix.needsUpdate = true;
  blocks.frustumCulled = false;
  scene.add(blocks);

  // buds on twig tips
  const buds = new THREE.Mesh(toQuads(buildBuds(tree, rng, Q.buds)), M.budMaterial(U));
  buds.frustumCulled = false;
  scene.add(buds);

  // fireflies + motes
  const flies = new THREE.Mesh(toQuads(buildFireflies(tree, Q.fire, Q.motes, rng)), M.fireflyMaterial(U));
  flies.frustumCulled = false;
  scene.add(flies);

  // SECURE shell around the canopy
  const shellC = tree.crownC.clone();
  const shellR = tree.crownR + 0.35;
  U.uShellC.value.copy(shellC);
  U.uShellR.value = shellR;
  const shell = new THREE.Mesh(buildShellGeometry(Q.shellDetail), M.shellMaterial(U));
  shell.position.copy(shellC);
  shell.scale.setScalar(shellR);
  shell.frustumCulled = false;
  scene.add(shell);

  // SOLVE fruits + orbits
  const fruitGeo = new THREE.SphereGeometry(1, 36, 24);
  const fruits = tree.fruits.map((f) => {
    const mat = M.fruitMaterial(U, { uIntensity: { value: 0.9 }, uHiO: { value: 0 }, uBandsO: { value: 0.5 } });
    const m = new THREE.Mesh(fruitGeo, mat);
    m.position.copy(f.pos);
    m.scale.setScalar(0.0001);
    m.visible = false;
    scene.add(m);
    const haloMat = M.haloMaterial(U, { uCenter: { value: f.pos.clone() }, uSize: { value: f.r * 6.5 }, uColor: { value: col(0x7fe0c8) }, uIntensity: { value: 0 } });
    const halo = new THREE.Mesh(quad, haloMat);
    halo.frustumCulled = false;
    scene.add(halo);
    return { f, m, mat, haloMat };
  });
  const orb = buildOrbits(tree.fruits, rng);
  const orbitLines = new THREE.LineSegments(orb.lines, M.orbitLineMaterial(U));
  orbitLines.frustumCulled = false;
  scene.add(orbitLines);
  const sats = new THREE.Mesh(toQuads(orb.sats), M.satelliteMaterial(U));
  sats.frustumCulled = false;
  scene.add(sats);

  // GROW leaves
  const leaves = new THREE.Mesh(toQuads(buildLeaves(tree, Q.leaves, rng)), M.leavesMaterial(U));
  leaves.frustumCulled = false;
  scene.add(leaves);

  // ---------------------------------------------------------------- camera keys (one per chapter)
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const trunkAt = (h: number) => tree.trunk.pts[Math.round((h / TREE.trunkH) * (tree.trunk.n - 1))];
  const mid = (c: Curve, f = 0.5) => c.pts[Math.floor((c.n - 1) * f)];
  const focus = (k: number, f: number) => trunkAt(TREE.H[k - 1]).clone().lerp(mid(tree.mains[k - 1]), f);
  const buildFocus = focus(3, 0.8);
  const fruitFocus = V(0, 0, 0);
  tree.fruits.forEach((f) => fruitFocus.add(f.pos));
  fruitFocus.multiplyScalar(1 / tree.fruits.length);
  const cy = tree.crownC.y,
    cr = tree.crownR;
  type Key = { t: THREE.Vector3; d: number; az: number; el: number };
  const K: Key[] = [
    { t: V(0, 0.3, 0), d: 3.7 },
    // CONSULT: lower and closer, aimed at the opening seed and its first shoot
    { t: focus(1, 0.42).setY(0.55), d: 7.8 },
    { t: focus(2, 0.3), d: 11.3 },
    { t: buildFocus, d: 8.4 },
    // OPERATE: raised so the 24-hour dial reads as a clock face around the trunk
    { t: V(0, 2.45, 0), d: 14.2 },
    { t: shellC.clone().add(V(0, 0.3, 0)), d: shellR * 4.6 },
    // SOLVE: pulled out of the crown so no limb crosses the text column
    { t: fruitFocus.clone().add(V(0, 0.4, 0)), d: 10.5 },
    { t: V(0, cy + 0.1, 0), d: cr * 4.3 },
    { t: V(0, cy - 0.3, 0), d: cr * 4.7 },
  ].map((k, i) => ({ ...k, az: THETA[i], el: EL[i] }));
  if (isMobile) {
    K.forEach((k, i) => {
      k.d *= [1.45, 1.62, 1.35, 1.55, 1.45, 1.62, 1.4, 1.62, 1.62][i];
    });
    // TRANSFORM on a phone: aim between the trunk column and the decision branch so the node stays in frame
    K[2].t = trunkAt(1.4).clone().lerp(mid(m2, 0.55), 0.5);
    K[6].t = fruitFocus.clone().add(V(0, 0.5, 0));
  }
  const tgt = new THREE.Vector3();
  // desktop: principal-point shift and distance adapt to the text column width (e.g. 1024x700)
  let aspectShift = 0,
    aspectD = 1;

  function updateProjection() {
    camera.updateProjectionMatrix();
    const e = camera.projectionMatrix.elements;
    e[8] = -(shift.x + aspectShift); // shift the principal point: the subject reads right of the text panel
    e[9] = -shift.y;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }
  // mobile SOLVE sits a little higher so the limbs clear the eyebrow and heading
  function mobileShiftY(s: number) {
    return 0.36 + 0.06 * sstep(5.72, 5.95, s) * (1 - sstep(6.8, 7.05, s));
  }

  function placeCamera(p: number, tm: number) {
    const { i, t } = segment(p);
    const s = p * 9;
    const x = clamp(i + t - 0.5, 0, 8);
    const k = Math.min(7, Math.floor(x));
    // intro -> CONSULT pulls back early, so the seed opens in a wide shot (not in the close-up)
    const w = k === 0 ? smoother((s - 0.62) / 0.4) : smoother((x - k - 0.18) / 0.64);
    const A = K[k],
      B = K[k + 1];
    tgt.lerpVectors(A.t, B.t, w);
    const d = lerp(A.d, B.d, w) * (1 + 0.02 * Math.sin(s * Math.PI * 2 - Math.PI / 2)) * aspectD;
    const az = (lerp(A.az, B.az, w) + (s - 4.5) * DRIFT + Math.sin(tm * 0.11) * 0.8) * DEG;
    const el = (lerp(A.el, B.el, w) + Math.sin(tm * 0.083) * 0.35) * DEG;
    camera.position.set(tgt.x + d * Math.sin(az) * Math.cos(el), tgt.y + d * Math.sin(el), tgt.z + d * Math.cos(az) * Math.cos(el));
    camera.lookAt(tgt);
    U.uFogDensity.value = 0.42 / d;
  }

  // ---------------------------------------------------------------- story schedule (pure function of s)
  const G = U.uGrow.value,
    HI = U.uHi.value,
    ACT = U.uAct.value,
    TR = U.uTrace.value;
  const active = (w: readonly [number, number], s: number) => sstep(w[0] - 0.03, w[0] + 0.03, s) * (1 - sstep(w[1] - 0.03, w[1] + 0.05, s));
  const traceAt = (s: number, t0: number, dur: number) => {
    const x = (s - t0) / dur;
    return x < 0 || x > 1 ? -1 : x * 1.2 - 0.08;
  };
  function beatCurve(t: number) {
    const ph = (t / 1.6) % 1;
    return Math.exp(-Math.pow((ph - 0.08) * 16, 2)) + 0.6 * Math.exp(-Math.pow((ph - 0.26) * 16, 2));
  }
  function schedule(s: number, tm: number) {
    G[0] = sstepW(TL.roots, s);
    let tr = 0;
    for (let k = 1; k <= 7; k++) tr += (tree.TOPL[k] - tree.TOPL[k - 1]) * sstepW(TL.trunk[k], s);
    G[1] = tr;
    for (let k = 1; k <= 7; k++) {
      G[k + 1] = sstepW(TL.branch[k], s);
      HI[k + 1] = sstep(k - 0.2, k + 0.1, s) * (1 - sstep(k + 0.8, k + 1.1, s));
    }
    ACT[0] = active(TL.roots, s);
    ACT[1] = 0;
    for (let k = 1; k <= 7; k++) {
      ACT[1] = Math.max(ACT[1], active(TL.trunk[k], s));
      ACT[k + 1] = active(TL.branch[k], s);
    }
    HI[0] = 0;
    HI[1] = HI[2]; // in CONSULT the stem of the sprout is part of the active shoot
    // finale roll-call: trunk first, then pillars 1 -> 7; finished before the finale text is fully in
    TR[0] = -1;
    TR[1] = traceAt(s, 7.72, 0.14);
    for (let k = 1; k <= 7; k++) TR[k + 1] = traceAt(s, 7.78 + (k - 1) * 0.045, 0.15);

    U.uS.value = s;
    U.uTime.value = tm;
    U.uFlow.value = tm + s * 0.8;
    U.uRootGrow.value = G[0];
    U.uGridBase.value = 0.55 + 0.45 * sstep(0.7, 1.2, s);
    U.uGridLit.value = 1.5 + 1.3 * sstep(1.0, 1.24, s) * (1 - sstep(1.75, 2.2, s));
    U.uBirth.value = clamp((s - 0.9) / 0.45);
    const beatOn = 1 - sstep(0.8, 1.0, s);
    U.uBeat.value = beatOn * (reducedMotion ? 0 : 1);
    U.uTrunkK.value = 0.22 + 0.43 * sstep(1.7, 2.15, s) + 0.35 * sstep(2.7, 3.1, s);
    U.uSprout.value = sstep(0.95, 1.12, s) * (1 - sstep(1.75, 2.2, s));
    U.uSap.value = sstep(1.72, 2.18, s) * (1 - 0.72 * sstep(2.78, 3.2, s));
    U.uSapTrunk.value = 1 - 0.9 * sstep(2.8, 3.2, s); // after TRANSFORM the flow lives in the branches
    U.uBands.value = sstep(2.72, 3.2, s) * (1 - 0.88 * sstep(3.8, 4.2, s));
    U.uRootGlow.value = 0.62 - 0.07 * sstep(1.8, 2.3, s);
    U.uRetract.value = sstep(3.8, 4.25, s);
    U.uBlockGlow.value = 1 - 0.88 * U.uRetract.value;
    // BUILD hold: an integration sweep runs along the finished modules (trunk -> tip)
    U.uSweep.value = s > 3.18 && s < 3.86 ? lerp(-0.12, 1.12, (s - 3.2) / 0.62) : -1;
    U.uPulse.value = sstep(3.72, 4.18, s) * (1 - 0.7 * sstep(4.78, 5.2, s));
    U.uDim.value = sstep(3.72, 4.18, s) * (1 - sstep(4.78, 5.2, s));
    U.uBudA.value = sstep(3.72, 4.15, s) * (1 - 0.7 * sstep(6.85, 7.2, s));
    // SOLVE: the text column is darker and the crown in front of the fruits falls off into the fog
    const solveK = sstep(5.75, 5.95, s) * (1 - sstep(6.85, 7.05, s));
    U.uMaskFloor.value = 0.3 - 0.18 * solveK;
    U.uNear.value.set(lerp(2.5, 4.2, solveK), lerp(5.0, 7.2, solveK));
    U.uFire.value = sstep(3.7, 4.2, s) * (1 - 0.55 * sstep(4.8, 5.2, s));
    U.uClock.value = sstep(3.72, 4.2, s) * (1 - sstep(4.75, 5.15, s));
    U.uShell.value = sstep(4.78, 5.24, s);
    U.uShellA.value = sstep(4.7, 4.75, s) * (1 - sstep(5.72, 6.1, s)) + 0.12 * sstep(7.7, 8.2, s);
    U.uHiShell.value = HI[6];
    U.uLeafHi.value = HI[8];
    U.uLeafGlow.value = 0.5 - 0.08 * sstep(7.7, 8.2, s);
    U.uDrift.value = sstep(7.75, 8.2, s);
    U.uMotes.value = 0.6 + 0.4 * sstep(0.8, 1.5, s);

    // seed: heartbeat, then a mint flash as the husk halves hinge open; the core sinks into the sprout,
    // the open halves stay at its foot through CONSULT and shrink away as the trunk rises
    const beat = reducedMotion ? 0 : beatCurve(tm);
    const open = sstepW(TL.seedOpen, s);
    const flash = sstep(0.86, 0.98, s) * (1 - sstep(1.0, 1.22, s));
    const coreK = 1 - sstep(1.02, 1.26, s);
    const hinge = 52 * DEG * smoother((s - 0.86) / 0.2);
    hinges[0].rotation.x = hinge;
    hinges[1].rotation.x = -hinge;
    const huskGone = sstep(1.62, 1.98, s);
    husks.scale.setScalar(Math.max(1e-4, 1 - huskGone));
    husks.visible = huskGone < 0.999;
    huskMat.uniforms.uIntensity.value = (0.9 + 0.35 * beat * beatOn) * (1 + 0.35 * open) * (1 - 0.35 * sstep(1.15, 1.5, s));
    core.scale.setScalar(Math.max(1e-4, seedR * (0.62 + 0.1 * beat * beatOn) * (1 + 0.2 * flash) * coreK));
    core.visible = coreK > 0.001;
    coreMat.uniforms.uIntensity.value = 1.15 + 0.8 * flash;
    seed.visible = husks.visible || core.visible;
    const baseHalo = (0.55 + 0.35 * beat * beatOn) * (1 - 0.75 * sstep(1.0, 1.4, s)) + 0.1 * (1 - sstep(1.7, 2.2, s));
    seedHaloMat.uniforms.uIntensity.value = (baseHalo + 0.55 * flash) * 0.8;
    seedHaloMat.uniforms.uSize.value = 1.25 + 1.8 * flash;
    seedHalo.visible = seedHaloMat.uniforms.uIntensity.value > 0.002;
    U.uSeedGlow.value = (1 + 0.5 * beat * beatOn + 0.8 * flash) * (1 - 0.6 * sstep(1.3, 2.0, s));

    // TRANSFORM: the decision node at the tip of branch 2 lights as the streams reach it
    const dn = sstep(2.0, 2.2, s) * (1 - sstep(2.8, 3.15, s));
    nodeMat.uniforms.uIntensity.value = dn * (1 + (reducedMotion ? 0 : 0.1 * Math.sin(tm * 2.2)));
    node.visible = dn > 0.001;

    // SOLVE fruits bloom as the branch-6 tips arrive
    const fs = U.uFruitS.value;
    for (let j = 0; j < fruits.length; j++) {
      const o = fruits[j];
      const b = clamp((s - Math.min(o.f.rev, 6.08)) / 0.15);
      fs[j] = b;
      const sc = o.f.r * easeOutBack(b);
      o.m.visible = b > 0.001;
      o.m.scale.setScalar(Math.max(0.0001, sc));
      o.mat.uniforms.uHiO.value = HI[7];
      o.mat.uniforms.uIntensity.value = 0.9 + 0.12 * HI[7];
      o.mat.uniforms.uBandsO.value = 0.5 * (1 - sstep(6.75, 7.2, s));
      o.haloMat.uniforms.uIntensity.value = sstep(0.2, 1, b) * (0.34 + 0.14 * HI[7]);
    }
    U.uOrbitA.value = 1 - 0.45 * sstep(6.8, 7.2, s);

    // skip systems that are fully hidden at this point of the story (still a pure function of s)
    sap.visible = U.uSap.value > 0.001;
    leaves.visible = s > TL.leaves[0] - 0.02;
    blocks.visible = s > TL.branch[3][0];
    buds.visible = s > TL.branch[1][0];
    shell.visible = U.uShellA.value > 0.002;
    orbitLines.visible = sats.visible = fs[0] > 0.6;
  }

  // ---------------------------------------------------------------- post: bloom + output
  // no MSAA: it doubled the frame cost on the UHD 630; bloom and analytic line AA carry the edges instead
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, rt);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const bloom = new DualBloomPass({ levels: isMobile ? 4 : 5, threshold: 0.36, knee: 0.3 });
  composer.addPass(bloom);
  const out = new ShaderPass(M.outputMaterial());
  out.uniforms.tBloom.value = bloom.texture;
  out.uniforms.uBloom.value = 0.46;
  composer.addPass(out);

  // ---------------------------------------------------------------- sizing + adaptive resolution
  // Starts at min(dpr, 1.5) (full dpr 2 measured 46-54 fps on a UHD 630; 1.5 keeps headroom). A sustained
  // slow frame EMA (> 19 ms for ~30 frames) queues a 0.25 step down (floor 0.75); there is no step up,
  // since rAF under 60 Hz vsync can never report the fast frames it would need. A queued change is only
  // applied while the story is at rest, so the render-target reallocation never hitches a scroll.
  let W = 1,
    H = 1,
    reqDpr = 1,
    curDpr = 0,
    ema = 16.7,
    lastT = -1,
    slow = 0,
    cool = 60,
    pendingDpr = 0,
    lastP = -1,
    still = 0;
  let lost = false,
    disposed = false;
  const buf = new THREE.Vector2();
  function applySize() {
    renderer.setPixelRatio(curDpr);
    renderer.setSize(W, H, false);
    composer.setPixelRatio(curDpr);
    composer.setSize(W, H);
    renderer.getDrawingBufferSize(buf);
    U.uRes.value.copy(buf);
    U.uPx.value = buf.y / (2 * Math.tan((camera.fov * DEG) / 2));
  }
  function adapt(time: number, p: number) {
    if (fixedDpr) return;
    still = Math.abs(p - lastP) < 2e-5 ? still + 1 : 0;
    lastP = p;
    const dt = lastT < 0 ? 0 : (time - lastT) * 1000;
    lastT = time;
    if (pendingDpr && still > 8) {
      curDpr = pendingDpr;
      pendingDpr = 0;
      applySize();
      cool = 90;
      ema = 16.7;
      return;
    }
    if (!(dt > 0 && dt < 120)) return;
    ema += (dt - ema) * 0.08;
    if (cool > 0) {
      cool--;
      return;
    }
    slow = ema > 19 ? slow + 1 : 0;
    const from = pendingDpr || curDpr;
    if (slow > 30 && from > 0.75) {
      pendingDpr = Math.max(0.75, from - 0.25);
      slow = 0;
      cool = 90;
      ema = 16.7;
    }
  }
  // three.js already calls preventDefault on context loss (so the browser may restore it); rendering is
  // skipped while lost and the render targets are rebuilt on restore.
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
  };
  const onRestored = () => {
    lost = false;
    applySize();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  // Compile every program up front (async where KHR_parallel_shader_compile exists), so no chapter
  // hitches on the frame its system first appears.
  fruits.forEach((o) => (o.m.visible = true));
  await renderer.compileAsync(scene, camera);
  fruits.forEach((o) => (o.m.visible = false));

  return {
    resize(width, height, dpr) {
      if (disposed) return;
      W = Math.max(1, width);
      H = Math.max(1, height);
      if (dpr !== reqDpr || !curDpr) {
        reqDpr = dpr;
        curDpr = fixedDpr ? dpr : Math.min(dpr, 1.5);
        pendingDpr = 0;
      }
      camera.aspect = W / H;
      if (!isMobile) {
        // the text column is ~fixed in CSS px, so on narrower windows it covers more of the frame:
        // move the subject right, pull back, and widen the mask
        const e = Math.min(0.62, textColumnRight(W) / W);
        aspectShift = Math.min(0.5, Math.max(0.3, 2 * (e + 0.23) - 1)) - 0.3;
        aspectD = Math.max(1, Math.pow(0.93 / (((1 - e) * W) / H), 0.7));
        U.uMaskX.value.set(e - 0.12, e + 0.05);
      }
      updateProjection();
      applySize();
    },
    render(time, p) {
      if (lost || disposed) return;
      p = clamp(p);
      adapt(time, p);
      const tm = reducedMotion ? 0 : time;
      const s = p * 9;
      schedule(s, tm);
      if (isMobile) {
        const sy = mobileShiftY(s);
        if (sy !== shift.y) {
          shift.y = sy;
          updateProjection();
        }
      }
      placeCamera(p, tm);
      out.uniforms.uSeed.value = reducedMotion ? 0 : (time * 60) % 97;
      composer.render(0);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      const geos = new Set<THREE.BufferGeometry>();
      const mats = new Set<THREE.Material>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) geos.add(m.geometry);
        if (m.material) (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => mats.add(x));
        if ((o as THREE.InstancedMesh).isInstancedMesh) (o as THREE.InstancedMesh).dispose();
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((x) => x.dispose());
      rootMap.dispose();
      paths.dispose();
      bloom.dispose();
      out.dispose();
      renderPass.dispose();
      composer.dispose();
      rt.dispose();
      scene.clear();
      renderer.dispose();
      // free the GPU context now instead of at GC time (each canvas is used by one scene only)
      renderer.forceContextLoss();
    },
  };
}
