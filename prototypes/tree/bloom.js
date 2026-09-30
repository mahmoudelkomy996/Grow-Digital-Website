// Cheap dual-filter (Kawase) bloom. It never writes to the composer buffers: it only produces
// `this.texture` (half resolution), which the output pass adds to the scene in its single full-res pass.
import * as THREE from "three";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export class DualBloomPass extends Pass {
  constructor({ levels = 5, threshold = 0.4, knee = 0.3 } = {}) {
    super();
    this.needsSwap = false;
    this.levels = levels;
    const opts = { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
    this.down = Array.from({ length: levels }, () => new THREE.WebGLRenderTarget(1, 1, opts));
    this.up = Array.from({ length: levels - 1 }, () => new THREE.WebGLRenderTarget(1, 1, opts));
    this.texture = this.up[0].texture;

    this.prefilter = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: threshold }, uKnee: { value: knee } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tSrc;
        uniform vec2 uTexel;
        uniform float uThreshold;
        uniform float uKnee;
        varying vec2 vUv;
        void main() {
          vec3 c = texture2D(tSrc, vUv + uTexel * vec2(-0.5, -0.5)).rgb;
          c += texture2D(tSrc, vUv + uTexel * vec2(0.5, -0.5)).rgb;
          c += texture2D(tSrc, vUv + uTexel * vec2(-0.5, 0.5)).rgb;
          c += texture2D(tSrc, vUv + uTexel * vec2(0.5, 0.5)).rgb;
          c *= 0.25;
          float br = max(c.r, max(c.g, c.b));
          float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
          soft = soft * soft / (4.0 * uKnee + 1e-5);
          float k = max(soft, br - uThreshold) / max(br, 1e-5);
          gl_FragColor = vec4(c * k, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.downMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uHalf: { value: new THREE.Vector2() } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tSrc;
        uniform vec2 uHalf;
        varying vec2 vUv;
        void main() {
          vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
          s += texture2D(tSrc, vUv - uHalf).rgb;
          s += texture2D(tSrc, vUv + uHalf).rgb;
          s += texture2D(tSrc, vUv + vec2(uHalf.x, -uHalf.y)).rgb;
          s += texture2D(tSrc, vUv - vec2(uHalf.x, -uHalf.y)).rgb;
          gl_FragColor = vec4(s / 8.0, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.upMat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, tAdd: { value: null }, uHalf: { value: new THREE.Vector2() }, uAddW: { value: 1 } },
      vertexShader: VERT,
      fragmentShader: /* glsl */ `
        uniform sampler2D tSrc;
        uniform sampler2D tAdd;
        uniform vec2 uHalf;
        uniform float uAddW;
        varying vec2 vUv;
        void main() {
          vec2 h = uHalf;
          vec3 s = texture2D(tSrc, vUv + vec2(-h.x * 2.0, 0.0)).rgb;
          s += texture2D(tSrc, vUv + vec2(-h.x, h.y)).rgb * 2.0;
          s += texture2D(tSrc, vUv + vec2(0.0, h.y * 2.0)).rgb;
          s += texture2D(tSrc, vUv + vec2(h.x, h.y)).rgb * 2.0;
          s += texture2D(tSrc, vUv + vec2(h.x * 2.0, 0.0)).rgb;
          s += texture2D(tSrc, vUv + vec2(h.x, -h.y)).rgb * 2.0;
          s += texture2D(tSrc, vUv + vec2(0.0, -h.y * 2.0)).rgb;
          s += texture2D(tSrc, vUv + vec2(-h.x, -h.y)).rgb * 2.0;
          gl_FragColor = vec4(s / 12.0 + texture2D(tAdd, vUv).rgb * uAddW, 1.0);
        }`,
      depthTest: false, depthWrite: false,
    });
    this.quad = new FullScreenQuad(this.prefilter);
    this.sizes = [];
  }

  setSize(width, height) {
    let w = Math.max(1, Math.ceil(width / 2)), h = Math.max(1, Math.ceil(height / 2));
    this.fullTexel = new THREE.Vector2(1 / width, 1 / height);
    this.sizes.length = 0;
    for (let i = 0; i < this.levels; i++) {
      this.down[i].setSize(w, h);
      if (i < this.levels - 1) this.up[i].setSize(w, h);
      this.sizes.push([w, h]);
      w = Math.max(1, Math.ceil(w / 2)); h = Math.max(1, Math.ceil(h / 2));
    }
  }

  render(renderer, writeBuffer, readBuffer) {
    const q = this.quad;
    // bright-pass + downsample to half res
    this.prefilter.uniforms.tSrc.value = readBuffer.texture;
    this.prefilter.uniforms.uTexel.value.copy(this.fullTexel);
    q.material = this.prefilter;
    renderer.setRenderTarget(this.down[0]);
    q.render(renderer);
    // down chain
    q.material = this.downMat;
    for (let i = 1; i < this.levels; i++) {
      const [sw, sh] = this.sizes[i - 1];
      this.downMat.uniforms.tSrc.value = this.down[i - 1].texture;
      this.downMat.uniforms.uHalf.value.set(0.5 / sw, 0.5 / sh);
      renderer.setRenderTarget(this.down[i]);
      q.render(renderer);
    }
    // up chain, accumulating every level
    q.material = this.upMat;
    for (let i = this.levels - 2; i >= 0; i--) {
      const src = i === this.levels - 2 ? this.down[i + 1] : this.up[i + 1];
      const [sw, sh] = this.sizes[i + 1];
      this.upMat.uniforms.tSrc.value = src.texture;
      this.upMat.uniforms.tAdd.value = this.down[i].texture;
      this.upMat.uniforms.uHalf.value.set(0.5 / sw, 0.5 / sh);
      renderer.setRenderTarget(this.up[i]);
      q.render(renderer);
    }
  }

  dispose() {
    for (const t of [...this.down, ...this.up]) t.dispose();
    this.prefilter.dispose(); this.downMat.dispose(); this.upMat.dispose(); this.quad.dispose();
  }
}
