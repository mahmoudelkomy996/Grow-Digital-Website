// GLSL materials for "The digital tree". All animation is uniform-driven; nothing is rebuilt per frame.
import * as THREE from "three";

export type Uniforms = Record<string, THREE.IUniform>;

const FOG = /* glsl */ `
uniform vec3 uFogColor;
uniform float uFogDensity;
float fogAmount(float d) { return 1.0 - exp(-uFogDensity * uFogDensity * d * d); }
`;

// Screen-space protection for the text column (desktop: left ~40%, mobile: bottom ~45%).
// Every emissive material multiplies (additive) or mixes toward the stage (opaque) by this.
const MASK = /* glsl */ `
uniform vec2 uRes;
uniform float uMaskMode;
uniform float uMaskFloor;
uniform vec2 uMaskX;
float protectMask() {
  vec2 f = gl_FragCoord.xy / uRes;
  float d = smoothstep(uMaskX.x, uMaskX.y, f.x);
  float m = smoothstep(0.46, 0.60, f.y);
  return mix(uMaskFloor, 1.0, mix(d, m, uMaskMode));
}
`;

const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
const f3 = (v: number) => v.toFixed(3);

// ------------------------------------------------------------------ tubes (roots, trunk, branches)
export function tubeMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `
      attribute vec3 aOffset;
      attribute vec4 aData; // local growth, path distance, group, radius
      attribute float aAng;
      uniform float uGrow[9];
      uniform float uHi[9];
      uniform float uAct[9];
      uniform float uTrace[9];
      uniform float uTrunkK;
      varying float vAct;
      varying vec3 vW;
      varying vec3 vN;
      varying float vLocal;
      varying float vGrowV;
      varying float vHi;
      varying float vPd;
      varying float vRad;
      varying float vGroup;
      varying float vAng;
      varying float vTr;
      void main() {
        int g = int(aData.z + 0.5);
        float grow = uGrow[g];
        float act = uAct[g];
        // roots grow as fine lines with a short point; trunk/branches as tapered shoots
        // (a resting trunk top gets a short window: a rounded cap about one radius long)
        float win = g == 0 ? mix(0.012, 0.02, act) : (g == 1 ? mix(0.014, 0.045, act) : mix(0.03, 0.045, act));
        float k = clamp((grow - aData.x) / win, 0.0, 1.0);
        k = mix(sqrt(k), k, act); // a resting tip is a rounded bud, a growing tip is a sharp shoot
        // the trunk (and the first shoot) start as a thin sprout and thicken as the tree rises
        float kk = (g == 1 || g == 2) ? uTrunkK : 1.0;
        vec3 pos = position + aOffset * mix(0.18, 1.0, k) * kk;
        vAct = act;
        vec4 w = modelMatrix * vec4(pos, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * aOffset);
        vLocal = aData.x; vGrowV = grow; vHi = uHi[g]; vPd = aData.y; vRad = aData.w * kk; vGroup = aData.z; vAng = aAng;
        vTr = uTrace[g];
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform vec3 uLime;
      uniform vec3 uPaper;
      uniform vec3 uBody;
      uniform float uFlow;
      uniform float uPulse;
      uniform float uBands;
      uniform float uRootGlow;
      uniform float uSprout;
      varying float vAct;
      varying vec3 vW;
      varying vec3 vN;
      varying float vLocal;
      varying float vGrowV;
      varying float vHi;
      varying float vPd;
      varying float vRad;
      varying float vGroup;
      varying float vAng;
      varying float vTr;
      uniform float uDim;
      uniform vec2 uNear;
      void main() {
        if (vLocal > vGrowV || vGrowV < 0.0005) discard;
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.2);
        // everything is lit in mint; the active pillar's lime is applied at the end, only where the
        // pixel is bright (dim lime reads olive against the teal stage)
        vec3 glowF = uMint;
        vec3 glowB = uMint;
        float isRoot = 1.0 - step(0.5, vGroup);
        float isStem = step(0.5, vGroup) * (1.0 - step(2.5, vGroup));
        float gk = mix(1.0, uRootGlow, isRoot);
        float thin = 1.0 - smoothstep(0.008, 0.07, vRad);
        // fibre streaks give the thick limbs an organic, grown look instead of a smooth pipe
        float fib = 0.5 + 0.5 * sin(vAng * 6.2831853 * 9.0 + sin(vPd * 3.1) * 1.4 + vGroup * 1.7);
        float thick = smoothstep(0.03, 0.09, vRad);
        vec3 col = uBody * (0.1 + 0.35 * ndv) * (1.0 - 0.35 * fib * thick);
        col += gk * (glowF * fres * (0.95 + vHi * 0.55) + glowB * (thin * (0.32 + 0.22 * vHi) + 0.03 + fib * thick * 0.05));
        // CONSULT: the young sprout is a luminous stem, not a dark stake
        col += glowB * isStem * uSprout * (0.2 + fres * 0.55);
        float shimmer = 0.5 + 0.5 * sin(vPd * 2.6 - uFlow * 1.6);
        col += glowB * gk * shimmer * 0.05;
        // growing tip (roots: capped mint flare, never a white starburst)
        float gap = max(vGrowV - vLocal, 0.0);
        float tip = exp(-gap * mix(60.0, 170.0, isRoot)) * (1.0 - step(0.999, vGrowV));
        vec3 tipC = mix(uMint, uPaper, vAct * (1.0 - isRoot));
        float tipI = tip * (0.35 + 2.05 * vAct);
        tipI = mix(tipI, min(tipI, 0.8), isRoot);
        col += tipC * tipI;
        // OPERATE: the tree dims and comet pulses carry the frame, circulating root -> trunk -> branches.
        // A per-pillar phase offset keeps a pulse on every branch in any still.
        if (uPulse > 0.001) {
          col *= 1.0 - 0.45 * uDim;
          float ph = vPd * 0.3 - uFlow * 0.6 + vGroup * 0.37;
          float f1 = fract(ph);
          float f2 = fract(ph * 2.0 + 0.5);
          float cut1 = 1.0 - smoothstep(0.985, 1.0, f1);
          float cut2 = 1.0 - smoothstep(0.985, 1.0, f2);
          float head = exp(-(1.0 - f1) * 30.0) * cut1;
          float tail = exp(-(1.0 - f1) * 5.0) * cut1;
          float head2 = exp(-(1.0 - f2) * 30.0) * cut2;
          float tail2 = exp(-(1.0 - f2) * 5.0) * cut2;
          float thinP = mix(1.0, 1.6, thin);
          // after OPERATE the thick trunk stays calm; the circulation lives on in the limbs
          float calm = mix(1.0, 0.3, thick * (1.0 - uDim));
          col += (mix(uMint, uPaper, 0.6) * (head * 1.7 + head2 * 0.8) * thinP
                + uMint * (tail * 0.7 + tail2 * 0.25) + uMint * 0.03) * uPulse * calm;
        }
        // BUILD: structured segments + traces on the trunk
        if (abs(vGroup - 1.0) < 0.5 && uBands > 0.001) {
          float j = fract(vPd / 0.4);
          float fwj = fwidth(vPd / 0.4);
          float ring = 1.0 - smoothstep(fwj * 0.8, fwj * 2.2 + 0.02, min(j, 1.0 - j));
          float ta = vAng * 6.0;
          float fwa = fwidth(ta);
          float tr = abs(fract(ta + 0.5) - 0.5);
          float trace = 1.0 - smoothstep(fwa * 0.6, fwa * 1.8, tr);
          float reveal = 1.0 - smoothstep(uBands * 1.1 - 0.1, uBands * 1.1, vLocal);
          col += glowB * (ring * 1.3 + trace * 0.45) * reveal * uBands;
        }
        // finale roll-call: a soft mint tracer runs up each pillar in turn (fades in and out of its window)
        if (vTr > -0.5) {
          float dd = vLocal - vTr;
          float trc = exp(-dd * dd * 500.0) * 0.7 + step(dd, 0.0) * exp(dd * 16.0) * 0.15;
          float env = smoothstep(-0.08, 0.12, vTr) * (1.0 - smoothstep(0.85, 1.12, vTr));
          col += mix(uMint, uPaper, 0.15) * trc * env;
        }
        float d = length(vW - cameraPosition);
        float fa = fogAmount(d);
        col = mix(col, uFogColor, fa);
        // active-pillar lime, luminance preserving and only on bright pixels that are not lost in fog
        float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float lt = vHi * smoothstep(0.2, 0.42, L) * (1.0 - fa);
        col = mix(col, uLime * (L / 0.762), lt);
        // limbs that pass close to the lens dissolve instead of smearing across the frame
        col = mix(uFogColor, col, smoothstep(uNear.x, uNear.y, d));
        col = mix(uFogColor, col, protectMask());
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ ground (radial grid, root light)
export function groundMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform sampler2D uRootMap;
      uniform float uExtent;
      uniform float uRootGrow;
      uniform float uGridBase;
      uniform float uGridLit;
      uniform float uBeat;
      uniform float uClock;
      uniform float uSeedGlow;
      uniform float uBirth;
      uniform float uTime;
      uniform float uFlow;
      uniform vec3 uMint;
      uniform vec3 uPaper;
      uniform vec3 uT600;
      uniform vec3 uT500;
      varying vec3 vW;
      float gline(float x, float fw, float px) {
        float d = abs(fract(x + 0.5) - 0.5) / max(fw, 1e-5);
        return (1.0 - clamp(d - 0.5 * px + 0.5, 0.0, 1.0)) * (1.0 - smoothstep(0.12, 0.45, fw));
      }
      void main() {
        vec2 p = vW.xz;
        float r = length(p);
        float fwr = fwidth(r);
        float rings = gline(r / 0.5, fwr / 0.5, 1.0);
        float major = gline(r / 2.5, fwr / 2.5, 1.5);
        float ang = atan(p.y, p.x + 1e-6) / 6.2831853 + 0.5;
        float fwp = length(fwidth(p)) / max(r, 0.001) / 6.2831853;
        float spokes = gline(ang * 72.0, fwp * 72.0, 1.0) * smoothstep(0.9, 2.4, r);
        float grid = max(rings * 0.5, max(major * 0.9, spokes * 0.32));
        float fade = exp(-r * 0.085);
        vec2 uv = p / (2.0 * uExtent) + 0.5;
        vec4 rm = texture2D(uRootMap, clamp(uv, 0.0, 1.0));
        float inside = step(abs(uv.x - 0.5), 0.499) * step(abs(uv.y - 0.5), 0.499);
        float order = rm.r;
        float glowM = rm.g * inside;
        float on = step(0.001, uRootGrow);
        float lit = (1.0 - smoothstep(uRootGrow - 0.02, uRootGrow + 0.004, order)) * on;
        float front = exp(-abs(uRootGrow - order) * 70.0) * (1.0 - step(0.999, uRootGrow)) * on;
        vec3 col = uT600 * grid * uGridBase * fade * 0.55;
        col += uMint * grid * glowM * lit * uGridLit;
        col += uMint * glowM * glowM * lit * 0.06 * uGridLit;
        col += mix(uMint, uPaper, 0.35) * grid * glowM * front * 1.4;
        // heartbeat ring from the seed
        float hb = fract(uTime / 1.6);
        float wr = 0.25 + hb * 3.2;
        float wave = exp(-pow((r - wr) * 4.0, 2.0)) * (1.0 - hb) * (1.0 - hb);
        col += uMint * wave * uBeat * (0.1 + grid * 0.9);
        col += mix(uMint, uPaper, 0.3) * exp(-r * r * 5.0) * uSeedGlow * 0.3;
        // birth: one ring rolls out over the grid as the seed opens (pure function of scroll)
        if (uBirth > 0.0 && uBirth < 1.0) {
          float br = 0.3 + uBirth * 6.0;
          float bw = exp(-pow((r - br) * 2.6, 2.0)) * pow(1.0 - uBirth, 1.6);
          col += uMint * bw * (0.12 + grid * 1.3);
        }
        // OPERATE: 24-tick monitoring dial; its sweep and the base flash share the pulse clock
        // A 24-hour clock face around the trunk: 24 hour ticks, 4 long quarter marks, a sweeping hand.
        if (uClock > 0.001) {
          float band = smoothstep(1.86, 1.92, r) * (1.0 - smoothstep(2.74, 2.8, r));
          float rings = gline((r - 1.9) / 0.85, fwr / 0.85, 1.8) * smoothstep(1.8, 1.86, r) * (1.0 - smoothstep(2.8, 2.86, r));
          float ticks = gline(ang * 24.0, fwp * 24.0, 2.4) * smoothstep(2.3, 2.34, r) * (1.0 - smoothstep(2.62, 2.66, r));
          float quarter = gline(ang * 4.0, fwp * 4.0, 4.0) * smoothstep(2.02, 2.06, r) * (1.0 - smoothstep(2.66, 2.7, r));
          float sw = fract(ang - uFlow * 0.3);
          float sweep = exp(-(1.0 - sw) * 7.0) * band;
          float hand = exp(-(1.0 - sw) * 90.0) * band;
          float beatP = exp(-fract(uFlow * 0.6) * 5.0);
          float inner = exp(-pow((r - 1.9) * 30.0, 2.0));
          col += uMint * (ticks * 2.2 + quarter * 2.4 + rings * 0.9 + sweep * 0.3 + hand * 1.1 + inner * beatP * 0.6) * uClock;
          col += uPaper * (sweep * (ticks + quarter) * 0.8 + hand * 0.4) * uClock;
        }
        col *= (1.0 - fogAmount(length(vW - cameraPosition))) * protectMask();
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ particles as instanced quads
// billboard(): expands the base quad around a view-space centre; size in world units, clamped in px.
// A zero on-flag collapses the quad so hidden particles cost no fragments.
const QUAD_VERT = /* glsl */ `
  attribute vec3 aPos;
  uniform float uPx;
  varying vec2 vQ;
  vec4 billboard(vec3 p, float worldSize, float minPx, float maxPx, float on) {
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float z = max(-mv.z, 0.1);
    float px = clamp(worldSize * uPx / z, minPx, maxPx) * step(0.002, on);
    mv.xy += position.xy * px * z / uPx;
    vQ = position.xy * 2.0;
    return mv;
  }
`;
// Only the tight core carries the particle colour; the wide halo is always mint (scaled to the core's
// brightness), so dim paper-coloured halos can never read as grey/pink against the teal stage.
const pointFrag = (soft = 0.55, core = 0.9) => /* glsl */ `
  ${MASK}
  varying vec3 vCol;
  varying vec3 vHalo;
  varying float vA;
  varying vec2 vQ;
  void main() {
    float r2 = dot(vQ, vQ);
    if (r2 > 1.0 || vA < 0.002) discard;
    vec3 c = vHalo * exp(-r2 * 3.5) * ${f3(soft)} + vCol * exp(-r2 * 14.0) * ${f3(core)};
    gl_FragColor = vec4(c * vA * protectMask(), 1.0);
  }`;

export function leavesMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      ${FOG}
      ${QUAD_VERT}
      attribute vec3 aOrigin;
      attribute vec4 aRnd; // size, colour, phase, drift
      attribute vec2 aTime; // start, duration (story units)
      attribute float aGroup;
      uniform float uS;
      uniform float uTime;
      uniform float uMotion;
      uniform float uDrift;
      uniform float uLeafHi;
      uniform float uLeafGlow;
      uniform vec3 uT500;
      uniform vec3 uT400;
      uniform vec3 uT300;
      uniform vec3 uMint;
      uniform vec3 uLime;
      varying vec3 vCol;
      varying vec3 vHalo;
      varying float vA;
      void main() {
        float b = clamp((uS - aTime.x) / aTime.y, 0.0, 1.0);
        float bm = b - 1.0;
        float e = 1.0 + 2.2 * bm * bm * bm + 1.2 * bm * bm;
        vec3 pos = mix(aOrigin, aPos, e);
        float ph = aRnd.z * 6.2831853;
        pos += vec3(sin(uTime * 0.7 + ph), sin(uTime * 0.55 + ph * 1.7), cos(uTime * 0.6 + ph * 0.8)) * 0.02 * uMotion;
        float fade = 1.0;
        if (aRnd.w < 0.07) {
          float f = fract(uTime * (0.03 + aRnd.y * 0.03) + aRnd.x * 11.0);
          vec3 dp = vec3(sin(f * 9.0 + ph) * 0.35, -f * 3.2, cos(f * 7.0 + ph) * 0.35);
          pos += dp * uDrift;
          fade = mix(1.0, sin(f * 3.14159), uDrift);
        }
        // wide size spread: a few big soft leaves give the crown volume, many small ones give detail
        float size = (0.03 + aRnd.x * aRnd.x * aRnd.x * 0.13) * smoothstep(0.0, 0.3, b);
        vec4 mv = billboard(pos, size, 0.0, 44.0, b * fade);
        gl_Position = projectionMatrix * mv;
        vec3 c = aRnd.y < 0.3 ? uT500 : (aRnd.y < 0.56 ? uT400 : (aRnd.y < 0.8 ? uT300 : uMint));
        float flash = b * (1.0 - b) * 4.0;
        vCol = c * (uLeafGlow + flash * 0.6) + uMint * flash * 0.12;
        // halo always mint at the leaf's own brightness; the active pillar (GROW) adds a bright lime
        // pinpoint core to ~a quarter of its leaves (never a dim lime wash, which reads olive)
        vHalo = uMint * (vCol.g / uMint.g);
        float isHi = 1.0 - step(0.5, abs(aGroup - 8.0));
        float hi = isHi * uLeafHi * step(0.74, fract(aRnd.w * 7.31 + aRnd.x * 3.7));
        vCol = mix(vCol, uLime * 2.5, hi);
        vA = (1.0 - fogAmount(-mv.z)) * step(0.0001, b) * fade;
      }`,
    fragmentShader: pointFrag(0.66, 0.34),
  });
}

// TRANSFORM data streams: each particle is a streak drawn from a tail point (sampled further back along
// its own path) to its head, built in screen space so it is aligned with the direction of travel.
export function sapMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      ${FOG}
      attribute float aPath;
      attribute vec4 aRnd; // phase, speed, jitter, angle
      uniform sampler2D uPaths;
      uniform float uNP;
      uniform float uNS;
      uniform float uS;
      uniform float uTime;
      uniform float uSap;
      uniform float uRootSap;
      uniform float uTrunkK;
      uniform float uPx;
      uniform float uSapSize;
      uniform float uSapMin;
      uniform vec2 uRes;
      uniform vec3 uMint;
      uniform vec3 uPaper;
      varying vec3 vCol;
      varying float vA;
      varying vec2 vQ;
      varying float vLen;
      varying float vWid;
      vec4 pathAt(float u, int row, out vec4 ex) {
        float fx = clamp(u, 0.0, 1.0) * (uNS - 1.0);
        int i0 = int(floor(fx));
        int i1 = min(i0 + 1, int(uNS) - 1);
        float fr = fx - floor(fx);
        int rowR = row + int(uNP + 0.5);
        ex = mix(texelFetch(uPaths, ivec2(i0, rowR), 0), texelFetch(uPaths, ivec2(i1, rowR), 0), fr);
        return mix(texelFetch(uPaths, ivec2(i0, row), 0), texelFetch(uPaths, ivec2(i1, row), 0), fr);
      }
      uniform float uSapTrunk;
      void main() {
        int row = int(aPath + 0.5);
        float u = fract(aRnd.x + uTime * (0.03 + aRnd.y * 0.035) + uS * 0.22);
        vec4 ex, ex2, ex3;
        vec4 H = pathAt(u, row, ex);
        float du = (0.22 + 0.2 * aRnd.y) / max(ex.w, 0.1);
        vec4 Tl = pathAt(u - du, row, ex2);
        vec3 T = H.xyz - Tl.xyz;
        T = length(T) > 1e-5 ? normalize(T) : vec3(0.0, 1.0, 0.0);
        // streaks ride on the camera-facing half of the tube surface (never outside the silhouette),
        // so the trunk reads as a lit channel instead of a frayed, hairy bundle
        vec3 C = cameraPosition - H.xyz;
        vec3 Cp = C - T * dot(C, T);
        vec3 hlp = abs(T.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
        Cp = length(Cp) > 1e-4 ? normalize(Cp) : normalize(cross(T, hlp));
        vec3 Sd = cross(T, Cp);
        float ang = aRnd.w * 1.15 + 0.12 * sin(u * 9.0 + aRnd.x * 6.2831853);
        float trunkS = clamp(1.0 - abs(ex.y - 1.0), 0.0, 1.0);
        float rad = ex.x * mix(1.0, uTrunkK, trunkS);
        vec3 off = (Cp * cos(ang) + Sd * sin(ang)) * (rad * (1.035 + 0.05 * aRnd.z) + 0.002);
        vec3 pH = H.xyz + off;
        vec3 pT = Tl.xyz + off;
        float vis = smoothstep(H.w, H.w + 0.05, uS);
        // fade out before any growth frontier ahead (streaks never stack into a brush at a resting tip)
        vec4 Ah = pathAt(u + 0.45 / max(ex.w, 0.1), row, ex3);
        float ahead = smoothstep(Ah.w, Ah.w + 0.05, uS);
        // paths whose pillar has not grown yet stay faint: the flow reads as going somewhere
        float endW = texelFetch(uPaths, ivec2(int(uNS) - 1, row), 0).w;
        float done = smoothstep(endW, endW + 0.12, uS);
        float ends = smoothstep(0.0, 0.04, u - du) * (1.0 - smoothstep(0.95, 1.0, u));
        float root = clamp(1.0 - ex.y, 0.0, 1.0);
        float amp = vis * ahead * mix(0.22, 1.0, done) * ends * uSap * mix(1.0, uRootSap, root) * mix(1.0, uSapTrunk, trunkS);
        vec4 mvH = modelViewMatrix * vec4(pH, 1.0);
        vec4 mvT = modelViewMatrix * vec4(pT, 1.0);
        vec4 cH = projectionMatrix * mvH;
        vec4 cT = projectionMatrix * mvT;
        float z = max(-mvH.z, 0.1);
        float w = clamp((0.019 + aRnd.y * 0.016) * uSapSize * uPx / z, uSapMin, 9.0) * step(0.002, amp);
        vec2 sH = cH.xy / cH.w * 0.5 * uRes;
        vec2 sT = cT.xy / max(cT.w, 0.05) * 0.5 * uRes;
        vec2 d = sH - sT;
        float len = length(d);
        vec2 dir = len > 0.01 ? d / len : vec2(0.0, 1.0);
        vec2 nrm = vec2(-dir.y, dir.x);
        float al = position.x + 0.5;
        vec2 sP = mix(sT - dir * w * 0.5, sH + dir * w * 0.5, al) + nrm * position.y * w;
        gl_Position = vec4(sP / (0.5 * uRes) * cH.w, cH.z, cH.w);
        vQ = vec2(al * (len + w) - w * 0.5, position.y * 2.0);
        vLen = len;
        vWid = max(w, 0.001);
        // mostly mint; ~8% paper heads; decision streams brighten (capped) as they reach the node
        float paper = max(step(0.92, aRnd.y) * 0.8, ex.z * smoothstep(0.82, 0.97, u) * 0.4);
        vCol = mix(uMint, uPaper, paper);
        vA = amp * (1.0 - fogAmount(z));
      }`,
    fragmentShader: /* glsl */ `
      ${MASK}
      uniform vec3 uMint;
      varying vec3 vCol;
      varying float vA;
      varying vec2 vQ;
      varying float vLen;
      varying float vWid;
      void main() {
        if (vA < 0.002) discard;
        float hw = 0.5 * vWid;
        float y = vQ.y * hw;
        float cx = clamp(vQ.x, 0.0, vLen);
        float r = length(vec2(vQ.x - cx, y)) / hw;
        if (r > 1.0) discard;
        float t = vLen > 0.5 ? cx / vLen : 1.0;
        float body = exp(-r * r * 3.2) * t * t;
        float rh = length(vec2(vQ.x - vLen, y)) / hw;
        float head = exp(-rh * rh * 3.5);
        vec3 c = uMint * body * 0.35 + vCol * head * 0.9;
        gl_FragColor = vec4(c * vA * protectMask(), 1.0);
      }`,
  });
}

// Buds on twig tips: the sprout from CONSULT, the whole crown from OPERATE until the bloom.
export function budMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      ${FOG}
      ${QUAD_VERT}
      attribute vec4 aRnd; // tip story time, group, size, phase
      uniform float uS;
      uniform float uTime;
      uniform float uMotion;
      uniform float uBudA;
      uniform vec3 uMint;
      uniform vec3 uPaper;
      varying vec3 vCol;
      varying vec3 vHalo;
      varying float vA;
      void main() {
        float on = smoothstep(aRnd.x + 0.01, aRnd.x + 0.07, uS);
        float sprout = 1.0 - step(0.5, abs(aRnd.y - 2.0));
        float a = on * mix(uBudA, max(uBudA, 1.0 - 0.55 * smoothstep(1.8, 2.2, uS)), sprout);
        a *= 0.85 + 0.15 * sin(uTime * 1.3 + aRnd.w * 6.2831853) * uMotion;
        vec4 mv = billboard(aPos, (0.03 + aRnd.z * 0.02) * mix(1.0, 1.5, sprout), 0.0, 16.0, a);
        gl_Position = projectionMatrix * mv;
        vCol = mix(uMint, uPaper, 0.35) * 1.25;
        vHalo = uMint * 0.9;
        vA = a * (1.0 - fogAmount(-mv.z));
      }`,
    fragmentShader: pointFrag(0.5, 0.8),
  });
}

export function fireflyMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      ${FOG}
      ${QUAD_VERT}
      attribute vec4 aRnd; // phase, speed, amplitude, type (1 firefly, 0 mote)
      uniform float uTime;
      uniform float uS;
      uniform float uFire;
      uniform float uMotes;
      uniform vec3 uMint;
      uniform vec3 uPaper;
      uniform vec3 uT300;
      varying vec3 vCol;
      varying vec3 vHalo;
      varying float vA;
      void main() {
        float ph = aRnd.x * 6.2831853;
        float sp = 0.22 + aRnd.y * 0.35;
        float tt = uTime * sp + uS * 0.35;
        vec3 pos = aPos + vec3(sin(tt + ph), sin(tt * 0.8 + ph * 2.1) * 0.6, cos(tt * 0.9 + ph * 1.3)) * aRnd.z;
        float ff = aRnd.w;
        float blink = 0.55 + 0.45 * sin(uTime * (1.1 + aRnd.y * 1.8) + ph * 3.0);
        float a = mix(0.28 * uMotes, uFire * blink, ff);
        float size = mix(0.022 + aRnd.y * 0.02, 0.05 + aRnd.y * 0.035, ff);
        vec4 mv = billboard(pos, size, 0.0, 26.0, a);
        gl_Position = projectionMatrix * mv;
        vCol = ff > 0.5 ? mix(uMint, uPaper, aRnd.y * 0.5) * 1.6 : uT300 * 0.8;
        vHalo = uMint * (vCol.g / uMint.g);
        vA = a * (1.0 - fogAmount(-mv.z));
      }`,
    fragmentShader: pointFrag(),
  });
}

// ------------------------------------------------------------------ BUILD blocks (instanced)
export function blockMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: /* glsl */ `
      attribute vec3 aFrom;
      attribute vec3 aIn;   // vector from the block centre to the branch axis
      attribute vec3 aTime; // start, duration (story units), order along the branch 0..1
      uniform float uS;
      uniform float uRetract;
      uniform float uSweep;
      varying vec3 vW;
      varying vec3 vN;
      varying vec2 vUv;
      varying float vB;
      varying float vLive;
      void main() {
        float b = clamp((uS - aTime.x) / aTime.y, 0.0, 1.0);
        float e = 1.0 - pow(1.0 - b, 3.0);
        // after BUILD the modules settle into the limb; the trunk rings carry "what was built stays"
        float k = e * (1.0 - 0.72 * uRetract);
        vec4 w = modelMatrix * instanceMatrix * vec4(position * k, 1.0);
        w.xyz += aFrom * (1.0 - e) + aIn * 0.3 * uRetract;
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        vUv = uv;
        vB = b;
        // lime only on modules still being assembled, and on the integration sweep during the hold
        float settle = clamp((uS - aTime.x - aTime.y) / 0.09, 0.0, 1.0);
        float sweep = exp(-pow((aTime.z - uSweep) * 7.0, 2.0)) * step(-0.5, uSweep);
        vLive = max((1.0 - settle) * step(0.0001, b), sweep) * (1.0 - uRetract);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform vec3 uLime;
      uniform vec3 uPaper;
      uniform vec3 uBody;
      uniform float uBlockGlow;
      uniform float uLineK;
      uniform vec2 uNear;
      varying vec3 vW;
      varying vec3 vN;
      varying vec2 vUv;
      varying float vB;
      varying float vLive;
      void main() {
        if (vB <= 0.0) discard;
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.0);
        float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
        float fw = fwidth(e);
        float line = 1.0 - smoothstep(0.045, 0.045 + fw * 1.5 + 0.01, e);
        // solid faces (a module, not an outline) with a crisp mint edge
        vec3 fill = (uBody * 0.6 + uMint * 0.15) * (0.55 + 0.45 * ndv);
        vec3 edge = mix(uMint, uLime, vLive);
        vec3 col = (fill + edge * line * (0.85 + 0.5 * vLive) * uLineK + uMint * fres * 0.16) * uBlockGlow;
        col += mix(uMint, uPaper, 0.5) * (1.0 - vB) * vB * 2.2;
        float d = length(vW - cameraPosition);
        col = mix(col, uFogColor, fogAmount(d));
        col = mix(uFogColor, col, smoothstep(uNear.x, uNear.y, d));
        col = mix(uFogColor, col, protectMask());
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ SECURE shell
export function shellMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aBary;
      attribute vec3 aOrd;
      varying vec3 vBary;
      varying vec3 vOrd;
      varying vec3 vW;
      varying vec3 vN;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vN = normalize(mat3(modelMatrix) * position);
        vBary = aBary; vOrd = aOrd;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform vec3 uLime;
      uniform vec3 uPaper;
      uniform float uShell;
      uniform float uShellA;
      uniform float uHiShell;
      uniform float uFlow;
      uniform vec3 uShellC;
      uniform float uShellR;
      varying vec3 vBary;
      varying vec3 vOrd;
      varying vec3 vW;
      varying vec3 vN;
      void main() {
        if (vW.y < 0.03 || uShellA < 0.002) discard;
        float o = vOrd.x;
        float mx = vBary.x;
        if (vBary.y > mx) { mx = vBary.y; o = vOrd.y; }
        if (vBary.z > mx) { mx = vBary.z; o = vOrd.z; }
        float mn = min(vBary.x, min(vBary.y, vBary.z));
        float mid = vBary.x + vBary.y + vBary.z - mx - mn;
        float d = mx - mid;
        float fw = fwidth(d);
        // per-cell line weight (0.6..1.0) so the lattice reads crafted, not stamped
        float wt = 0.6 + 0.4 * fract(o * 91.7 + 0.37);
        float edge = (1.0 - smoothstep(fw * 0.5 * wt, fw * 1.7 * wt, d)) * wt;
        float prog = uShell * 1.4 - o;
        float rev = smoothstep(0.0, 0.06, prog);
        float flash = smoothstep(0.0, 0.03, prog) * (1.0 - smoothstep(0.03, 0.3, prog));
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float f1 = 1.0 - abs(dot(N, V));
        float fres = f1 * f1 * f1;
        float fres2 = f1 * f1;
        float inner = exp(-d * 9.0);
        float hy = (vW.y - uShellC.y) / uShellR;
        float scanY = fract(uFlow * 0.07) * 2.4 - 1.2;
        float scan = exp(-pow((hy - scanY) * 7.0, 2.0));
        // near-invisible face-on, glowing toward the silhouette: a shield, not a stock force field
        vec3 col = uMint * rev * (edge * (0.03 + fres2 * 0.62) + fres * 0.12 + inner * 0.025 + scan * edge * 0.16);
        col += mix(uMint, uPaper, 0.35) * flash * edge * 0.6;
        if (!gl_FrontFacing) col *= 0.15;
        col *= uShellA * (1.0 - fogAmount(length(vW - cameraPosition))) * protectMask();
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ orbs (seed)
export function orbMaterial(U: Uniforms, own: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...own },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      varying vec3 vL;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vL = position;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform vec3 uLime;
      uniform vec3 uPaper;
      uniform vec3 uT500;
      uniform float uIntensity;
      uniform float uHiO;
      uniform float uBandsO;
      varying vec3 vW;
      varying vec3 vN;
      varying vec3 vL;
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.5);
        vec3 rim = mix(uMint, uLime, uHiO);
        vec3 core = mix(uT500 * 0.7, mix(uMint, uPaper, 0.55), pow(ndv, 3.0));
        vec3 col = core * (0.22 + 0.8 * pow(ndv, 3.0)) * uIntensity + rim * fres * 1.5 * uIntensity;
        float lat = vL.y * 7.0;
        float fwl = fwidth(lat);
        float band = 1.0 - smoothstep(fwl * 0.5, fwl * 1.6, abs(fract(lat + 0.5) - 0.5));
        col += uMint * band * uBandsO * (0.2 + fres * 0.8) * uIntensity;
        if (!gl_FrontFacing) col *= 0.3;
        col = mix(col, uFogColor, fogAmount(length(vW - cameraPosition)));
        col = mix(uFogColor, col, protectMask());
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ SOLVE fruits: luminous mint orbs
export function fruitMaterial(U: Uniforms, own: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, ...own },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      varying vec3 vN;
      varying vec3 vL;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        vL = position;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform vec3 uLime;
      uniform vec3 uPaper;
      uniform float uIntensity;
      uniform float uHiO;
      uniform float uBandsO;
      varying vec3 vW;
      varying vec3 vN;
      varying vec3 vL;
      void main() {
        vec3 N = normalize(vN);
        vec3 V = normalize(cameraPosition - vW);
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 2.4);
        vec3 rim = mix(uMint, uLime, uHiO);
        // luminous mint body, a small paper hotspot (never a large pale-grey disc), lime rim when active
        vec3 body = uMint * (0.34 + 0.3 * ndv);
        vec3 hot = uPaper * pow(ndv, 10.0) * 0.55;
        vec3 col = (body + hot) * uIntensity + rim * fres * 1.2 * uIntensity;
        float lat = vL.y * 6.0;
        float fwl = fwidth(lat);
        float band = 1.0 - smoothstep(fwl * 0.5, fwl * 1.6, abs(fract(lat + 0.5) - 0.5));
        col += rim * band * uBandsO * (0.1 + fres * 0.5) * uIntensity;
        col = mix(col, uFogColor, fogAmount(length(vW - cameraPosition)));
        col = mix(uFogColor, col, protectMask());
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ billboard halo
export function haloMaterial(U: Uniforms, own: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: { ...U, uCoreColor: { value: U.uMint.value.clone() }, uRing: { value: 0 }, ...own },
    ...additive,
    vertexShader: /* glsl */ `
      uniform vec3 uCenter;
      uniform float uSize;
      varying vec2 vQ;
      varying float vD;
      void main() {
        vQ = position.xy * 2.0;
        vec4 mv = viewMatrix * vec4(uCenter, 1.0);
        vD = -mv.z;
        mv.xy += position.xy * uSize;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uColor;
      uniform vec3 uCoreColor;
      uniform float uIntensity;
      uniform float uRing;
      varying vec2 vQ;
      varying float vD;
      void main() {
        float r = length(vQ);
        if (r > 1.0 || uIntensity < 0.001) discard;
        float soft = exp(-r * r * 5.0) * 0.55;
        float core = exp(-r * r * 24.0) * 0.8;
        float ring = exp(-pow((r - 0.42) * 26.0, 2.0)) * uRing;
        vec3 c = (uColor * (soft + ring) + uCoreColor * core) * (1.0 - smoothstep(0.75, 1.0, r));
        gl_FragColor = vec4(c * uIntensity * (1.0 - fogAmount(vD)) * protectMask(), 1.0);
      }`,
  });
}

// ------------------------------------------------------------------ orbit rings + satellites
export function orbitLineMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      attribute float aF;
      uniform float uFruitS[3];
      varying vec3 vW;
      varying float vK;
      void main() {
        int f = int(aF + 0.5);
        vK = uFruitS[f];
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      ${FOG}
      ${MASK}
      uniform vec3 uMint;
      uniform float uOrbitA;
      varying vec3 vW;
      varying float vK;
      void main() {
        float k = smoothstep(0.7, 1.0, vK);
        if (k < 0.002) discard;
        gl_FragColor = vec4(uMint * 0.4 * k * uOrbitA * (1.0 - fogAmount(length(vW - cameraPosition))) * protectMask(), 1.0);
      }`,
  });
}

export function satelliteMaterial(U: Uniforms) {
  return new THREE.ShaderMaterial({
    uniforms: U,
    ...additive,
    vertexShader: /* glsl */ `
      ${FOG}
      ${QUAD_VERT}
      attribute vec3 aU;
      attribute vec3 aV;
      attribute vec3 aP; // radius, speed, phase
      attribute float aF;
      uniform float uFruitS[3];
      uniform float uTime;
      uniform float uS;
      uniform float uOrbitA;
      uniform vec3 uPaper;
      uniform vec3 uMint;
      varying vec3 vCol;
      varying vec3 vHalo;
      varying float vA;
      void main() {
        int f = int(aF + 0.5);
        float k = smoothstep(0.7, 1.0, uFruitS[f]);
        float a = aP.z + uTime * aP.y + uS * 2.4;
        vec3 p = aPos + (aU * cos(a) + aV * sin(a)) * aP.x;
        vec4 mv = billboard(p, 0.085, 0.0, 28.0, k * uOrbitA);
        gl_Position = projectionMatrix * mv;
        vCol = mix(uMint, uPaper, 0.35) * 1.6;
        vHalo = uMint * (vCol.g / uMint.g);
        vA = k * uOrbitA * (1.0 - fogAmount(-mv.z));
      }`,
    fragmentShader: pointFrag(),
  });
}

// ------------------------------------------------------------------ output: soft shoulder + sRGB + dither
export function outputMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null }, tBloom: { value: null }, uBloom: { value: 0.7 }, uBg: { value: new THREE.Color(0x052626) }, uSeed: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform sampler2D tBloom;
      uniform float uBloom;
      uniform vec3 uBg;
      uniform float uSeed;
      varying vec2 vUv;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      vec3 toSRGB(vec3 c) {
        c = max(c, vec3(0.0));
        return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
      }
      void main() {
        vec3 c = texture2D(tDiffuse, vUv).rgb + texture2D(tBloom, vUv).rgb * uBloom;
        vec3 k = vec3(0.78);
        vec3 over = max(c - k, vec3(0.0));
        c = min(c, k) + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
        vec3 s = toSRGB(c);
        float diff = length(c - uBg);
        float n = hash(gl_FragCoord.xy + uSeed) - 0.5;
        s += n * (2.0 / 255.0) * smoothstep(0.004, 0.04, diff);
        gl_FragColor = vec4(s, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
}
