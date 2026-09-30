// Lean post pipeline: scene -> one HDR target at an internal render scale -> dual-filter bloom chain
// (sized from CSS pixels, so its cost does not grow with dpr) -> one composite to the canvas (FXAA + linear -> sRGB).
// The composite upsamples the scene target when the render scale is below the canvas dpr.
import * as THREE from "three";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const PREFILTER = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
  c += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  c *= 0.25;
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-4);
  float w = max(soft, br - uThreshold) / max(br, 1e-4);
  gl_FragColor = vec4(min(c * w, vec3(16.0)), 1.0);
}
`;
const DOWN = /* glsl */ `
uniform sampler2D tSrc;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 h = uTexel * 0.5;
  vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
  s += texture2D(tSrc, vUv - h).rgb;
  s += texture2D(tSrc, vUv + h).rgb;
  s += texture2D(tSrc, vUv + vec2(h.x, -h.y)).rgb;
  s += texture2D(tSrc, vUv - vec2(h.x, -h.y)).rgb;
  gl_FragColor = vec4(s / 8.0, 1.0);
}
`;
const UP = /* glsl */ `
uniform sampler2D tSrc;
uniform sampler2D tBase;
uniform vec2 uTexel;
uniform float uBaseW;
varying vec2 vUv;
void main() {
  vec2 h = uTexel * 0.5;
  vec3 s = texture2D(tSrc, vUv + vec2(-h.x * 2.0, 0.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(-h.x, h.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(0.0, h.y * 2.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(h.x, h.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(h.x * 2.0, 0.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(h.x, -h.y)).rgb * 2.0;
  s += texture2D(tSrc, vUv + vec2(0.0, -h.y * 2.0)).rgb;
  s += texture2D(tSrc, vUv + vec2(-h.x, -h.y)).rgb * 2.0;
  gl_FragColor = vec4(s / 12.0 + texture2D(tBase, vUv).rgb * uBaseW, 1.0);
}
`;
const FINAL = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform float uStrength;
uniform vec2 uRcp;
varying vec2 vUv;
float lum(vec3 c) { return sqrt(dot(c, vec3(0.299, 0.587, 0.114))); }
vec3 sceneAA(vec2 uv) {
#ifdef USE_FXAA
  vec3 cM = texture2D(tScene, uv).rgb;
  float lNW = lum(texture2D(tScene, uv + vec2(-1.0, -1.0) * uRcp).rgb);
  float lNE = lum(texture2D(tScene, uv + vec2(1.0, -1.0) * uRcp).rgb);
  float lSW = lum(texture2D(tScene, uv + vec2(-1.0, 1.0) * uRcp).rgb);
  float lSE = lum(texture2D(tScene, uv + vec2(1.0, 1.0) * uRcp).rgb);
  float lM = lum(cM);
  float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
  float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
  if (lMax - lMin < max(0.02, lMax * 0.1)) return cM;
  vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
  float red = max((lNW + lNE + lSW + lSE) * 0.03125, 1.0 / 128.0);
  float rcpMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + red);
  dir = clamp(dir * rcpMin, vec2(-8.0), vec2(8.0)) * uRcp;
  vec3 a = 0.5 * (texture2D(tScene, uv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(tScene, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
  vec3 b = a * 0.5 + 0.25 * (texture2D(tScene, uv - dir * 0.5).rgb + texture2D(tScene, uv + dir * 0.5).rgb);
  float lB = lum(b);
  return (lB < lMin || lB > lMax) ? a : b;
#else
  return texture2D(tScene, uv).rgb;
#endif
}
void main() {
  vec3 c = sceneAA(vUv) + texture2D(tBloom, vUv).rgb * uStrength;
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
}
`;

export function createPost(renderer, { samples = 0, levels = 5, strength = 0.8, threshold = 0.7, knee = 0.25, useFloat = true, fxaa = false }) {
  const type = useFloat ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const sceneRT = new THREE.WebGLRenderTarget(4, 4, { type, samples, colorSpace: useFloat ? THREE.NoColorSpace : THREE.SRGBColorSpace });
  const opt = { type, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
  const down = [], up = [];
  for (let i = 0; i < levels; i++) down.push(new THREE.WebGLRenderTarget(4, 4, opt));
  for (let i = 0; i < levels - 1; i++) up.push(new THREE.WebGLRenderTarget(4, 4, opt));
  const mk = (fs, u, defines = {}) => new THREE.ShaderMaterial({ uniforms: u, defines, vertexShader: VERT, fragmentShader: fs, depthTest: false, depthWrite: false });
  const pre = mk(PREFILTER, { tSrc: { value: sceneRT.texture }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: threshold }, uKnee: { value: knee } });
  const downs = [];
  for (let i = 1; i < levels; i++) downs.push(mk(DOWN, { tSrc: { value: down[i - 1].texture }, uTexel: { value: new THREE.Vector2() } }));
  const ups = [];
  for (let i = levels - 2; i >= 0; i--) {
    const src = i === levels - 2 ? down[levels - 1] : up[i + 1];
    ups.push({ i, m: mk(UP, { tSrc: { value: src.texture }, tBase: { value: down[i].texture }, uTexel: { value: new THREE.Vector2() }, uBaseW: { value: 1 } }) });
  }
  const fin = mk(FINAL, { tScene: { value: sceneRT.texture }, tBloom: { value: up[0].texture }, uStrength: { value: strength }, uRcp: { value: new THREE.Vector2() } }, fxaa ? { USE_FXAA: "" } : {});
  const quad = new FullScreenQuad(pre);
  let enabled = true;

  return {
    sceneRT,
    final: fin,
    set bloomEnabled(v) { enabled = v; },
    // w, h: scene target size in pixels; bw, bh: first bloom level size (defaults to half the scene target)
    setSize(w, h, bw = Math.round(w / 2), bh = Math.round(h / 2)) {
      sceneRT.setSize(w, h);
      fin.uniforms.uRcp.value.set(1 / w, 1 / h);
      bw = Math.max(1, bw); bh = Math.max(1, bh);
      // 4 bilinear taps spaced to cover the downscale ratio (ratio 2 -> +-1 texel)
      pre.uniforms.uTexel.value.set(0.5 / bw, 0.5 / bh);
      for (let i = 0; i < levels; i++) {
        down[i].setSize(bw, bh);
        if (i < levels - 1) up[i].setSize(bw, bh);
        if (i > 0) downs[i - 1].uniforms.uTexel.value.set(1 / down[i - 1].width, 1 / down[i - 1].height);
        bw = Math.max(1, Math.round(bw / 2)); bh = Math.max(1, Math.round(bh / 2));
      }
      for (const u of ups) {
        const srcRT = u.i === levels - 2 ? down[levels - 1] : up[u.i + 1];
        u.m.uniforms.uTexel.value.set(1 / srcRT.width, 1 / srcRT.height);
      }
    },
    render(scene, camera, prof) {
      prof && prof.begin("scene");
      renderer.setRenderTarget(sceneRT);
      renderer.render(scene, camera);
      prof && prof.end();
      prof && prof.begin("post");
      if (enabled) {
        quad.material = pre; renderer.setRenderTarget(down[0]); quad.render(renderer);
        for (let i = 1; i < levels; i++) { quad.material = downs[i - 1]; renderer.setRenderTarget(down[i]); quad.render(renderer); }
        for (const u of ups) { quad.material = u.m; renderer.setRenderTarget(up[u.i]); quad.render(renderer); }
      }
      fin.uniforms.uStrength.value = enabled ? strength : 0;
      quad.material = fin; renderer.setRenderTarget(null); quad.render(renderer);
      prof && prof.end();
    },
  };
}

// Optional GPU timer (EXT_disjoint_timer_query_webgl2), only with ?debug&gpu. Exposes window.__gpu = { name: ms }.
export function createProfiler(renderer) {
  const gl = renderer.getContext();
  const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2");
  if (!ext) return null;
  const pending = [];
  const acc = {};
  let cur = null;
  window.__gpu = {};
  return {
    begin(name) { const q = gl.createQuery(); gl.beginQuery(ext.TIME_ELAPSED_EXT, q); cur = { q, name }; },
    end() { gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push(cur); cur = null; },
    poll() {
      while (pending.length) {
        const { q, name } = pending[0];
        if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) break;
        const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6;
        gl.deleteQuery(q); pending.shift();
        const a = (acc[name] = acc[name] || []);
        a.push(ms); if (a.length > 60) a.shift();
        const sorted = [...a].sort((x, y) => x - y);
        window.__gpu[name] = +sorted[Math.floor(sorted.length * 0.25)].toFixed(2);
      }
    },
  };
}
