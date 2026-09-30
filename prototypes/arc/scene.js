// Concept "arc" — The smile path. A journey along chained, luminous smile arcs (the logo's signature),
// passing seven station sculptures that grow out of the path; the finale relaxes the whole path into one
// big smile and a light sweep runs Consult -> Grow along it.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { segment, clamp, smoothstep, lerp } from "../shared/story.js";
import { point, pointSm, macroTangent, tangent, tangentSm, leftOf, buildTable, buildTubeGeometry, buildCapGeometry, buildStemGeometry, X0, X1 } from "./path.js";
import { buildStation, buildDust, buildTerminal } from "./sculptures.js";
import { tubeVert, tubeFrag, gradeShader } from "./shaders.js";

const STAGE = "#052626";
const D2R = Math.PI / 180;
const Y = new THREE.Vector3(0, 1, 0);
const QI = new THREE.Quaternion();
const W_TRANS = 0.25; // half-width (in chapters) of each camera transition, centred on chapter boundaries
const XI = 1 - X0;    // intro smile end (symmetric with the path start)
const STEM_MAX = 16;

// Per-station hero camera, in the station frame: A behind, B outside, C above; zoom < 1 = closer.
const CAMS = [null,
  { A: 0.84, B: 0.47, C: 0.3 },                            // CONSULT: classic three-quarter
  { A: 0.62, B: 0.74, C: 0.17 },                           // TRANSFORM: side-on, the stream climbs out of the path
  { A: 0.8, B: 0.56, C: 0.03, zoom: 0.97 },                // BUILD: low, the tower looms
  { A: 0.5, B: 0.86, C: 0.2 },                             // OPERATE: side-on, the path as a horizon
  { A: 0.86, B: 0.36, C: 0.34, zoom: 0.9, roll: 0.05 },    // SECURE: closer, slight roll
  { A: 0.64, B: 0.42, C: 0.66 },                           // SOLVE: high, orbits open up
  { A: 0.8, B: 0.52, C: -0.04, ty: -0.5 },                 // GROW: low, looking up the stem
];

function additive(uniforms, vertexShader, fragmentShader, defines) {
  return new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, defines, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending });
}

export function createScene({ canvas, reducedMotion, isMobile }) {
  const q = isMobile ? 0.55 : 1;
  const idle = reducedMotion ? 0 : 1;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setClearColor(STAGE, 1);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(STAGE);
  const vfov = isMobile ? 52 : 38;
  const camera = new THREE.PerspectiveCamera(vfov, 1, 0.1, 1200);

  const G = {
    uTime: { value: 0 }, uFlow: { value: 0 }, uIdle: { value: idle }, uPxScale: { value: 0.001 }, uPixelRatio: { value: 1 },
    uFogStart: { value: 12 }, uFogRange: { value: 30 }, uLime: { value: new THREE.Color("#C8F169") },
  };
  const V = () => new THREE.Vector3();

  // ---------------------------------------------------------------- path + tube
  const rI = 1.55, rP = 0.062, rF = isMobile ? 0.55 : 0.42;
  const table = buildTable(isMobile ? 180 : 280);
  const sXI = table.sAt(XI);
  const tubeU = {
    uRadius: { value: rI }, uRadius2: { value: rP }, uSplitS: { value: 1e9 }, uSmooth: { value: 0 }, uSOff: { value: 0 },
    uPxScale: G.uPxScale, uMinPx: { value: 1.0 }, uMaxPx: { value: 1e4 }, uReveal: { value: 0 }, uFlow: { value: 0 }, uGlow: { value: 1 },
    uHead: { value: 0 }, uThick: { value: 1 }, uFogStart: G.uFogStart, uFogRange: G.uFogRange, uCapS: { value: 0 },
    uSweepS: { value: -1e3 }, uSweepW: { value: 6 }, uSweepAmt: { value: 0 }, uCharge: { value: 0 },
    uColA: { value: new THREE.Color("#1E7773") }, uColB: { value: new THREE.Color("#7FE0C8") }, uColC: { value: new THREE.Color("#F6F5F0") }, uColP: { value: new THREE.Color("#C2E5E0") },
  };
  const tube = new THREE.Mesh(buildTubeGeometry(table, isMobile ? 14 : 24), additive(tubeU, tubeVert, tubeFrag));
  tube.frustumCulled = false;
  scene.add(tube);
  const capGeo = buildCapGeometry();
  const mkCap = (over = {}) => {
    const m = new THREE.Mesh(capGeo, additive({ ...tubeU, uCapS: { value: 0 }, ...over }, tubeVert, tubeFrag, { CAP: "" }));
    m.frustumCulled = false; scene.add(m); return m;
  };
  const capStart = mkCap(), capMid = mkCap(), capHead = mkCap({ uRadius: { value: rI }, uThick: { value: 1 } });
  capMid.material.uniforms.uCapS.value = sXI;
  point(XI, capMid.position);
  capMid.quaternion.setFromUnitVectors(Y, tangent(XI, V()));
  const terms = [buildTerminal({ G, seed: 77 }), buildTerminal({ G, seed: 78 })];
  terms.forEach((t) => scene.add(t.obj));
  const tmp = V(), tmp2 = V(), tmp3 = V();

  // ---------------------------------------------------------------- stations (+ energy stems out of the path)
  const stemGeo = buildStemGeometry(STEM_MAX, isMobile ? 8 : 10, 40);
  const SF = isMobile ? 2.2 : 1.15; // finale bead scale gain
  const stations = [];
  for (let k = 1; k <= 7; k++) {
    const cam = CAMS[k];
    const st = buildStation(k, { G, q, seed: 9001 + k * 131 });
    const S = point(k, V());
    const T = macroTangent(k, V());
    const Lv = leftOf(T, V());
    const Q = S.clone().addScaledVector(Y, st.h);
    const dir = V().addScaledVector(T, -cam.A).addScaledVector(Lv, cam.B).addScaledVector(Y, cam.C).normalize();
    const Zl = V().set(dir.x, 0, dir.z).normalize();
    const Xl = V().crossVectors(Y, Zl);
    st.root.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(Xl, Y, Zl));
    st.root.position.copy(Q);
    scene.add(st.root);
    const faceF = st.root.quaternion.clone().invert(); // finale: every bead turns to the front camera
    const sOff = table.sAt(k);
    const stemU = {
      ...tubeU, uReveal: { value: sOff }, uHead: { value: 0 }, uSOff: { value: sOff }, uRadius: { value: rP * 0.45 }, uRadius2: { value: rP * 0.45 },
      uSplitS: { value: 1e9 }, uSmooth: { value: 0 }, uThick: { value: 0 }, uGlow: { value: 1 }, uSweepAmt: { value: 0 }, uCharge: { value: 0 },
    };
    const stem = new THREE.Mesh(stemGeo, additive(stemU, tubeVert, tubeFrag));
    stem.frustumCulled = false;
    stem.position.copy(S);
    scene.add(stem);
    const lift = Math.max(0, -st.bot * (1 + SF) + 1.3 - st.h);
    stations.push({ ...st, k, cam, Spos: S, T, L: Lv, Q, dir, faceF, stem, stemU, sOff, lift });
  }

  // bounds of the whole smile (finale framing + dust volume)
  const box = new THREE.Box3();
  for (let i = 0; i <= 200; i++) box.expandByPoint(point(lerp(X0, X1, i / 200), tmp));
  for (const st of stations) { box.expandByPoint(tmp.copy(st.Q).addScalar(3.2)); box.expandByPoint(tmp.copy(st.Q).addScalar(-3.2)); }
  const dustBounds = box.clone().expandByVector(V().set(26, 18, 30));
  const dust = buildDust({ G, q, bounds: dustBounds, seed: 424242 });
  scene.add(dust.obj);
  // finale framing box: the relaxed arc plus the lifted, scaled beads
  const fbox = new THREE.Box3();
  for (let i = 0; i <= 200; i++) fbox.expandByPoint(pointSm(lerp(X0, X1, i / 200), 1, tmp));
  for (const st of stations) {
    const c = pointSm(st.k, 1, tmp).addScaledVector(Y, st.h + st.lift), s = 1 + SF;
    fbox.expandByPoint(tmp2.copy(c).add(tmp3.set(st.r * s, st.top * s, 0)));
    fbox.expandByPoint(tmp2.copy(c).add(tmp3.set(-st.r * s, st.bot * s, 0)));
  }
  const fCenter = fbox.getCenter(V());

  // ---------------------------------------------------------------- camera keyframes (index = 2σ)
  const K = [];
  let orbitSign = 1;
  {
    const pts = [];
    for (let i = 0; i <= 40; i++) pts.push(point(lerp(X0, XI, i / 40), V()));
    const c0 = new THREE.Box3().setFromPoints(pts).getCenter(V());
    const a = point(X0, V()), b = point(XI, V()), m = point(0.5, V());
    const chord = V().subVectors(b, a), sag = V().subVectors(m, tmp.addVectors(a, b).multiplyScalar(0.5));
    const T0 = macroTangent(0.5, V()), L0 = leftOf(T0, V());
    const nrm = V().crossVectors(chord, sag).normalize();
    if (nrm.dot(L0) < 0) nrm.negate();
    const up0 = sag.clone().negate().normalize();
    // face the first smile's own plane (a symmetric U, like the logo), tilted up 8° in the smile's frame
    const dir0 = nrm.clone().multiplyScalar(Math.cos(8 * D2R)).addScaledVector(up0, Math.sin(8 * D2R)).normalize();
    K[0] = { tgt: c0, dir: dir0, rw: 11.4, rh: 4.9, dsx: 0.04 };
    const d1 = V().addScaledVector(L0, 0.78).addScaledVector(T0, -0.55).addScaledVector(Y, 0.3).normalize();
    K[1] = { tgt: c0.clone().lerp(stations[0].Q, 0.6), dir: d1, rw: 6.8, rh: 6.8, dsx: 0.03 };
    orbitSign = Math.sign(tmp.crossVectors(dir0, d1).y) || 1;
  }
  stations.forEach((st, n) => {
    const z = st.cam.zoom || 1;
    K[2 + n * 2] = { tgt: st.Q.clone().addScaledVector(Y, st.ty + (st.cam.ty || 0)), dir: st.dir.clone(), rw: st.r * z, rh: st.rh * z, dsx: 0, roll: st.cam.roll || 0 };
    if (n < 6) {
      // boundary: the camera is already turning to the next station, which assembles out of the path on the right
      const nx = stations[n + 1];
      const tg = st.Q.clone().lerp(nx.Q, 0.64).addScaledVector(Y, -1.1);
      const Lm = st.L.clone().add(nx.L).normalize();
      const d = st.dir.clone().multiplyScalar(0.4).addScaledVector(nx.dir, 0.6).addScaledVector(Lm, 0.3).addScaledVector(Y, 0.02).normalize();
      const rr = (st.r + nx.r) * 0.5 * 1.3;
      K[3 + n * 2] = { tgt: tg, dir: d, rw: rr, rh: rr, dsx: 0.075 };
    }
  });
  const dirF = (isMobile ? V().set(0, 0.75, 0.66) : V().set(0, 0.6, 0.8)).normalize();
  K[16] = { tgt: fCenter.clone(), dir: dirF, rw: (fbox.max.x - fbox.min.x) / 2, rh: (fbox.max.y - fbox.min.y) / 2 + 2, dsx: 0.01, fin: true };
  K[15] = { tgt: K[14].tgt.clone().lerp(K[16].tgt, 0.3).addScaledVector(Y, 5), dir: K[14].dir.clone().multiplyScalar(0.55).addScaledVector(dirF, 0.45).addScaledVector(Y, 0.2).normalize(), dsx: 0.01, geo: true };

  const curT = new THREE.CatmullRomCurve3(K.map((k) => k.tgt), false, "centripetal");
  const curD = new THREE.CatmullRomCurve3(K.map((k) => k.dir), false, "centripetal");
  const curR = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(k.roll || 0, 0, 0)), false, "catmullrom", 0.5);
  let curS = null, roll0 = 0;
  const frame = { sx: 0.16, sy: 0, fw: 0.52, fh: 0.6 };

  // free screen area around the text panels and the chapter rail (CSS px -> fractions)
  function measure(W, H) {
    const f = { sx: 0.16, sy: 0, fw: 0.52, fh: 0.6 };
    if (isMobile) return { sx: 0, sy: 0.2, fw: 0.72, fh: 0.4 };
    const cr = canvas.getBoundingClientRect();
    const panels = document.querySelectorAll(".panel");
    const rail = document.querySelector(".rail");
    if (!panels.length) return f;
    let right = 0, top = Infinity;
    panels.forEach((el) => { const r = el.getBoundingClientRect(); right = Math.max(right, r.right - cr.left); top = Math.min(top, r.top - cr.top); });
    const railLeft = rail ? rail.getBoundingClientRect().left - cr.left : W;
    const a = W / H;
    // right column (default) vs the band above the text (portrait screens)
    const colW = Math.max(0.36, ((railLeft - right) / W) * 1.08);
    const colC = Math.min((right + railLeft) / 2 / W, railLeft / W - 0.015 - colW / 2);
    const colScore = Math.min(colW * a, 0.6);
    const topH = Math.max(0.1, top / H - 0.1) * 0.95;
    const topScore = Math.min(0.8 * a, topH);
    if (a < 0.9 && topScore > colScore) return { sx: 0, sy: 0.5 - (0.08 + top / H - 0.02) / 2, fw: 0.8, fh: topH };
    return { sx: colC - 0.5, sy: 0, fw: Math.min(0.56, colW), fh: 0.6 };
  }

  function layout(W, H) {
    const aspect = W / H;
    Object.assign(frame, measure(W, H));
    const hs = 2 * Math.tan((vfov / 2) * D2R), ws = hs * aspect;
    for (const k of K) {
      if (k.geo) continue;
      const fw = k.fin ? (isMobile ? 0.94 : Math.min(0.62, frame.fw * 1.12)) : frame.fw, fh = k.fin && isMobile ? 0.38 : frame.fh;
      k.d = Math.max((2 * k.rh) / (fh * hs), (2 * k.rw) / (fw * ws));
    }
    K[15].d = Math.sqrt(K[14].d * K[16].d);
    const finSy = isMobile ? 0.21 - frame.sy : 0;
    curS = new THREE.CatmullRomCurve3(K.map((k, i) => new THREE.Vector3(Math.log(k.d), isMobile ? 0 : k.dsx, i === 16 ? finSy : 0)), false, "centripetal");
    // level the intro smile on screen
    camera.position.copy(K[0].tgt).addScaledVector(K[0].dir, K[0].d);
    camera.up.copy(Y); camera.lookAt(K[0].tgt); camera.updateMatrixWorld();
    const a = point(X0, tmp).applyMatrix4(camera.matrixWorldInverse);
    const b = point(XI, tmp2).applyMatrix4(camera.matrixWorldInverse);
    roll0 = Math.atan2(b.y - a.y, b.x - a.x);
    if (roll0 > Math.PI / 2) roll0 -= Math.PI; else if (roll0 < -Math.PI / 2) roll0 += Math.PI;
  }

  // ---------------------------------------------------------------- post
  // No MSAA (it cost ~3x on UHD 630): FXAA at the end instead. Bloom at reduced res with true Gaussian weights.
  const BQ = 0.5;
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.9, 0.0, 0.28);
  const KR = [3, 5, 7, 9, 11];
  bloom.separableBlurMaterials.forEach((m, i) => {
    const r = KR[i], s = r / 2.6;
    m.uniforms.gaussianCoefficients.value = Array.from({ length: r }, (_, j) => Math.exp((-0.5 * j * j) / (s * s)));
  });
  bloom.compositeMaterial.uniforms.bloomFactors.value = [1.0, 0.9, 0.62, 0.34, 0.14];
  composer.addPass(bloom);
  const grade = new ShaderPass(gradeShader);
  grade.uniforms.uStage.value = new THREE.Color(STAGE);
  grade.uniforms.uFadeY.value = isMobile ? 0.55 : 0;
  composer.addPass(grade);
  const fxaa = new ShaderPass(FXAAShader);
  composer.addPass(fxaa);

  let W = 1, H = 1;
  const tgt = V(), dir = V(), sc = V(), rl = V();
  const sOf = (x) => (x < X0 ? (x - X0) * 22 : x > X1 ? table.length + (x - X1) * 22 : table.sAt(x));

  return {
    resize(w, h, dpr) {
      W = Math.max(1, w); H = Math.max(1, h);
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
      composer.setPixelRatio(dpr);
      composer.setSize(W, H);
      bloom.setSize(Math.round(W * dpr * BQ * 2), Math.round(H * dpr * BQ * 2));
      fxaa.uniforms.resolution.value.set(1 / (W * dpr), 1 / (H * dpr));
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      G.uPxScale.value = (2 * Math.tan((vfov / 2) * D2R)) / H;
      G.uPixelRatio.value = dpr;
      layout(W, H);
    },
    render(time, p) {
      p = clamp(p);
      const tt = time * idle;
      const s9 = p * 9;
      let sig = 0;
      for (let b = 1; b <= 8; b++) sig += smoothstep(b - W_TRANS, b + W_TRANS, s9);
      const u = sig / 8;
      curT.getPoint(u, tgt); curD.getPoint(u, dir).normalize(); curS.getPoint(u, sc); curR.getPoint(u, rl);
      const fin = smoothstep(7.15, 7.85, sig);

      // intro: the first ~80vh of scroll already moves things (slow orbit, light sweep, thread peeking out)
      const io = smoothstep(0.05, 0.75, s9);
      const ioFade = 1 - smoothstep(0.0, 0.9, sig);
      dir.applyAxisAngle(Y, orbitSign * 9 * D2R * io * ioFade);
      const { t } = segment(p);
      const dd = t - 0.5, drift = dd * (1 - smoothstep(0.3, 0.5, Math.abs(dd)));
      const dist = Math.exp(sc.x) * (1 - 0.1 * drift) * (1 - 0.07 * io * ioFade);
      dir.applyAxisAngle(Y, 0.07 * drift);
      tgt.x += Math.sin(tt * 0.21) * 0.0025 * dist;
      tgt.y += Math.sin(tt * 0.17 + 1.3) * 0.002 * dist;
      camera.position.copy(tgt).addScaledVector(dir, dist);
      camera.up.copy(Y);
      camera.lookAt(tgt);
      const frac = sig - Math.floor(sig);
      const bank = sig > 1 && sig < 7 ? -Math.sin(Math.PI * frac) * 0.03 : 0;
      camera.rotateZ(roll0 * (1 - smoothstep(0.0, 0.8, sig)) + bank + rl.x);
      camera.setViewOffset(W, H, -(frame.sx + sc.y) * W, (frame.sy + sc.z) * H, W, H);

      G.uTime.value = tt;
      G.uFlow.value = tt * 0.5 + p * 24;
      G.uFogStart.value = dist * 0.85;
      G.uFogRange.value = dist * 2.4;

      // finale light sweep, Consult end -> Grow end (finale t 0.2 .. 0.75)
      const sw = smoothstep(8.18, 8.75, s9);
      const xs = lerp(-0.5, 8.5, sw);
      const swAmp = fin * smoothstep(0.0, 0.06, sw) * (1 - smoothstep(0.92, 1.0, sw));

      const sm = fin;
      for (const st of stations) {
        const k = st.k;
        const a = smoothstep(k - 0.92, k - 0.08, sig);
        const act = 1 - smoothstep(0.2, 0.45, Math.abs(sig - k));
        const flare = swAmp * Math.exp(-(((xs - k) / 0.34) ** 2));
        const lit = fin * smoothstep(k - 0.3, k + 0.15, xs);
        st.S.uAssemble.value = a;
        st.S.uActive.value = Math.max(act, fin * (0.14 + 0.86 * flare));
        st.S.uGlow.value = lerp(lerp(0.4, 1.0, act), 0.72 + 0.14 * lit + 0.5 * flare, fin);
        const s = 1 + SF * fin;
        st.S.uSizeScale.value = s;
        st.body.scale.setScalar(s);
        st.body.quaternion.slerpQuaternions(QI, st.faceF, fin);
        const ly = st.lift * fin;
        st.body.position.y = ly;
        const bead = pointSm(k, sm, st.S.uBead.value);
        st.root.position.copy(bead).addScaledVector(Y, st.h);
        st.stem.position.copy(bead);
        // the bead glints before its station is reached, so the path always leads somewhere
        const glint = 0.55 * smoothstep(k - 1.8, k - 1.15, sig);
        st.SB.uGlow.value = Math.max(glint, a) * (1 + 0.35 * fin + 0.8 * flare);
        st.SB.uActive.value = st.S.uActive.value;
        st.SB.uSizeScale.value = 1 + 0.6 * fin;
        // energy stem grows from the bead into the sculpture base, then carries the path's pulses up
        const len = st.h + st.stemTop * s + ly;
        const grow = smoothstep(0.0, 0.42, a);
        st.stemU.uReveal.value = st.sOff + len * grow;
        // bright while it feeds the assembling sculpture, then a faint filament (no stick-figure silhouette)
        const feed = smoothstep(0.0, 0.12, a) * (1 - smoothstep(0.6, 1.0, a));
        st.stemU.uHead.value = 1.2 * feed;
        st.stemU.uGlow.value = lerp(0.22 + 0.12 * act + 1.1 * feed, 0.55 + 0.9 * flare, fin);
        st.stemU.uCharge.value = lit * 0.8;
        st.stemU.uRadius.value = st.stemU.uRadius2.value = lerp(rP * 0.42, rF * 0.3, fin);
        st.socket.position.set(0, st.stemTop * s + ly, 0);
        st.SK.uGlow.value = smoothstep(0.3, 0.55, a) * lerp(lerp(0.5, 1.0, act), 1.0, fin);
        st.SK.uSizeScale.value = 1 + 0.8 * fin;
        st.update(a, p, tt);
      }

      // ---- tube: thick intro smile -> thin thread -> relaxed finale arc
      let rad;
      if (sig < 1) rad = Math.exp(lerp(Math.log(rI), Math.log(rP), smoothstep(0.02, 0.6, sig)));
      else rad = Math.exp(lerp(Math.log(rP), Math.log(rF), fin));
      tubeU.uRadius.value = rad;
      tubeU.uMaxPx.value = lerp(1e4, isMobile ? 4 : 4.5, smoothstep(0.15, 0.7, sig));
      tubeU.uRadius2.value = rP;
      tubeU.uSmooth.value = sm;
      tubeU.uThick.value = smoothstep(0.3, 1.5, rad);
      tubeU.uSplitS.value = sig < 1 ? sXI : 1e9;
      const peek = smoothstep(0.4, 0.75, s9);
      const xr = sig < 1 ? Math.max(XI + 0.2 * peek, lerp(XI, 2.2, smoothstep(0.34, 1.0, sig))) : Math.min(X1, sig + 1.2);
      const sRev = table.sAt(xr);
      tubeU.uReveal.value = sRev;
      const split = sig < 1 && xr > XI + 1e-4;
      capMid.visible = split && rad > rP * 1.05;
      const cu = capHead.material.uniforms;
      cu.uCapS.value = sRev;
      cu.uRadius.value = split ? rP : rad;
      cu.uThick.value = split ? 0 : tubeU.uThick.value;
      pointSm(xr, sm, capHead.position);
      capHead.quaternion.setFromUnitVectors(Y, tangentSm(xr, sm, tmp));
      pointSm(X0, sm, capStart.position);
      capStart.quaternion.setFromUnitVectors(Y, tangentSm(X0, sm, tmp).negate());
      tubeU.uHead.value = smoothstep(0.05, 0.4, sig) * (1 - smoothstep(6.45, 6.78, sig));
      tubeU.uFlow.value = tt * 2.2 + p * 140;
      tubeU.uGlow.value = lerp(1, 0.9, fin);
      if (sig < 1) {
        // a band of light runs through the glass smile and pushes the thread out of its end
        tubeU.uSweepS.value = lerp(-5, sXI + 3, smoothstep(0.06, 0.62, s9));
        tubeU.uSweepW.value = 14;
        tubeU.uSweepAmt.value = smoothstep(0.02, 0.12, s9) * (1 - smoothstep(0.1, 0.6, sig));
        tubeU.uCharge.value = 0;
      } else {
        tubeU.uSweepS.value = sOf(xs);
        tubeU.uSweepW.value = 7;
        tubeU.uSweepAmt.value = swAmp * 1.3;
        tubeU.uCharge.value = fin * 0.85;
      }
      // round terminals at both ends of the finale smile
      for (let i = 0; i < 2; i++) {
        const x = i ? X1 : X0;
        pointSm(x, sm, terms[i].obj.position).addScaledVector(tangentSm(x, sm, tmp), (i ? 1 : -1) * rad * 0.4);
        terms[i].S.uGlow.value = fin * (1 + 0.6 * swAmp * Math.exp(-(((xs - x) / 0.4) ** 2)));
        terms[i].S.uSizeScale.value = isMobile ? 1.5 : 1;
      }

      dust.S.uGlow.value = 0.55 * (1 - 0.6 * fin);
      composer.render();
    },
  };
}
