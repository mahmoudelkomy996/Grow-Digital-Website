// GLSL for "A city in the making". All colours arrive as linear-space uniforms; OutputPass encodes to sRGB.

export const COMMON = /* glsl */ `
uniform vec3 uBg;
uniform float uFogD;
uniform float uFogNear;
uniform float uTime;
uniform float uMotion;
float fogF(vec3 wp) {
  float d = max(0.0, distance(wp, cameraPosition) - uFogNear) * uFogD;
  return 1.0 - exp(-d * d);
}
float sq(float x) { return x * x; }
uniform vec3 uCHaze;
uniform float uHaze;
float hazeG(float e) { float a = abs(e); return (exp(-a / 0.05) + 0.3 * exp(-a / 0.2)) * smoothstep(0.42, 0.18, a); }
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

// Facade helpers shared by instanced buildings and landmarks
export const FACADE = /* glsl */ `
uniform vec3 uCMint;
uniform vec3 uCPaper;
uniform vec3 uCLime;
uniform vec3 uCGlass0;
uniform vec3 uCGlass1;
uniform vec3 uCKey;
uniform vec3 uCRim;
uniform vec3 uCEdge;
uniform vec3 uCSlab;
uniform vec3 uKeyDir;
uniform float uLit;
uniform float uWaveR;
uniform float uSweepA;
uniform float uSweepAng;
uniform vec2 uDetail; // window LOD range in cells-per-pixel (mobile keeps windows resolved longer)

vec3 glassBase(vec3 wp, vec3 N, vec3 V, float totalH) {
  float h01 = clamp(wp.y / max(totalH, 1.0), 0.0, 1.0);
  float roof = step(0.6, N.y);
  vec3 col = mix(uCGlass0, uCGlass1, 0.3 + 0.7 * h01);
  col = mix(col, uCGlass1 * 1.15, roof * 0.7);
  float kd = max(dot(N, uKeyDir), 0.0);
  col += uCKey * kd * (1.0 - roof * 0.6);
  float fr = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  col += uCRim * fr * (1.0 - roof);
  col *= mix(0.45, 1.0, smoothstep(0.0, 5.0, wp.y));
  // upper floors darken so silhouettes read against the horizon haze
  col *= mix(1.0, 0.62, h01 * (1.0 - roof * 0.5));
  return col;
}

float litProb(vec2 bxz, float y) {
  float br = length(bxz);
  float x = uWaveR - br - y * 0.7;
  float wave = smoothstep(0.0, 5.0, x);
  float front = exp(-sq((x - 2.5) / 3.2));
  float a = atan(bxz.y, bxz.x);
  float diff = mod(a - uSweepAng, 6.2831853);
  float sweep = exp(-diff * 1.6) * uSweepA * smoothstep(34.0, 30.0, br);
  return clamp(uLit * (0.44 * wave + 0.45 * front) + sweep * 0.5, 0.0, 1.0);
}

vec3 windows(vec2 uvw, float seed, float lit) {
  vec2 cell = uvw / vec2(0.46, 0.56);
  vec2 id = floor(cell);
  vec2 f = fract(cell);
  vec2 fw = fwidth(cell);
  float detail = 1.0 - smoothstep(uDetail.x, uDetail.y, max(fw.x, fw.y));
  vec2 lo = vec2(0.17, 0.22);
  vec2 m = smoothstep(lo, lo + fw * 1.2, f) * smoothstep(lo, lo + fw * 1.2, 1.0 - f);
  float pane = m.x * m.y;
  float h = hash12(id + vec2(seed * 31.7, seed * 17.3));
  float tw = floor(uTime * 0.11 * uMotion + h * 9.0);
  float h2 = hash12(id * 1.37 + vec2(tw * 3.1, seed * 5.1));
  float hh = fract(h * 91.3) < 0.08 ? h2 : h;
  float hf = hash12(vec2(id.y * 0.713, seed * 57.1 + floor(id.x / 7.0) * 0.37));
  float on = mix(step(hh, lit * 0.45), step(hf, lit * 0.7) * step(0.18, fract(h * 5.3)), 0.72);
  float inten = 0.5 + 0.9 * fract(hf * 13.7 + h * 0.3);
  vec3 wc = mix(uCMint, uCPaper, 0.25 + 0.6 * fract(hf * 7.3));
  vec3 nearC = wc * pane * on * inten;
  // sub-pixel windows: a faint average, and roughly a third of the towers stay dark glass from afar
  float bldLit = step(0.35, hash12(vec2(seed * 71.3, 4.7)));
  vec3 farC = mix(uCMint, uCPaper, 0.3) * lit * 0.1 * bldLit;
  float slab = 1.0 - smoothstep(0.0, fw.y * 1.5 + 0.035, f.y);
  return mix(farC, nearC, detail) + uCSlab * mix(0.1, slab, detail);
}
`;

// ---------------- Instanced buildings: solid ----------------
export const BLD_VERT = /* glsl */ `
${COMMON}
attribute vec4 iBox;   // cx, cz, w, d
attribute vec4 iSeg;   // baseY, segH, totalH, seed
attribute vec4 iAnim;  // riseDelay, solidDelay, kind, target
uniform float uRiseC;
uniform float uRiseE;
uniform float uSolidC;
uniform float uSolidE;
varying vec3 vW;
varying vec3 vN;
varying vec4 vB;
varying vec4 vS;
varying vec4 vA;
void main() {
  float kind = iAnim.z;
  float rise = mix(uRiseC, uRiseE, kind);
  float solid = mix(uSolidC, uSolidE, kind);
  float g = clamp((rise - iAnim.x) / 0.42, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  float sd = clamp((solid - iAnim.y) / 0.3, 0.0, 1.0);
  sd = sd * sd * (3.0 - 2.0 * sd);
  float top = g * iSeg.z;
  float fillTop = min(top, sd * iSeg.z);
  float vis = clamp(fillTop - iSeg.x, 0.0, iSeg.y);
  vec3 p = position;
  vec3 wp = vec3(iBox.x + p.x * iBox.z, iSeg.x + p.y * vis, iBox.y + p.z * iBox.w);
  vW = wp;
  vN = normal;
  vB = iBox;
  vS = vec4(iSeg.x, vis, iSeg.z, iSeg.w);
  float isFront = step(fillTop, iSeg.x + iSeg.y - 0.01) * (1.0 - step(0.999, sd));
  vA = vec4(sd, iAnim.w, isFront, kind);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  if (vis < 0.003) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const BLD_FRAG = /* glsl */ `
${COMMON}
${FACADE}
uniform float uSolveHit;
uniform float uEdgeA;
uniform float uFresh;
varying vec3 vW;
varying vec3 vN;
varying vec4 vB;
varying vec4 vS;
varying vec4 vA;
void main() {
  vec3 N = normalize(vN);
  vec3 V = normalize(cameraPosition - vW);
  vec3 col = glassBase(vW, N, V, vS.z);
  float side = 1.0 - step(0.5, abs(N.y));
  float topY = vS.x + vS.y;
  float useZ = step(0.5, abs(N.x));
  float u = mix(vW.x, vW.z, useZ);
  float eu = mix(vB.z * 0.5 - abs(vW.x - vB.x), vB.w * 0.5 - abs(vW.z - vB.y), useZ);
  float ev = topY - vW.y;
  float eRoof = min(vB.z * 0.5 - abs(vW.x - vB.x), vB.w * 0.5 - abs(vW.z - vB.y));
  float e = mix(eRoof, min(eu, ev), side);
  float fe = fwidth(e);
  // 0.03-wide edge line; once it is thinner than a pixel, fade it by coverage so distant blocks stay glass, not wireframe
  float edge = (1.0 - smoothstep(0.03, 0.03 + fe * 1.5, e)) * clamp(0.07 / max(fe, 1e-4), 0.3, 1.0);
  // derivatives inside windows() must run in uniform control flow: always evaluate, then mask
  col += windows(vec2(u, vW.y), vS.w, litProb(vB.xy, vW.y)) * side;
  col += uCEdge * edge * uEdgeA + uCMint * edge * uFresh * vA.w * 0.45;
  // solidification front: a thin line on the facades, a faint tint on the cap
  float fr = vA.z * mix(0.12, exp(-ev * ev / 0.02) * 0.55, side);
  col += uCMint * fr;
  // solve targets: crown glow
  float crown = vA.y * uSolveHit * mix(0.3, exp(-sq(vS.z - vW.y) / 0.3), side);
  col += uCMint * crown * 0.4;
  col = mix(col, uBg, fogF(vW));
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Instanced buildings: wireframe (additive lines) ----------------
export const WIRE_VERT = /* glsl */ `
${COMMON}
attribute vec4 iBox;
attribute vec4 iSeg;
attribute vec4 iAnim;
uniform float uRiseC;
uniform float uRiseE;
uniform float uSolidC;
uniform float uSolidE;
varying vec3 vW;
varying vec4 vX;
varying float vKindW;
void main() {
  float kind = iAnim.z;
  vKindW = kind;
  float rise = mix(uRiseC, uRiseE, kind);
  float solid = mix(uSolidC, uSolidE, kind);
  float g = clamp((rise - iAnim.x) / 0.42, 0.0, 1.0);
  g = 1.0 - pow(1.0 - g, 3.0);
  float sd = clamp((solid - iAnim.y) / 0.3, 0.0, 1.0);
  sd = sd * sd * (3.0 - 2.0 * sd);
  float top = g * iSeg.z;
  float fillTop = min(top, sd * iSeg.z);
  float vis = clamp(top - iSeg.x, 0.0, iSeg.y);
  vec3 p = position;
  vec3 wp = vec3(iBox.x + p.x * iBox.z, iSeg.x + p.y * vis, iBox.y + p.z * iBox.w);
  vW = wp;
  vX = vec4(fillTop, top, g, sd);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
  if (vis < 0.003 || sd > 0.998) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const WIRE_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform vec3 uCLime;
uniform float uWireA;
uniform float uLimeHead;
varying vec3 vW;
varying vec4 vX;
varying float vKindW;
void main() {
  if (vW.y < vX.x - 0.02) discard;
  float hd = vX.y - vW.y;
  float head = exp(-hd * hd / 0.5) * (1.0 - step(0.999, vX.z));
  vec3 col = uCMint * 0.7 + mix(uCMint * 1.3, uCLime * 1.6, uLimeHead) * head;
  col *= uWireA * (1.0 - fogF(vW)) * mix(1.0, 0.5, vKindW); // satellite districts build quieter than the core
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Landmarks (non-instanced, custom geometry) ----------------
export const LM_VERT = /* glsl */ `
${COMMON}
uniform float uG;
uniform float uSd;
uniform float uH;
uniform float uTwist;
uniform float uWireMode;
varying vec3 vW;
varying vec3 vL;
varying vec4 vX;
varying float vU;
void main() {
  float top = uG * uH;
  float fill = min(top, uSd * uH);
  float lim = uWireMode > 0.5 ? top : fill;
  vec3 p = position;
  p.y = min(p.y, lim);
  vL = p;
  vU = uv.x;
  float a = uTwist * p.y / uH;
  float c = cos(a), s = sin(a);
  p.xz = vec2(c * p.x - s * p.z, s * p.x + c * p.z);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vX = vec4(fill, top, uG, uSd);
  gl_Position = projectionMatrix * viewMatrix * wp;
  if (lim < 0.01 || (uWireMode > 0.5 && uSd > 0.998)) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const LM_FRAG = /* glsl */ `
${COMMON}
${FACADE}
uniform float uH;
uniform float uSd;
uniform vec2 uSite;
uniform float uSeed;
uniform float uHub;
uniform float uHubY;
uniform float uHubN;  // 1..3 paper bands: each product hub has its own signature
uniform float uKind;  // 0 spire, 1 arch, 2 twist
varying vec3 vW;
varying vec3 vL;
varying vec4 vX;
varying float vU;
void main() {
  vec3 N = cross(dFdx(vW), dFdy(vW));
  N /= max(length(N), 1e-7);
  vec3 NL = cross(dFdx(vL), dFdy(vL));
  NL /= max(length(NL), 1e-7);
  vec3 V = normalize(cameraPosition - vW);
  if (dot(N, V) < 0.0) N = -N;
  vec3 col = glassBase(vW, N, V, uH * 0.8);
  float side = 1.0 - step(0.6, abs(NL.y));
  float u = mix(vL.x, vL.z, step(abs(NL.z), abs(NL.x)));
  col += windows(vec2(u, vL.y), uSeed, litProb(uSite, vW.y)) * (0.9 * side);
  float isSpire = 1.0 - step(0.5, uKind);
  float isArch = step(0.5, uKind) * (1.0 - step(1.5, uKind));
  float isTwist = step(1.5, uKind);
  float aaY = fwidth(vL.y);
  // spire: lit setback lines and a crown that tapers into a glowing fin
  float sb = 0.0;
  sb += exp(-sq((vL.y - 20.4) / max(0.09, aaY)));
  sb += exp(-sq((vL.y - 29.4) / max(0.09, aaY)));
  sb += exp(-sq((vL.y - 36.1) / max(0.09, aaY)));
  float fin = smoothstep(39.6, 44.0, vL.y);
  col += (uCMint * (sb * 0.55 * side + fin * 0.35) + uCPaper * fin * fin * 0.35) * isSpire;
  // arch: emissive soffit on the inner U, the logo's "smile"
  float sof = (1.0 - smoothstep(1.02, 1.1, abs(vL.x))) * smoothstep(22.7, 23.2, vL.y);
  float sofK = smoothstep(29.5, 23.2, vL.y); // brightest along the bottom of the U, fading up the blades
  col += (uCMint * (0.03 + 0.34 * sofK * sofK * sofK) + uCPaper * 0.2 * pow(sofK, 8.0)) * sof * isArch;
  // twist: corner edges follow the 150-degree twist
  float cu = vU * 8.0;
  float ce = abs(fract(cu + 0.5) - 0.5) / max(fwidth(cu), 1e-4);
  col += uCEdge * (1.0 - smoothstep(0.6, 1.6, ce)) * side * 0.7 * isTwist;
  // product hub: 1, 2 or 3 thin paper bands under a soft mint collar
  float hb = 0.0;
  for (int j = 0; j < 3; j++) {
    float fj = float(j);
    hb += step(fj + 0.5, uHubN) * exp(-sq((vW.y - (uHubY - fj * 0.85)) / max(0.13, aaY)));
  }
  col += (uCPaper * 0.6 * hb * side + uCMint * 0.12 * exp(-sq((uHubY - vW.y) / 2.0))) * uHub;
  float front = step(vX.x, uH - 0.01) * step(uSd, 0.999) * exp(-sq((vX.x - vW.y) / 0.25));
  col += uCMint * front * 0.8;
  if (!gl_FrontFacing) col *= 0.55;
  col = mix(col, uBg, fogF(vW));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const LMW_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform vec3 uCLime;
uniform float uWireA;
varying vec3 vW;
varying vec3 vL;
varying vec4 vX;
void main() {
  if (vW.y < vX.x - 0.02) discard;
  float hd = vX.y - vW.y;
  float head = exp(-hd * hd / 0.8) * (1.0 - step(0.999, vX.z));
  vec3 col = uCMint * 0.85 + uCLime * head * 2.0;
  col *= uWireA * (1.0 - fogF(vW));
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Ground ----------------
export const GROUND_VERT = /* glsl */ `
varying vec3 vW;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const GROUND_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform vec3 uCLime;
uniform vec3 uCGround;
uniform vec3 uCGrid;
uniform float uB;
uniform float uRing;
uniform float uGroundA;
uniform float uGridA;
uniform float uGridR;
uniform float uSeedA;
uniform float uPulseA;
uniform float uPulsePhase;
uniform float uClockA;
uniform float uSweepA;
uniform float uSweepAng;
uniform float uGrowA;
uniform float uGrowPhase;
uniform float uGrowSpan;
uniform float uScanA;
uniform float uDomeR;
uniform vec2 uNodes[9];     // data districts (0 = core)
uniform float uNodeSeed[9]; // seed of the core -> district arc, so pulses fire when its packet lands
uniform float uFlow;
varying vec3 vW;

float gridLine(float coord, float period, float width) {
  float f = abs(fract(coord / period - 0.5) - 0.5) * period;
  float w = fwidth(coord);
  return 1.0 - smoothstep(width, width + w * 1.3, f);
}

void main() {
  vec2 q = vW.xz;
  float r = length(q);
  vec3 col = uBg;
  float pool = exp(-r * r / (2.0 * 40.0 * 40.0));
  col = mix(col, uCGround, pool * uGroundA);

  // graph-paper grid aligned with road centrelines
  vec2 g = q + 0.5 * uB;
  float fwg = fwidth(g.x);
  float minor = max(gridLine(g.x, uB * 0.25, 0.01), gridLine(g.y, uB * 0.25, 0.01)) * (1.0 - smoothstep(0.06, 0.16, fwg / (uB * 0.25)));
  float major = max(gridLine(g.x, uB, 0.018), gridLine(g.y, uB, 0.018)) * (1.0 - smoothstep(0.1, 0.3, fwg / uB));
  float seedMask = exp(-r * r / (2.0 * 7.0 * 7.0)) * uSeedA;
  float gm = max(smoothstep(uGridR, uGridR - 8.0, r) * uGridA, seedMask * 0.8);
  col += uCGrid * (minor * 0.05 + major * 0.11) * gm;

  // seed halo
  col += uCMint * (exp(-r * r / 1.2) * 0.9 + exp(-r * r / 30.0) * 0.12) * uSeedA;

  float aa = fwidth(r);

  // district pulses (data): each district rings when the packet on its arc from the core arrives
  if (uPulseA > 0.001) {
    float acc = 0.0;
    for (int k = 1; k < 9; k++) {
      vec2 dq = q - uNodes[k];
      float d2 = dot(dq, dq);
      float d = sqrt(d2);
      float since = fract(uFlow * 0.22 - uNodeSeed[k] * 3.1 - 0.415);
      float ring = exp(-sq((d - 0.4 - since * 5.5) / (0.1 + aa))) * sq(1.0 - since) * smoothstep(0.0, 0.02, since);
      float pad = (1.0 - smoothstep(1.35, 1.35 + aa * 1.5, d)) * smoothstep(1.2, 1.35, d);
      acc += ring * 1.1 + pad * 0.35 + exp(-d2 * 1.5) * 0.25;
    }
    col += uCMint * acc * uPulseA;
  }

  // 24h clock face + sweep hand (operate)
  if (uClockA > 0.001) {
    float a = atan(q.y, q.x);
    float R = uRing + 2.4;
    float ring = 1.0 - smoothstep(0.035, 0.035 + aa * 1.5, abs(r - R));
    float ta = a / 6.2831853 * 24.0;
    float n = floor(ta + 0.5);
    float arcd = abs(ta - n) * (6.2831853 / 24.0) * r;
    float major = step(mod(n + 24.0, 6.0), 0.5);
    float tlen = mix(1.0, 2.4, major);
    float tick = (1.0 - smoothstep(0.045, 0.045 + aa * 1.5, arcd)) * step(R + 0.5, r) * step(r, R + 0.5 + tlen);
    col += uCMint * (ring * 0.9 + tick * 1.0) * uClockA;

    float inside = smoothstep(R, R - 1.0, r);
    float diff = mod(a - uSweepAng, 6.2831853);
    float trail = exp(-diff * 2.0) * inside;
    vec2 hd = vec2(cos(uSweepAng), sin(uSweepAng));
    float along = dot(q, hd);
    float perp = abs(q.x * hd.y - q.y * hd.x);
    float hand = (1.0 - smoothstep(0.05, 0.05 + aa * 2.0, perp)) * step(0.0, along) * smoothstep(R + 0.6, R, r);
    col += uCMint * trail * 0.42 * uSweepA + uCLime * hand * 1.8 * uSweepA;
  }

  // growth pulses (grow)
  // growth pulses (grow): thin mint rings travel outward; only the leading ring turns lime
  if (uGrowA > 0.001) {
    float base = fract(uGrowPhase);
    for (int k = 0; k < 3; k++) {
      float ph = (base + float(k)) / 3.0;
      float R = uRing + 1.5 + ph * uGrowSpan;
      float env = smoothstep(0.0, 0.08, ph) * (1.0 - smoothstep(0.8, 1.0, ph)) * (0.45 + 0.55 * ph);
      float ring = exp(-sq((r - R) / (0.14 + aa))) * env;
      float lead = smoothstep(0.6, 0.7, ph);
      col += mix(uCMint * 0.75, uCLime * 0.6, lead) * ring * 0.8 * uGrowA;
    }
  }

  // shield base (secure)
  if (uScanA > 0.001) {
    float ring = exp(-sq((r - uDomeR) / 0.22));
    float inner = smoothstep(uDomeR, uDomeR - 12.0, r) * 0.05;
    col += uCMint * (ring * 1.3 + inner) * uScanA;
  }

  float fg = fogF(vW);
  col = mix(col, uBg, fg);
  col += uCHaze * uHaze * hazeG(normalize(vW - cameraPosition).y) * fg;
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Blueprint lines (roads + plots) ----------------
export const LINE_VERT = /* glsl */ `
${COMMON}
attribute float aT;
attribute vec4 aL; // delay, dur, kind, len
uniform float uDrawRC;
uniform float uDrawPC;
uniform float uDrawRE;
uniform float uDrawPE;
uniform float uRoadA;
uniform float uPlotA;
uniform float uExpRoadA;
uniform float uExpPlotA;
uniform float uSiteA;
varying float vT;
varying float vProg;
varying float vLen;
varying float vA;
varying float vKind;
varying float vFog;
void main() {
  // kind: 0 core road, 1 core plot, 2 expansion road, 3 expansion plot, 4 reserved landmark site
  float k = aL.z;
  float draw = k < 0.5 ? uDrawRC : (k < 1.5 ? uDrawPC : (k < 2.5 ? uDrawRE : (k < 3.5 ? uDrawPE : uDrawPC)));
  float a = k < 0.5 ? uRoadA : (k < 1.5 ? uPlotA : (k < 2.5 ? uExpRoadA : (k < 3.5 ? uExpPlotA : uSiteA)));
  vProg = clamp((draw - aL.x) / aL.y, 0.0, 1.0);
  vT = aT;
  vLen = aL.w;
  vA = a;
  vKind = k;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vFog = fogF(wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
  if (vProg <= 0.0 || a < 0.002) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const LINE_FRAG = /* glsl */ `
uniform vec3 uCRoad;
uniform vec3 uCPlot;
uniform vec3 uCLime;
uniform vec3 uCMint;
varying float vT;
varying float vProg;
varying float vLen;
varying float vA;
varying float vKind;
varying float vFog;
void main() {
  if (vT > vProg) discard;
  float dist = (vProg - vT) * vLen;
  float head = exp(-dist * 1.1) * (1.0 - step(0.999, vProg));
  float isSite = step(3.5, vKind);
  float isPlot = (1.0 - isSite) * mod(vKind, 2.0);
  vec3 base = mix(mix(uCRoad, uCPlot, isPlot), uCLime * 0.55, isSite);
  // the lime pen tip only traces the core roads; plots and later lines draw with a mint tip
  vec3 headC = vKind < 0.5 ? uCLime : uCMint * 0.8;
  vec3 col = base * vA + headC * head * 2.0 * min(1.0, vA * 2.0);
  gl_FragColor = vec4(col * (1.0 - vFog), 1.0);
}
`;

// ---------------- Traffic / data streaks ----------------
export const TRAF_VERT = /* glsl */ `
${COMMON}
attribute vec4 aRoad;
attribute vec4 aP;     // type, lane, speed, offset
attribute float aSeed;
uniform float uFlow;
uniform float uTrafDen;
uniform float uCityR;
uniform float uTrafMode;
uniform float uTrafA;
uniform vec3 uCMint;
uniform vec3 uCPaper;
varying vec2 vQ;
varying vec3 vCol;
void main() {
  vec2 pos; vec2 dir; float s;
  if (aP.x < 0.5) {
    vec2 a = aRoad.xy; vec2 b = aRoad.zw;
    vec2 ab = b - a; float len = length(ab);
    s = fract(aP.w + uFlow * aP.z / len);
    if (aP.y < 0.0) s = 1.0 - s;
    pos = a + ab * s;
    dir = ab / len * aP.y;
  } else {
    float R = aRoad.x;
    float ang = (aP.w + uFlow * aP.z * aP.y / (6.2831853 * R)) * 6.2831853;
    pos = R * vec2(cos(ang), sin(ang));
    dir = vec2(-sin(ang), cos(ang)) * aP.y;
    s = 0.5;
  }
  vec2 perp = vec2(dir.y, -dir.x);
  pos += perp * 0.24;
  float r = length(pos);
  float vis = step(aSeed, uTrafDen) * smoothstep(uCityR, uCityR - 2.0, r) * smoothstep(0.0, 0.03, s) * smoothstep(1.0, 0.97, s);
  float L = mix(0.7, 1.5, fract(aSeed * 7.13)) * mix(1.9, 1.0, uTrafMode);
  vec2 wp = pos + dir * position.x * L + perp * position.y * 0.13;
  vec3 w = vec3(wp.x, 0.07, wp.y);
  vQ = position.xy + 0.5;
  vec3 traffic = aP.y > 0.0 ? uCPaper * 1.45 : uCMint * 1.25;
  vCol = mix(uCMint * 1.9, traffic, uTrafMode) * vis * uTrafA * (1.0 - fogF(w));
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  if (vis < 0.001) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const TRAF_FRAG = /* glsl */ `
varying vec2 vQ;
varying vec3 vCol;
void main() {
  float head = pow(clamp(vQ.x, 0.0, 1.0), 2.2);
  float ay = abs(vQ.y - 0.5) * 2.0;
  float across = 1.0 - ay * ay;
  gl_FragColor = vec4(vCol * head * across, 1.0);
}
`;

// ---------------- Arcs (tubes) ----------------
export const ARC_VERT = /* glsl */ `
${COMMON}
attribute vec2 aArc; // delay, seed
uniform float uDraw;
varying float vT;
varying float vProg;
varying float vSeed;
varying vec3 vW;
varying vec3 vN;
void main() {
  vT = uv.x;
  vProg = clamp((uDraw - aArc.x) / 0.45, 0.0, 1.0);
  vSeed = aArc.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
  if (vProg <= 0.0) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const ARC_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCArc;
uniform vec3 uCPacket;
uniform vec3 uCHead;
uniform float uArcA;
uniform float uArcBase;
uniform float uFlow;
uniform float uDir;
varying float vT;
varying float vProg;
varying float vSeed;
varying vec3 vW;
varying vec3 vN;
void main() {
  if (vT > vProg) discard;
  vec3 V = normalize(cameraPosition - vW);
  float fr = abs(dot(normalize(vN), V));
  float soft = pow(fr, 1.3);
  float tt = mix(vT, 1.0 - vT, uDir * step(0.5, vSeed));
  float f = fract(tt * 1.4 - uFlow * 0.22 + vSeed * 3.1);
  float packet = smoothstep(0.78, 0.985, f) * (1.0 - smoothstep(0.985, 1.0, f));
  float head = exp(-(vProg - vT) * 40.0) * (1.0 - step(0.999, vProg));
  vec3 col = uCArc * uArcBase + uCPacket * packet * 2.2 + uCHead * head * 2.0;
  col *= soft * uArcA * (1.0 - fogF(vW));
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Glow sprites ----------------
export const GLOW_VERT = /* glsl */ `
${COMMON}
attribute float aSize;
attribute float aGroup;
attribute vec3 aCol;
uniform float uG0;
uniform float uG1;
uniform float uG2;
uniform float uG3;
uniform float uPx;
varying vec3 vCol;
void main() {
  float gi = aGroup < 0.5 ? uG0 : (aGroup < 1.5 ? uG1 : (aGroup < 2.5 ? uG2 : uG3));
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec4 mv = viewMatrix * wp;
  gl_PointSize = gi > 0.001 ? clamp(aSize * uPx / -mv.z, 2.0, 256.0) : 0.0;
  vCol = aCol * gi * (1.0 - fogF(wp.xyz));
  gl_Position = projectionMatrix * mv;
  if (gi <= 0.001) gl_Position = vec4(0.0, 0.0, -2.0, 1.0);
}
`;

export const GLOW_FRAG = /* glsl */ `
varying vec3 vCol;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float g = exp(-d * d * 7.0) * 0.7 + exp(-d * d * 60.0) * 1.6;
  g *= 1.0 - smoothstep(0.8, 1.0, d);
  gl_FragColor = vec4(vCol * g, 1.0);
}
`;

// ---------------- Shield dome ----------------
export const DOME_VERT = /* glsl */ `
${COMMON}
uniform float uDomeK;
varying vec3 vP;
varying vec3 vW;
varying vec3 vN;
void main() {
  vP = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(vec3(position.x, position.y / uDomeK, position.z));
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const DOME_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform vec3 uCLime;
uniform vec3 uCPaper;
uniform float uDomeA;
uniform float uDomeRise;
uniform float uScanY;
uniform float uCell;
uniform vec3 uImpact;  // unit direction (dome space) where the threat is deflected
uniform float uRipple; // 0 = no ripple, (0,1] = time since impact
const vec2 HS = vec2(1.0, 1.7320508);
vec4 getHex(vec2 p) {
  vec4 hC = floor(vec4(p, p - vec2(0.5, 1.0)) / HS.xyxy) + 0.5;
  vec4 h = vec4(p - hC.xy * HS, p - (hC.zw + 0.5) * HS);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + 0.5);
}
float hexD(vec2 p) { p = abs(p); return max(dot(p, HS * 0.5), p.x); }
varying vec3 vP;
varying vec3 vW;
varying vec3 vN;
void main() {
  float el01 = asin(clamp(vP.y, 0.0, 1.0)) / 1.5707963;
  float front = uDomeRise * 1.08 - 0.04;
  float frontGlow = exp(-sq((front - el01) / 0.03)) * (1.0 - smoothstep(0.9, 1.0, uDomeRise));
  float reveal = smoothstep(front + 0.06, front - 0.02, el01);
  float az = atan(vP.z, vP.x);
  vec2 hp = vec2(az / 6.2831853 * 46.0, el01 * 13.5);
  vec4 h = getHex(hp);
  float e = 0.5 - hexD(h.xy);
  float aa = length(fwidth(vW)) / uCell * 1.3;
  float line = 1.0 - smoothstep(0.018, 0.018 + aa, e);
  float topFade = 1.0 - smoothstep(0.62, 0.9, el01);
  vec3 V = normalize(cameraPosition - vW);
  vec3 N = normalize(vN);
  float fr = pow(clamp(1.0 - abs(dot(N, V)), 0.0, 1.0), 2.2);
  // scanning ring: a soft mint band with a thin lime core (SECURE's single lime element)
  float sd = vW.y - uScanY;
  float aaY = fwidth(vW.y);
  float scanBand = exp(-sq(sd / 0.3));
  float scanCore = exp(-sq(sd / max(0.07, aaY * 0.9)));
  float cellH = hash12(h.zw + 3.1);
  float flash = step(0.975, hash12(h.zw * 1.7 + floor(uTime * 0.6 * uMotion + cellH * 7.0))) * (1.0 - e * 1.6);
  // impact ripple: whole hex cells light up as a ring expands from the deflection point
  vec2 hc = h.zw * HS;
  float azc = hc.x / 46.0 * 6.2831853, elc = hc.y / 13.5 * 1.5707963;
  vec3 dirC = vec3(cos(elc) * cos(azc), sin(elc), cos(elc) * sin(azc));
  float dAng = acos(clamp(dot(dirC, uImpact), -1.0, 1.0));
  float live = step(0.001, uRipple);
  float rip = exp(-sq((dAng - uRipple * 1.5) / 0.12)) * pow(1.0 - uRipple, 1.5) * live;
  float hit = exp(-sq(dAng / 0.1)) * (1.0 - smoothstep(0.0, 0.3, uRipple)) * live;
  float a = 0.008 + fr * 0.6 + line * (0.035 + fr * 0.35) * topFade + flash * 0.05 * topFade;
  vec3 col = uCMint * a;
  col += uCMint * rip * (0.1 + line * 1.1) + uCPaper * hit * (0.3 + line * 1.0);
  col += uCMint * scanBand * (0.05 + line * 0.3) + uCLime * scanCore * 0.45;
  col += uCMint * frontGlow * 0.9;
  col *= gl_FrontFacing ? 1.0 : 0.15;
  col *= mix(0.25, 1.0, reveal);
  col *= uDomeA * (1.0 - fogF(vW) * 0.85);
  gl_FragColor = vec4(col, 1.0);
}
`;

// ---------------- Beacons ----------------
export const BEAM_VERT = /* glsl */ `
${COMMON}
varying vec3 vW;
varying vec3 vN;
varying float vY;
void main() {
  vY = uv.y;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const BEAM_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform vec3 uCPaper;
uniform float uBeamA;
uniform float uBeamRise;
uniform float uFlow;
uniform float uBeamK; // pulse cadence: each product beacon has its own rhythm
varying vec3 vW;
varying vec3 vN;
varying float vY;
void main() {
  if (vY > uBeamRise) discard;
  vec3 V = normalize(cameraPosition - vW);
  float f = abs(dot(normalize(vN), V));
  float soft = pow(f, 2.2);
  float core = pow(f, 34.0);
  float fade = pow(clamp(1.0 - vY, 0.0, 1.0), 1.8) * smoothstep(0.0, 0.015, vY);
  float pulse = 0.7 + 0.5 * smoothstep(0.75, 1.0, fract(vY * 5.0 - uFlow * uBeamK));
  float tip = exp(-sq((uBeamRise - vY) * 30.0)) * (1.0 - step(0.999, uBeamRise));
  vec3 col = (uCMint * soft * 0.42 + uCPaper * core * 0.8) * fade * pulse + uCPaper * tip * soft;
  gl_FragColor = vec4(col * uBeamA, 1.0);
}
`;

// ---------------- Horizon haze ----------------
export const HAZE_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vDir = wp.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const HAZE_FRAG = /* glsl */ `
${COMMON}
varying vec3 vDir;
void main() {
  float e = normalize(vDir).y;
  gl_FragColor = vec4(uCHaze * hazeG(e) * uHaze, 1.0);
}
`;
// Vertical scanning blade that follows the 24h sweep hand
export const BLADE_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vW;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
export const BLADE_FRAG = /* glsl */ `
${COMMON}
uniform vec3 uCMint;
uniform float uSweepA;
varying vec2 vUv;
varying vec3 vW;
void main() {
  float up = 1.0 - vUv.y;
  float a = pow(up, 1.6) * smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  gl_FragColor = vec4(uCMint * a * 0.55 * uSweepA * (1.0 - fogF(vW)), 1.0);
}
`;

// ---------------- Dust ----------------
export const DUST_VERT = /* glsl */ `
${COMMON}
attribute float aSeed;
uniform float uPx;
uniform float uDustA;
uniform vec3 uCDust;
varying vec3 vCol;
void main() {
  vec3 p = position;
  float t = uTime * uMotion;
  p.x += sin(t * 0.05 + aSeed * 40.0) * 1.5;
  p.y += sin(t * 0.07 + aSeed * 90.0) * 0.8;
  p.z += cos(t * 0.04 + aSeed * 70.0) * 1.5;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  gl_PointSize = clamp(0.18 * uPx / -mv.z, 1.0, 6.0);
  vCol = uCDust * uDustA * (0.4 + 0.6 * fract(aSeed * 13.1)) * (1.0 - fogF(p));
  gl_Position = projectionMatrix * mv;
}
`;
export const DUST_FRAG = /* glsl */ `
varying vec3 vCol;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  gl_FragColor = vec4(vCol * (1.0 - d * d), 1.0);
}
`;

// ---------------- Threat streak (secure): an incoming spark that is deflected off the shield ----------------
export const STREAK_VERT = /* glsl */ `
${COMMON}
attribute float aT;   // 0 = head, 1 = tail end
uniform vec3 uHead;
uniform vec3 uTailV;  // head -> tail vector
varying float vT;
varying float vFog;
void main() {
  vec3 wp = uHead + uTailV * aT;
  vT = aT;
  vFog = fogF(wp);
  gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
}
`;
export const STREAK_FRAG = /* glsl */ `
uniform vec3 uCPaper;
uniform vec3 uCMint;
uniform float uStreakA;
varying float vT;
varying float vFog;
void main() {
  float k = pow(1.0 - vT, 2.2);
  gl_FragColor = vec4(mix(uCMint, uCPaper, k) * k * 1.6 * uStreakA * (1.0 - vFog), 1.0);
}
`;
