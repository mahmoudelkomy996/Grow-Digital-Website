// GLSL for the arc concept. Everything is additive light on the #052626 stage; "fog" fades light to zero.

const COMMON = /* glsl */ `
uniform float uAssemble;
uniform float uActive;
uniform float uGlow;
uniform float uSizeScale;
uniform float uTime;
uniform float uFlow;
uniform float uIdle;
uniform float uPxScale;
uniform float uPixelRatio;
uniform float uFogStart;
uniform float uFogRange;
uniform vec3 uLime;
`;

// Generic sculpture vertex shader. Assembly streams OUT OF THE PATH: every piece leaves the station's cusp
// bead (uBead, world space), rises along the stem axis and fans out to its place (quadratic bezier in world
// space, so nested group rotations do not matter). Special modes: LEMNISCATE flow, STREAM along a bezier,
// GROW from an attachment point, STATIC (dust, beads).
export const sculptVert = /* glsl */ `
${COMMON}
uniform vec3 uBead;
attribute vec3 aPivot;
attribute vec3 aOff;
attribute vec4 aAxis;
attribute vec4 aRnd;   // x delay, y world size, z phase, w brightness
attribute vec3 aCol;
attribute float aAcc;
attribute vec4 aExt;
varying vec3 vColor;
#ifdef PULSE
varying vec2 vPulse;
#endif
#ifdef LEMNISCATE
uniform float uLemA;
vec3 lem(float t) {
  float s = sin(t), c = cos(t);
  float d = 1.0 + s * s;
  return vec3(uLemA * c / d, uLemA * s * c / d, uLemA * 0.28 * s / d);
}
#endif
vec3 fromBead(vec3 tgtW, float e) {
  vec3 j = normalize(aOff + vec3(1e-3, 2e-3, 3e-3));
  vec3 p0 = uBead + j * 0.14;
  float rise = max(0.8, tgtW.y - p0.y);
  vec3 c = p0 + vec3(0.0, rise * 0.92, 0.0) + j * (0.1 * rise);
  float ie = 1.0 - e;
  return ie * ie * p0 + 2.0 * ie * e * c + e * e * tgtW;
}
void main() {
  float a = clamp((uAssemble - aRnd.x * 0.5) * 2.0, 0.0, 1.0);
  float e = a * a * (3.0 - 2.0 * a);
  float vis = 1.0;
  vec3 w;
#if defined(LEMNISCATE)
  float t = aExt.x + uFlow * aExt.y;
  vec3 c0 = lem(t);
  vec3 tg = normalize(lem(t + 0.02) - c0);
  vec3 b1 = normalize(cross(tg, vec3(0.0, 0.0, 1.0)));
  vec3 b2 = cross(b1, tg);
  float an = aExt.w + t * 2.0;
  vec3 tgt = c0 + (b1 * cos(an) + b2 * sin(an)) * aExt.z;
  w = fromBead((modelMatrix * vec4(tgt, 1.0)).xyz, e);
#elif defined(STREAM)
  float q = fract(aExt.x + uFlow * aExt.y);
  vec3 s0 = position + aOff;
  vec3 cc = aAxis.xyz;
  vec3 tgt = mix(mix(s0, cc, q), mix(cc, position, q), q);
  vis = smoothstep(0.0, 0.18, q) * (1.0 - smoothstep(0.82, 1.0, q));
  w = fromBead((modelMatrix * vec4(tgt, 1.0)).xyz, e);
#elif defined(GROW)
  float g = smoothstep(aExt.x, aExt.x + aExt.y, uAssemble);
  w = (modelMatrix * vec4(aPivot + (position - aPivot) * g, 1.0)).xyz;
  vis = g; a = g; e = 1.0;
#elif defined(STATIC)
  w = (modelMatrix * vec4(position, 1.0)).xyz;
  a = 1.0; e = 1.0;
#else
  w = fromBead((modelMatrix * vec4(position, 1.0)).xyz, e);
#endif
  float tr = 4.0 * e * (1.0 - e); // in transit
  w += tr * uIdle * 0.12 * vec3(sin(uTime * 0.31 + aRnd.z * 6.28), sin(uTime * 0.27 + aRnd.z * 11.0), cos(uTime * 0.23 + aRnd.z * 7.0));
  vec4 mv = viewMatrix * vec4(w, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(1e-3, -mv.z);
  float fog = exp(-max(0.0, dist - uFogStart) / uFogRange);
  float nearFade = smoothstep(0.8, 4.0, dist);
#if defined(RIGID_LINES)
  float bright = uGlow * a * a;
#elif defined(LINES)
  float bright = uGlow * smoothstep(0.72, 1.0, a);
#elif defined(STATIC) || defined(GROW)
  float bright = uGlow;
#else
  float bright = uGlow * smoothstep(0.0, 0.2, a) * (1.0 + 0.6 * tr);
#endif
  bright *= aRnd.w * vis * fog * nearFade;
  vec3 col = mix(aCol, uLime, clamp(aAcc * uActive, 0.0, 1.0));
#ifdef POINTS
  float px = aRnd.y * uSizeScale / (dist * uPxScale);
  float pc = clamp(px, 1.6, 80.0);
  float ee = min(px / pc, 1.0);
  bright *= ee * ee;
  bright *= 1.0 - uIdle * 0.22 * (0.5 + 0.5 * sin(uTime * 1.3 + aRnd.z * 37.0));
  gl_PointSize = pc * uPixelRatio;
#endif
#ifdef PULSE
  vPulse = aExt.xy;
#endif
  vColor = col * bright;
}
`;

export const pointsFrag = /* glsl */ `
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(c, c);
  if (r2 > 1.0) discard;
  float f = (exp(-r2 * 7.0) + 0.22 * exp(-r2 * 2.2)) * (1.0 - r2);
  gl_FragColor = vec4(vColor * f, 1.0);
}
`;

export const linesFrag = /* glsl */ `
varying vec3 vColor;
#ifdef PULSE
uniform float uFlow;
varying vec2 vPulse;
#endif
void main() {
  vec3 c = vColor;
#ifdef PULSE
  float q = fract(uFlow * 0.25 + vPulse.y);
  float d = vPulse.x - q;
  c *= 1.0 + 5.0 * exp(-d * d * 160.0);
#endif
  gl_FragColor = vec4(c, 1.0);
}
`;

// Fresnel shell (SECURE): light only at grazing angles.
export const fresnelVert = /* glsl */ `
${COMMON}
varying vec3 vN;
varying vec3 vV;
varying float vFog;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = -mv.xyz;
  float dist = -mv.z;
  vFog = exp(-max(0.0, dist - uFogStart) / uFogRange);
  gl_Position = projectionMatrix * mv;
}
`;
export const fresnelFrag = /* glsl */ `
uniform float uAssemble;
uniform float uGlow;
uniform float uActive;
uniform vec3 uColor;
uniform vec3 uLime;
varying vec3 vN;
varying vec3 vV;
varying float vFog;
void main() {
  float ndv = abs(dot(normalize(vN), normalize(vV)));
  float rim = pow(1.0 - ndv, 2.6);
  float a = smoothstep(0.55, 1.0, uAssemble);
  vec3 col = mix(uColor, uLime, 0.18 * uActive);
  gl_FragColor = vec4(col * rim * a * uGlow * vFog * 0.7, 1.0);
}
`;

// Tube: centreline + normal * radius (radius floored to ~1px so the far thread never shimmers).
// uSmooth relaxes the dips into the macro arc (finale); beyond uSplitS the radius is uRadius2 (the thin
// thread that peeks out of the thick intro smile).
export const tubeVert = /* glsl */ `
uniform float uRadius;
uniform float uRadius2;
uniform float uSplitS;
uniform float uSmooth;
uniform float uPxScale;
uniform float uMinPx;
uniform float uMaxPx;
uniform float uSOff;
attribute vec3 aCenter;
attribute vec3 aMacro;
attribute vec3 aMacroN;
attribute float aS;
varying vec3 vN;
varying vec3 vV;
varying float vS;
varying float vDist;
varying float vThin;
varying float vThk;
void main() {
#ifdef CAP
  vec3 c = aCenter;
  vec3 n = normal;
  float rr = uRadius;
  vThk = 1.0;
#else
  vec3 c = mix(aCenter, aMacro, uSmooth);
  vec3 n = normalize(mix(normal, aMacroN, uSmooth));
  float split = step(uSplitS, aS);
  float rr = mix(uRadius, uRadius2, split);
  vThk = 1.0 - split;
#endif
  vec4 cv = modelViewMatrix * vec4(c, 1.0);
  float dist = max(1e-3, -cv.z);
  float r = clamp(rr, uMinPx * dist * uPxScale, uMaxPx * dist * uPxScale);
  vThin = min(1.0, rr / r) * smoothstep(1.2, 6.5, dist);
  vec4 mv = modelViewMatrix * vec4(c + n * r, 1.0);
  vN = normalize(normalMatrix * n);
  vV = -mv.xyz;
  vS = aS + uSOff;
  vDist = dist;
  gl_Position = projectionMatrix * mv;
}
`;
export const tubeFrag = /* glsl */ `
uniform float uReveal;
uniform float uFlow;
uniform float uGlow;
uniform float uHead;
uniform float uFogStart;
uniform float uFogRange;
uniform float uCapS;
uniform float uThick;
uniform float uSweepS;
uniform float uSweepW;
uniform float uSweepAmt;
uniform float uCharge;
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform vec3 uColP;
varying vec3 vN;
varying vec3 vV;
varying float vS;
varying float vDist;
varying float vThin;
varying float vThk;
void main() {
#ifdef CAP
  float s = uCapS;
  const float SPEC_W = 0.1;
#else
  float s = vS;
  if (s > uReveal) discard;
  const float SPEC_W = 0.22;
#endif
  vec3 N = normalize(vN), V = normalize(vV);
  float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
  float ahead = max(0.0, uReveal - s);
  float head = exp(-ahead * 0.28) * uHead;
  float f = fract((s - uFlow) / 9.0) - 0.5;
  float pulse = exp(-f * f * 60.0);
  float ds = s - uSweepS;
  float band = exp(-ds * ds / uSweepW) * uSweepAmt;
  float charged = uCharge * (1.0 - smoothstep(-3.0, 0.5, ds));
  // thin thread: soft glowing core
  float body = pow(ndv, 1.4);
  float hot = pow(ndv, 7.0);
  vec3 thin = (mix(uColA, uColB, body) * (0.72 + 0.5 * pulse + 0.45 * charged) + uColC * hot * (0.4 + 0.3 * pulse + 1.4 * band)) * body
            + uColP * band * body * 1.4;
  // thick sculpted smile: rim-lit glass, inner filament, a soft key highlight, a light band travelling inside
  float rim = pow(1.0 - ndv, 2.4) * smoothstep(0.0, 0.28, ndv);
  vec3 Lk = normalize(vec3(-0.35, 0.75, 0.55));
  float spec = pow(max(dot(N, normalize(Lk + V)), 0.0), 40.0);
  float wrap = 0.5 + 0.5 * dot(N, Lk);
  float fil = pow(ndv, 60.0);
  float core = pow(ndv, 5.0);
  vec3 thick = uColB * (0.035 + 0.07 * wrap + 1.35 * rim) + uColA * 0.16 * ndv
             + mix(uColB, uColC, 0.45) * fil * (0.5 + 0.5 * pulse) + uColC * spec * SPEC_W
             + mix(uColB, uColC, 0.5) * band * (0.08 + 0.3 * core + 0.8 * fil + 0.5 * rim);
  vec3 col = mix(thin, thick, uThick * vThk);
  col += uColP * head * (0.6 + 1.6 * hot) * body;
  float fog = exp(-max(0.0, vDist - uFogStart) / uFogRange);
  gl_FragColor = vec4(col * uGlow * fog * vThin, 1.0);
}
`;

// Final grade: hue-preserving soft shoulder on the max channel (identity below uKnee, so the #052626 stage
// and every mid-tone stay exact), optional bottom fade behind the mobile text, then linear -> sRGB.
export const gradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uKnee: { value: 0.68 },
    uStage: { value: null },
    uFadeY: { value: 0 },
  },
  vertexShader: /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,
  fragmentShader: /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uKnee;
uniform vec3 uStage;
uniform float uFadeY;
varying vec2 vUv;
vec3 toSRGB(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
void main() {
  vec3 c = texture2D(tDiffuse, vUv).rgb;
  if (uFadeY > 0.0) {
    vec3 l = max(c - uStage, 0.0);
    c = uStage + l * mix(1.0 - uFadeY, 1.0, smoothstep(0.22, 0.6, vUv.y));
  }
  float m = max(max(c.r, c.g), c.b);
  if (m > uKnee) {
    float k = uKnee;
    float f = k + (1.0 - k) * (1.0 - exp(-(m - k) / (1.0 - k)));
    c *= f / m;
  }
  gl_FragColor = vec4(toSRGB(clamp(c, 0.0, 1.0)), 1.0);
}
`,
};
