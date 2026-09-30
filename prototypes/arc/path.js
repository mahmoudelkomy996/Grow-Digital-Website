// "The smile path" — geometry of the journey.
// Macro shape: one big smile arc (R=60, ±70°) lying in a plane tilted ALPHA from horizontal, so the
// finale camera (front, above) reads it as a U. Micro shape: 8 chained smile arcs (circular dips in -Y)
// meeting at softly filleted cusps; stations 1..7 sit on those cusps. Station coordinate x ∈ [0, 8].
import * as THREE from "three";

const D2R = Math.PI / 180;
export const R = 60;
export const ALPHA = 22 * D2R;
export const TH0 = 70 * D2R;         // x=0 is the right arm (travel runs right -> left in the finale view)
export const DTH = 17.5 * D2R;
export const CHORD = R * DTH;        // ~18.3 units between stations
export const SAG = CHORD * 0.34;     // smile depth (logo-like proportion)
const EPS = 0.3;                     // cusp fillet
const RHO = (CHORD * CHORD / 4 + SAG * SAG) / (2 * SAG);
const BASE = Math.sqrt(RHO * RHO - CHORD * CHORD / 4);
export const X0 = 0.03, X1 = 8 - 0.03; // tube extents (symmetric smile ends)

const VX = new THREE.Vector3(1, 0, 0);
const VV = new THREE.Vector3(0, Math.sin(ALPHA), -Math.cos(ALPHA));
const Y = new THREE.Vector3(0, 1, 0);

export function macro(x, out) {
  const th = TH0 - x * DTH;
  return out.copy(VX).multiplyScalar(R * Math.sin(th)).addScaledVector(VV, R * (1 - Math.cos(th)));
}

export function dip(x) {
  const j = Math.min(7, Math.max(0, Math.floor(x)));
  const f = x - j;
  let e = CHORD / 2 - Math.abs((f - 0.5) * CHORD);
  const interior = f < 0.5 ? j > 0 : j < 7;
  if (interior && e < 2 * EPS) e = (e * e) / (4 * EPS) + EPS;
  const xs = CHORD / 2 - e;
  return -(Math.sqrt(Math.max(0, RHO * RHO - xs * xs)) - BASE);
}

// The first smile (x in [0,1], the intro hero) is a true planar arc: it hangs off its own straight chord,
// perpendicular to it, so a camera facing its plane sees a symmetric U like the logo. Near cusp 1 it blends
// back to the regular construction (macro arc + vertical dip) so the path stays smooth.
const _c0 = new THREE.Vector3(), _c1 = new THREE.Vector3();
macro(0, _c0); macro(1, _c1);
const CH0 = _c1.clone().sub(_c0).normalize();
const UP0 = Y.clone().addScaledVector(CH0, -Y.dot(CH0)).normalize();
const _m = new THREE.Vector3(), _u = new THREE.Vector3(), _p2 = new THREE.Vector3();
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

export function point(x, out) {
  macro(x, out);
  const d = dip(x);
  if (x < 1) {
    const w = sstep(0.86, 1.0, x);
    _m.copy(_c0).lerp(_c1, x);
    out.lerp(_m, 1 - w);
    _u.copy(UP0).lerp(Y, w).normalize();
    return out.addScaledVector(_u, d);
  }
  out.y += d;
  return out;
}

// point on the path while the finale relaxes the dips (sm = 0 dipped .. 1 pure macro arc)
export function pointSm(x, sm, out) {
  point(x, out);
  macro(x, _p2);
  return out.lerp(_p2, sm);
}

const _a = new THREE.Vector3(), _b = new THREE.Vector3();
export function tangent(x, out) {
  point(x + 1e-3, _a); point(x - 1e-3, _b);
  return out.subVectors(_a, _b).normalize();
}
export function tangentSm(x, sm, out) {
  pointSm(x + 1e-3, sm, _a); pointSm(x - 1e-3, sm, _b);
  return out.subVectors(_a, _b).normalize();
}
export function macroTangent(x, out) {
  macro(x + 1e-3, _a); macro(x - 1e-3, _b);
  return out.subVectors(_a, _b).normalize();
}
export function leftOf(T, out) { return out.crossVectors(Y, T).normalize(); }

// Sampled table: x -> arc length s
export function buildTable(perUnit = 280) {
  const n = Math.round((X1 - X0) * perUnit) + 1;
  const xs = new Float32Array(n), ss = new Float32Array(n);
  const p = new THREE.Vector3(), q = new THREE.Vector3();
  let s = 0;
  for (let i = 0; i < n; i++) {
    const x = X0 + ((X1 - X0) * i) / (n - 1);
    point(x, p);
    if (i > 0) s += p.distanceTo(q);
    xs[i] = x; ss[i] = s; q.copy(p);
  }
  const sAt = (x) => {
    const u = ((Math.min(X1, Math.max(X0, x)) - X0) / (X1 - X0)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(u));
    return ss[i] + (ss[i + 1] - ss[i]) * (u - i);
  };
  return { n, xs, ss, sAt, length: s };
}

// Tube with a per-vertex centreline so the radius is a uniform (thick intro smile -> thin thread -> thick finale).
// aMacro / aMacroN carry the same ring on the macro arc (no dips) so the finale can relax into one clean U.
export function buildTubeGeometry(table, radial = 16) {
  const { n, xs, ss } = table;
  const count = n * radial;
  const center = new Float32Array(count * 3), normal = new Float32Array(count * 3), aS = new Float32Array(count);
  const mcen = new Float32Array(count * 3), mnrm = new Float32Array(count * 3);
  const p = new THREE.Vector3(), T = new THREE.Vector3(), B1 = new THREE.Vector3(), B2 = new THREE.Vector3(), nn = new THREE.Vector3();
  const m = new THREE.Vector3(), Tm = new THREE.Vector3(), M1 = new THREE.Vector3(), M2 = new THREE.Vector3(), mn = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    point(xs[i], p); tangent(xs[i], T);
    macro(xs[i], m); macroTangent(xs[i], Tm);
    B1.crossVectors(T, Y).normalize(); B2.crossVectors(B1, T).normalize();
    M1.crossVectors(Tm, Y).normalize(); M2.crossVectors(M1, Tm).normalize();
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      nn.copy(B1).multiplyScalar(ca).addScaledVector(B2, sa);
      mn.copy(M1).multiplyScalar(ca).addScaledVector(M2, sa);
      const k = i * radial + j;
      center[k * 3] = p.x; center[k * 3 + 1] = p.y; center[k * 3 + 2] = p.z;
      normal[k * 3] = nn.x; normal[k * 3 + 1] = nn.y; normal[k * 3 + 2] = nn.z;
      mcen[k * 3] = m.x; mcen[k * 3 + 1] = m.y; mcen[k * 3 + 2] = m.z;
      mnrm[k * 3] = mn.x; mnrm[k * 3 + 1] = mn.y; mnrm[k * 3 + 2] = mn.z;
      aS[k] = ss[i];
    }
  }
  const idx = new Uint32Array((n - 1) * radial * 6);
  let o = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = (i + 1) * radial + j, d = (i + 1) * radial + ((j + 1) % radial);
      idx[o++] = a; idx[o++] = c; idx[o++] = b;
      idx[o++] = b; idx[o++] = c; idx[o++] = d;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(center.slice(), 3));
  g.setAttribute("aCenter", new THREE.BufferAttribute(center, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  g.setAttribute("aMacro", new THREE.BufferAttribute(mcen, 3));
  g.setAttribute("aMacroN", new THREE.BufferAttribute(mnrm, 3));
  g.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

// Vertical "energy stem" (local +Y, 0..len) sharing the tube shader; aS = height, so the path's flow pulses
// continue up from the cusp (the material offsets s by the cusp's arc length).
export function buildStemGeometry(len, radial = 10, rings = 40) {
  const count = (rings + 1) * radial;
  const center = new Float32Array(count * 3), normal = new Float32Array(count * 3), aS = new Float32Array(count);
  for (let i = 0; i <= rings; i++) {
    const y = (len * i) / rings;
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2, k = i * radial + j;
      center[k * 3 + 1] = y;
      normal[k * 3] = Math.cos(a); normal[k * 3 + 2] = Math.sin(a);
      aS[k] = y;
    }
  }
  const idx = [];
  for (let i = 0; i < rings; i++) for (let j = 0; j < radial; j++) {
    const a = i * radial + j, b = i * radial + ((j + 1) % radial), c = (i + 1) * radial + j, d = (i + 1) * radial + ((j + 1) % radial);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(center.slice(), 3));
  g.setAttribute("aCenter", new THREE.BufferAttribute(center, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  g.setAttribute("aMacro", new THREE.BufferAttribute(center.slice(), 3));
  g.setAttribute("aMacroN", new THREE.BufferAttribute(normal.slice(), 3));
  g.setAttribute("aS", new THREE.BufferAttribute(aS, 1));
  g.setIndex(idx);
  return g;
}

// Hemisphere cap (dome along +Y in local space) sharing the tube shader.
export function buildCapGeometry() {
  const g = new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const n = g.attributes.position.count;
  g.setAttribute("aCenter", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("aMacro", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("aMacroN", new THREE.BufferAttribute(g.attributes.normal.array.slice(), 3));
  g.setAttribute("aS", new THREE.BufferAttribute(new Float32Array(n), 1));
  return g;
}
