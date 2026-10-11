// Scroll-story scaffold for the 3D tree prototype (throwaway spike; the site port lives in src/components/story).
// Scene contract: createScene({ canvas, reducedMotion, isMobile, chapters, logoUrl }) -> { resize(w, h, dpr), render(t, p) }.
// The tree scene runs a 9-beat timeline (s = p * 9). The 4 service pillars are
// laid over that timeline in lifecycle order, each owning the scene beats that tell its story:
//   We advise  (Consultancy)        s 1-3  seed opens, first shoot, data streams reach the decision node
//   We build   (Software)           s 3-4  modules assemble along the branch
//   We operate (Managed Services)   s 4-6  24-hour dial, then the GrowShield canopy shell
//   We market  (Digital Marketing)  s 6-8  results ripen as fruit, the canopy fills in
// Debug URL params: ?p=0.42 freezes progress, ?debug=1 shows fps.

const S = 9; // scene beats

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// Map story progress p (0..1) to scene beat i (0..8) and local t (0..1 within that beat).
export function segment(p, n = S) {
  const s = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(s));
  return { i, t: clamp(s - i) };
}

export const CHAPTERS4 = [
  {
    id: "intro", span: [0, 1], kicker: "Technology & growth partner",
    title: "It's time to <em>grow</em>.",
    lead: "Four pillars, one accountable team: we advise, build, operate and market the systems your growth depends on.",
    chips: [], hint: "Scroll to begin the journey",
  },
  {
    id: "consultancy", span: [1, 3], role: "We advise", name: "Consultancy", full: "Consultancy & Digital Transformation",
    title: "Direction you can take to the <em>board</em>.",
    lead: "Where to invest in digital, and in what order. Strategy, governance and industry advice across 17 services.",
    beats: ["Strategy & transformation", "Data & AI strategy"],
    chips: ["Digital Transformation", "Data & AI Strategy", "PMO", "Cybersecurity Consultancy"],
  },
  {
    id: "software-development", span: [3, 4], role: "We build", name: "Software", full: "Software Development",
    title: "Software people <em>finish</em> using.",
    lead: "Mobile, web, business applications and AI, plus our own products for the sectors we know best.",
    chips: ["Mobile Development", "Web Development", "Application Development", "Artificial Intelligence"],
  },
  {
    id: "managed-services", span: [4, 6], role: "We operate", name: "Managed Services", full: "GrowShield™ Managed Services",
    title: "IT operations you can <em>hand over</em>.",
    lead: "Protection, stability and proactive support across ten service areas, fully, partially or co-managed.",
    beats: ["Around-the-clock operations", "Protected by GrowShield™"],
    chips: ["Service Desk", "Cloud Operations", "Cybersecurity Operations", "Infrastructure & Data Center"],
  },
  {
    id: "digital-marketing", span: [6, 8], role: "We market", name: "Digital Marketing", full: "Digital Marketing",
    title: "Growth you can <em>measure</em>.",
    lead: "Presence, leads and sales growth, with Starter, Growth and Premium packages to match your stage.",
    beats: ["Leads and sales that ripen", "A presence that keeps growing"],
    chips: ["Paid Media", "Social Media Management", "Search & Website", "Analytics & Reporting"],
  },
  {
    id: "finale", span: [8, 9],
    title: "Advise. Build.<br>Operate. <em>Market</em>.",
    lead: "Four pillars and one accountable team for organizations across KSA and the UAE.",
    chips: [], cta: "Start the conversation",
  },
];

const chapterAt = (s) => {
  const i = CHAPTERS4.findIndex((c) => s < c.span[1]);
  return i === -1 ? CHAPTERS4.length - 1 : i;
};

function panelHTML(c, i) {
  const eyebrow = c.role
    ? `<p class="eyebrow">${c.role} <span>— ${c.full}</span></p>`
    : c.kicker ? `<p class="eyebrow">${c.kicker}</p>` : "";
  const heading = i === 0 ? `<h1>${c.title}</h1>` : `<h2>${c.title}</h2>`;
  const beats = c.beats ? `<p class="beat">${c.beats.map((b, k) => `<span data-k="${k}">${k + 1}/${c.beats.length} · ${b}</span>`).join("")}</p>` : "";
  const chips = c.chips.length ? `<ul class="chips">${c.chips.map((x) => `<li>${x}</li>`).join("")}</ul>` : "";
  const tail = c.hint ? `<p class="hint">${c.hint} ↓</p>`
    : c.cta ? `<a class="cta" href="#">${c.cta} →</a>`
    : `<a class="link" href="#">Explore ${c.name} →</a>`;
  const logo = c.id === "finale" ? `<div class="finale-logo" role="img" aria-label="grow digital"></div>` : "";
  return `<article class="panel" data-i="${i}">${logo}${eyebrow}${heading}${beats}<p class="lead">${c.lead}</p>${chips}${tail}</article>`;
}

export async function initStory({ createScene }) {
  const params = new URLSearchParams(location.search);
  const frozenP = params.has("p") ? clamp(parseFloat(params.get("p")) || 0) : null;
  const debug = params.has("debug");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = matchMedia("(max-width: 767px)").matches;
  const N = CHAPTERS4.length;

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="proto-bar">
      <a class="proto-logo" href="index.html" aria-label="grow digital — prototypes"></a>
      <nav class="proto-switch" aria-label="Prototypes">
        <a href="tree.html" aria-current="page">Tree</a><a href="nav-mega-menu.html">Navigation</a>
      </nav>
    </header>
    <section class="story" id="story" style="height:${S * 105 + 100}vh">
      <div class="stage">
        <canvas id="gl" aria-hidden="true"></canvas>
        <div class="panels">${CHAPTERS4.map(panelHTML).join("")}</div>
        <nav class="rail" aria-label="Pillars">
          ${CHAPTERS4.slice(1, N - 1).map((c, k) => `<button data-i="${k + 1}"><span class="name">${c.role} · ${c.name}</span><span class="dot"></span></button>`).join("")}
        </nav>
        <div class="progress"></div>
      </div>
    </section>
    <section class="after"><div><h3>End of the tree prototype</h3><p>The rest of the homepage continues here.</p></div></section>
    ${debug ? '<div class="debug" id="dbg">…</div>' : ""}
  `);

  const story = document.getElementById("story");
  const canvas = document.getElementById("gl");
  const panels = [...document.querySelectorAll(".panel")];
  const beatEls = panels.map((el) => [...el.querySelectorAll(".beat span")]);
  const railBtns = [...document.querySelectorAll(".rail button")];
  const bar = document.querySelector(".progress");
  const dbg = document.getElementById("dbg");

  let lenis = null;
  if (!reducedMotion && frozenP === null && window.Lenis) lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });

  const range = () => story.offsetHeight - innerHeight;
  const storyTop = () => story.getBoundingClientRect().top + scrollY;
  const readProgress = () => (frozenP !== null ? frozenP : clamp((scrollY - storyTop()) / range()));
  // land on the first scene beat of a pillar (its camera hold), not on a transition
  const scrollToChapter = (i) => {
    const y = storyTop() + ((CHAPTERS4[i].span[0] + 0.5) / S) * range();
    lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  };
  railBtns.forEach((b) => b.addEventListener("click", () => scrollToChapter(+b.dataset.i)));

  let scene;
  try {
    scene = await createScene({ canvas, reducedMotion, isMobile, chapters: CHAPTERS4, logoUrl: "shared/logo-paper.png" });
  } catch (err) {
    console.error("Scene failed to initialise", err);
    document.querySelector(".stage").insertAdjacentHTML("beforeend", '<p style="position:absolute;right:24px;bottom:24px;color:#8fcdc6">WebGL unavailable — static fallback would show here.</p>');
    return;
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    scene.resize(canvas.clientWidth, canvas.clientHeight, dpr);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const FADE = 0.16; // in scene beats
  function updatePanels(p) {
    const s = p * S;
    panels.forEach((el, i) => {
      const [a, b] = CHAPTERS4[i].span;
      let o = 0;
      if (s > a - 0.02 && s < b + 0.02) {
        const fadeIn = i === 0 ? 1 : clamp((s - a) / FADE);
        const fadeOut = i === N - 1 ? 1 : clamp((b - s) / FADE);
        o = Math.min(fadeIn, fadeOut);
      }
      el.style.opacity = o.toFixed(3);
      el.style.translate = `0 ${((1 - o) * (s < (a + b) / 2 ? 24 : -24)).toFixed(1)}px`;
      el.classList.toggle("is-active", o > 0.5);
      beatEls[i].forEach((sp, k) => sp.classList.toggle("on", Math.min(beatEls[i].length - 1, Math.floor(s - a)) === k));
    });
    const i = chapterAt(s);
    railBtns.forEach((b) => b.classList.toggle("is-active", +b.dataset.i === i));
    bar.style.width = `${(p * 100).toFixed(2)}%`;
  }

  let smoothP = readProgress();
  let frames = 0, last = performance.now(), fpsAcc = 0, fpsFrames = 0;
  function tick(now) {
    if (lenis) lenis.raf(now);
    const target = readProgress();
    smoothP = frozenP !== null || reducedMotion ? target : lerp(smoothP, target, 0.12);
    updatePanels(smoothP);
    scene.render(now / 1000, smoothP);
    frames++;
    if (frames === 3) window.__sceneReady = true;
    if (dbg) {
      fpsAcc += now - last; fpsFrames++;
      if (fpsAcc > 500) { dbg.textContent = `${Math.round((fpsFrames * 1000) / fpsAcc)} fps · p=${smoothP.toFixed(3)} · s=${(smoothP * S).toFixed(2)} · ${CHAPTERS4[chapterAt(smoothP * S)].id}`; fpsAcc = 0; fpsFrames = 0; }
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
