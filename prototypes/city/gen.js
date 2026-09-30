// Procedural layout for "A city in the making" — pure data, deterministic (seeded PRNG).
// Masterplan: orthogonal block grid + central roundabout plaza + ring road + four diagonal avenues,
// a dense core inside the ring and satellite districts outside it (revealed in the GROW chapter).
// Desktop and mobile share ONE layout: mobile keeps the whole core and a seeded subsample of the satellites.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const B = 5.2;            // block pitch (road centreline spacing)
export const INNER = 4.0;        // usable block interior
export const PLAZA = 6.4;        // central roundabout radius
export const RING = 30;          // ring road radius
const EDGE = 0.5;                // road half width (edge lines)
const RING_W = 0.6;

// Landmark sites (block centres). Heights are the tops used for beacons.
export const LANDMARKS = {
  spire: { x: 0, z: 0, h: 44, beaconY: 41.9, hubY: 33 },
  arch: { x: -15.6, z: 5.2, h: 30, beaconY: 23.4, hubY: 26, rot: (60 * Math.PI) / 180 }, // U faces the BUILD/OPERATE/finale cameras
  twist: { x: 15.6, z: -10.4, h: 26, beaconY: 26.2, hubY: 25 },
};

export function generateCity({ isMobile, seed = 20240917 }) {
  const rand = mulberry32(seed);
  const RMAX = 60;
  const K = Math.ceil(RMAX / B) + 1;

  // Satellite district blobs for the expansion ring
  const blobs = [];
  const nb = 8;
  for (let k = 0; k < nb; k++) {
    const a = (k / nb) * Math.PI * 2 + 0.35 + (rand() - 0.5) * 0.35;
    const r = 40 + rand() * 13;
    blobs.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 6 + rand() * 3.5, a: 0.8 + rand() * 0.2 });
  }
  const density = (x, z) => {
    let d = 0.1;
    for (const b of blobs) {
      const dd = (x - b.x) ** 2 + (z - b.z) ** 2;
      d = Math.max(d, b.a * Math.exp(-dd / (2 * b.s * b.s)));
    }
    const diag = Math.abs(Math.abs(x) - Math.abs(z)) / Math.SQRT2;
    d = Math.max(d, 0.5 * Math.exp(-(diag * diag) / (2 * 4 * 4)));
    return d;
  };

  const landmarkBlocks = new Set(["-3,1", "3,-2"]);
  const buildings = [];

  for (let i = -K; i <= K; i++) {
    for (let j = -K; j <= K; j++) {
      const cx = i * B, cz = j * B, r = Math.hypot(cx, cz);
      if (Math.max(Math.abs(i), Math.abs(j)) <= 1) continue; // plaza
      if (landmarkBlocks.has(`${i},${j}`)) continue;
      if (Math.abs(i) === Math.abs(j)) continue;            // diagonal avenue parks
      if (r > RMAX - 1.5) continue;
      if (Math.abs(r - RING) < 2.8) continue;                // green belt along the ring road
      const kind = r < RING ? 0 : 1;
      let dens = 1;
      if (kind === 1) { dens = density(cx, cz); if (rand() > dens) continue; }
      const avenue = Math.abs(Math.abs(i) - Math.abs(j)) === 1;

      let nx, nz;
      const pick = rand();
      if (kind === 0) {
        const f = Math.exp(-r / 16);
        if (pick < 0.16 + 0.26 * f) { nx = 1; nz = 1; }
        else if (pick < 0.55) { nx = 2; nz = 1; }
        else if (pick < 0.9) { nx = 2; nz = 2; }
        else { nx = 3; nz = 2; }
      } else {
        if (pick < 0.3) { nx = 2; nz = 2; } else if (pick < 0.7) { nx = 3; nz = 2; } else { nx = 3; nz = 3; }
      }
      if (rand() < 0.5) { const tmp = nx; nx = nz; nz = tmp; }
      const gap = 0.3;
      const pw = (INNER - gap * (nx - 1)) / nx, pd = (INNER - gap * (nz - 1)) / nz;

      for (let a = 0; a < nx; a++) {
        for (let b = 0; b < nz; b++) {
          if (kind === 1 && rand() < 0.14) continue;
          const px = cx - INNER / 2 + pw / 2 + a * (pw + gap);
          const pz = cz - INNER / 2 + pd / 2 + b * (pd + gap);
          let bad = false;
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
            const qx = px + (sx * pw) / 2, qz = pz + (sz * pd) / 2;
            if (Math.abs(Math.abs(qx) - Math.abs(qz)) / Math.SQRT2 < 1.05) bad = true;
            const qr = Math.hypot(qx, qz);
            if (Math.abs(qr - RING) < 1.2) bad = true;
            if (qr < PLAZA + 1.0) bad = true;
          }
          if (bad) continue;
          const m1 = 0.08 + rand() * 0.22, m2 = 0.08 + rand() * 0.22;
          const w = pw - 2 * m1, d = pd - 2 * m2;
          const x = px + (rand() - 0.5) * 0.08, z = pz + (rand() - 0.5) * 0.08;
          const pr = Math.hypot(x, z);

          let h;
          if (kind === 0) {
            const f = Math.exp(-Math.pow(pr / 17, 1.5));
            h = 1.8 + 22 * f * (0.3 + 0.7 * Math.pow(rand(), 1.4)) + 2.2 * rand();
            if (nx * nz === 1) h *= 1.15;
            if (avenue) h *= 1.22;
            h = Math.min(h, 7.5 * Math.min(w, d) + 1.5);
          } else {
            const fall = 1 - ((pr - RING) / (RMAX - RING)) * 0.5;
            h = 1.2 + 4.2 * Math.pow(rand(), 2) + 13 * Math.pow(dens, 3) * rand() * fall;
            h = Math.min(h, 7 * Math.min(w, d) + 1);
          }

          const segs = [];
          const t = rand();
          if (h > 11 && t < 0.55) {
            const h1 = h * (0.45 + rand() * 0.15), h2 = h * (0.75 + rand() * 0.1);
            segs.push([0, h1, w, d]);
            segs.push([h1, h2 - h1, w * 0.78, d * 0.78]);
            segs.push([h2, h - h2, w * 0.56, d * 0.56]);
          } else if (h > 6 && t < 0.82) {
            const ph = 1.3 + rand() * 1.1;
            const tw = 0.56 + rand() * 0.2;
            segs.push([0, ph, w, d]);
            segs.push([ph, h - ph, w * tw, d * tw]);
          } else {
            segs.push([0, h, w, d]);
          }
          if (h > 14 && rand() < 0.45) {
            const last = segs[segs.length - 1];
            const ch = 1.2 + rand() * 2.2;
            segs.push([h, ch, last[2] * 0.45, last[3] * 0.45]);
            h += ch;
          }

          let riseDelay, solidDelay;
          if (kind === 0) {
            riseDelay = 0.42 * Math.min(1, pr / (RING - 2)) + 0.14 * rand();
            solidDelay = Math.min(0.45, 0.22 * rand() + 0.42 * Math.min(1, h / 24) + riseDelay * 0.3);
          } else {
            riseDelay = 0.52 * Math.min(1, (pr - RING) / (RMAX - RING)) + 0.06 * rand();
            solidDelay = Math.min(0.62, riseDelay + 0.06 + 0.06 * rand());
          }
          buildings.push({ x, z, w, d, h, kind, segs, riseDelay, solidDelay, target: 0, seed: rand() });
        }
      }
    }
  }

  // ---- Road network as blueprint edge lines ----
  // Each line piece: { a:[x,z], b:[x,z], ta, tb, delay, dur, kind, len } — kind 0 core road, 2 expansion road
  const lines = [];
  const roads = []; // traffic centrelines: { type:0, a, b } | { type:1, R }
  const ringIn = RING - RING_W, ringOut = RING + RING_W, rEnd = RMAX + 1;
  const classify = (r) => (r < PLAZA + EDGE + 0.05 ? -1 : r < ringIn ? 0 : r < ringOut ? -1 : r < rEnd ? 2 : -1);

  function gridLine(orient, c, k, isCentre) {
    const Lmax = Math.sqrt(Math.max(0, rEnd * rEnd - c * c));
    if (Lmax <= 0) return;
    const Lcore = Math.sqrt(Math.max(0, ringIn * ringIn - c * c));
    const step = 0.2;
    const pieces = [];
    let cur = null;
    for (let a = -Lmax; a < Lmax; a += step) {
      const mid = a + step / 2;
      const x = orient ? mid : c, z = orient ? c : mid;
      const r = Math.hypot(x, z);
      let cls = classify(r);
      if (!isCentre) {
        const nearest = (Math.round(mid / B - 0.5) + 0.5) * B;
        if (Math.abs(mid - nearest) < EDGE) cls = -1;
      }
      if (cur && cur.cls === cls) cur.b = Math.min(Lmax, a + step);
      else { if (cur && cur.cls >= 0) pieces.push(cur); cur = { cls, a, b: Math.min(Lmax, a + step) }; }
    }
    if (cur && cur.cls >= 0) pieces.push(cur);
    const delay = 0.36 * Math.min(1, Math.abs(k) / 6.5) + 0.05 * rand();
    for (const pc of pieces) {
      const A = orient ? [pc.a, c] : [c, pc.a];
      const Bp = orient ? [pc.b, c] : [c, pc.b];
      if (isCentre) { roads.push({ type: 0, a: A, b: Bp, kind: pc.cls }); continue; }
      let ta, tb, dl, du;
      if (pc.cls === 0) { ta = (pc.a + Lcore) / (2 * Lcore); tb = (pc.b + Lcore) / (2 * Lcore); dl = delay; du = 0.5; }
      else { ta = (Math.hypot(A[0], A[1]) - RING) / (RMAX - RING); tb = (Math.hypot(Bp[0], Bp[1]) - RING) / (RMAX - RING); dl = 0.03 * rand(); du = 0.85; }
      lines.push({ a: A, b: Bp, ta, tb, delay: dl, dur: du, kind: pc.cls, len: pc.cls === 0 ? 2 * Lcore : RMAX - RING });
    }
  }
  for (let k = -K; k < K; k++) {
    const c0 = (k + 0.5) * B;
    if (Math.abs(c0) > RMAX) continue;
    const kk = k + 0.5;
    for (const orient of [0, 1]) {
      gridLine(orient, c0 - EDGE, kk, false);
      gridLine(orient, c0 + EDGE, kk, false);
      gridLine(orient, c0, kk, true);
    }
  }
  // circles (plaza roundabout + ring road)
  function circle(R, kind, delay, dur, segs = 160) {
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2 - Math.PI / 2, a1 = ((s + 1) / segs) * Math.PI * 2 - Math.PI / 2;
      lines.push({ a: [Math.cos(a0) * R, Math.sin(a0) * R], b: [Math.cos(a1) * R, Math.sin(a1) * R], ta: s / segs, tb: (s + 1) / segs, delay, dur, kind, len: 2 * Math.PI * R });
    }
  }
  circle(PLAZA - EDGE, 0, 0.0, 0.3, 72);
  circle(PLAZA + EDGE, 0, 0.02, 0.3, 72);
  circle(ringIn, 0, 0.3, 0.55);
  circle(ringOut, 0, 0.34, 0.55);
  roads.push({ type: 1, R: PLAZA });
  roads.push({ type: 1, R: RING });
  // diagonal avenues
  for (let q = 0; q < 4; q++) {
    const ang = Math.PI / 4 + (q * Math.PI) / 2;
    const dx = Math.cos(ang), dz = Math.sin(ang), nx = -dz, nz = dx;
    const r0 = PLAZA + EDGE;
    for (const off of [-0.6, 0.6]) {
      const P = (r) => [dx * r + nx * off, dz * r + nz * off];
      lines.push({ a: P(r0), b: P(ringIn), ta: 0, tb: 1, delay: 0.06, dur: 0.42, kind: 0, len: ringIn - r0 });
      lines.push({ a: P(ringOut), b: P(rEnd), ta: 0, tb: (rEnd - RING) / (RMAX - RING), delay: 0.0, dur: 0.85, kind: 2, len: RMAX - RING });
    }
    roads.push({ type: 0, a: [dx * r0, dz * r0], b: [dx * ringIn, dz * ringIn], kind: 0 });
    roads.push({ type: 0, a: [dx * ringOut, dz * ringOut], b: [dx * rEnd, dz * rEnd], kind: 2 });
  }

  // ---- Plot outlines (blueprint) ----
  const plots = [];
  for (const b of buildings) {
    const pr = Math.hypot(b.x, b.z);
    const delay = b.kind === 0 ? 0.35 * Math.min(1, pr / RING) + 0.12 * rand() : 0.6 * Math.min(1, (pr - RING) / (RMAX - RING)) + 0.05 * rand();
    plots.push({ x: b.x, z: b.z, w: b.w, d: b.d, kind: b.kind === 0 ? 1 : 3, delay, dur: b.kind === 0 ? 0.3 : 0.3 });
  }

  // ---- Solve targets: 8 per hub, spread by sector ----
  const hubs = ["spire", "arch", "twist"].map((k) => LANDMARKS[k]);
  const solveLinks = [];
  hubs.forEach((hub, hi) => {
    for (let sct = 0; sct < 8; sct++) {
      let best = null, bestScore = -1;
      for (const b of buildings) {
        if (b.kind !== 0 || b.h < 6 || b.target) continue;
        const dx = b.x - hub.x, dz = b.z - hub.z, dist = Math.hypot(dx, dz);
        if (dist < 9 || dist > 30) continue;
        let a = Math.atan2(dz, dx) + Math.PI; // 0..2pi
        const sec = Math.floor((a / (Math.PI * 2)) * 8) % 8;
        if (sec !== sct) continue;
        const score = b.h + b.seed * 6;
        if (score > bestScore) { bestScore = score; best = b; }
      }
      if (best) { best.target = 1; solveLinks.push({ hub: hi, b: best, delay: 0.05 + 0.4 * rand() }); }
    }
  });

  // ---- Data districts (TRANSFORM) ----
  const nodes = [{ x: 0, z: 0 }];
  for (let k = 0; k < 8; k++) {
    const a = ((k + 0.5) * Math.PI) / 4 + (rand() - 0.5) * 0.25;
    const r = 13 + rand() * 9;
    nodes.push({ x: Math.cos(a) * r, z: Math.sin(a) * r });
  }
  const dataLinks = [];
  for (let k = 1; k <= 8; k++) dataLinks.push([0, k]);
  for (let k = 1; k <= 8; k++) dataLinks.push([k, (k % 8) + 1]);
  for (let k = 1; k <= 4; k++) dataLinks.push([k, ((k + 2) % 8) + 1]);

  // Mobile: the same city with fewer satellite towers. A separate PRNG keeps the shared sequence above untouched.
  if (isMobile) {
    const sub = mulberry32(seed ^ 0x5bd1e995);
    const keep = buildings.map((b) => b.kind === 0 || sub() < 0.26);
    return {
      RMAX, lines, roads, solveLinks, nodes, dataLinks, blobs,
      buildings: buildings.filter((_, k) => keep[k]), plots: plots.filter((_, k) => keep[k]),
    };
  }
  return { RMAX, buildings, lines, plots, roads, solveLinks, nodes, dataLinks, blobs };
}
